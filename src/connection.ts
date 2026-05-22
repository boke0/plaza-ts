import type { ConnectionRegistry } from "./registry.ts";
import type { SerializeFn } from "./types.ts";

/**
 * Connection snapshot persisted to and restored from a hibernating WebSocket.
 *
 * Persisted through Cloudflare Durable Objects' `serializeAttachment`; Plaza
 * uses it to rebuild a {@link Connection} when the Durable Object wakes up.
 *
 * @typeParam State - Application-defined state type
 *
 * @public
 */
export interface PlazaAttachment<State> {
  /** Stable identifier of the connection. */
  id: string;
  /** Tags currently attached to the connection. */
  tags: string[];
  /** Channels the connection belongs to. */
  channels: string[];
  /** Snapshot of the application-defined state. */
  state: State;
}

/**
 * Thrown when a connection's serialized attachment exceeds the configured limit.
 *
 * Cloudflare Durable Objects impose a practical cap on `serializeAttachment`,
 * so Plaza guards against it using {@link PlazaOptions.maxAttachmentBytes}.
 *
 * @public
 */
export class PlazaAttachmentTooLargeError extends Error {
  /**
   * @param connectionId - Id of the connection whose attachment overflowed
   * @param bytes - Actual serialized size in bytes
   * @param limit - Configured size limit in bytes
   */
  constructor(
    readonly connectionId: string,
    readonly bytes: number,
    readonly limit: number,
  ) {
    super(
      `Plaza attachment for connection ${connectionId} is ${bytes} bytes (limit: ${limit}).`,
    );
    this.name = "PlazaAttachmentTooLargeError";
  }
}

interface WebSocketLike {
  send(data: string | ArrayBuffer | ArrayBufferView): void;
  close(code?: number, reason?: string): void;
  serializeAttachment?: (value: unknown) => void;
  deserializeAttachment?: () => unknown;
}

/**
 * Represents a single WebSocket connection.
 *
 * Plaza holds one `Connection` per active socket and uses `tag`, `channel`,
 * and `state` to classify and address connections.
 *
 * @typeParam State - Application-defined state type
 *
 * @remarks
 * `Connection` instances are not constructed by user code; you receive them
 * from a {@link Context} during dispatch.
 *
 * @public
 */
export class Connection<State = Record<string, unknown>> {
  /**
   * Stable identifier of the connection. Generation is configurable via
   * {@link PlazaOptions.idFactory}.
   */
  readonly id: string;

  /**
   * Application-defined metadata. Patch with {@link Connection.setState}.
   */
  state: State;

  /** @internal mutable set; publicly exposed as ReadonlySet via getter */
  private readonly _tags = new Set<string>();
  /** @internal */
  private readonly _channels = new Set<string>();
  /** @internal */
  _dirty = false;
  /** @internal */
  _alive = true;
  /** @internal */
  readonly _ws: WebSocketLike;
  /** @internal */
  private readonly _registry: ConnectionRegistry<State>;
  /** @internal */
  private readonly _serialize: SerializeFn;

  /** @internal */
  constructor(
    ws: WebSocketLike,
    id: string,
    state: State,
    registry: ConnectionRegistry<State>,
    serialize: SerializeFn,
  ) {
    this._ws = ws;
    this.id = id;
    this.state = state;
    this._registry = registry;
    this._serialize = serialize;
  }

  /**
   * Read-only view of the tags attached to this connection.
   */
  get tags(): ReadonlySet<string> {
    return this._tags;
  }

  /**
   * Read-only view of the channels this connection belongs to.
   */
  get channels(): ReadonlySet<string> {
    return this._channels;
  }

  /**
   * Attach a tag to this connection and index it in the registry.
   *
   * No-op when the tag is already present or the connection is closed.
   *
   * @param tag - Tag to attach
   */
  setTag(tag: string): void {
    if (!this._alive || this._tags.has(tag)) return;
    this._tags.add(tag);
    this._registry.indexTag(this, tag);
    this._dirty = true;
  }

  /**
   * Remove a tag from this connection and drop it from the index.
   *
   * No-op when the tag is not currently attached.
   *
   * @param tag - Tag to remove
   */
  removeTag(tag: string): void {
    if (!this._tags.delete(tag)) return;
    this._registry.unindexTag(this, tag);
    this._dirty = true;
  }

  /**
   * Join the connection to a channel and add it to the channel index.
   *
   * No-op when already joined or when the connection is closed.
   *
   * @param channel - Channel to join
   */
  joinChannel(channel: string): void {
    if (!this._alive || this._channels.has(channel)) return;
    this._channels.add(channel);
    this._registry.indexChannel(this, channel);
    this._dirty = true;
  }

  /**
   * Leave a channel and drop the connection from the channel index.
   *
   * No-op when the connection has not joined the channel.
   *
   * @param channel - Channel to leave
   */
  leaveChannel(channel: string): void {
    if (!this._channels.delete(channel)) return;
    this._registry.unindexChannel(this, channel);
    this._dirty = true;
  }

  /**
   * Patch `state` by shallow-merging the provided partial.
   *
   * Existing fields are preserved; only the keys present in `partial` are
   * overwritten.
   *
   * @param partial - Keys and values to merge in
   */
  setState(partial: Partial<State>): void {
    Object.assign(this.state as object, partial);
    this._dirty = true;
  }

  /**
   * Send an event to this single connection.
   *
   * If the send fails (for example, the underlying socket is already closed),
   * the connection is automatically dropped from the registry.
   *
   * @param event - Event name
   * @param payload - Arbitrary payload
   */
  emit(event: string, payload: unknown): void {
    if (!this._alive) return;
    try {
      this._ws.send(this._serialize(event, payload));
    } catch {
      this._dropFromRegistry();
    }
  }

  /**
   * Close the connection.
   *
   * The connection is removed from the registry immediately, so subsequent
   * `c.to({ tag })` / `c.emit()` calls in the same dispatch tick will not
   * target this socket. Idempotent with the later `webSocketClose` cleanup.
   *
   * @param code - WebSocket close code (default: `1000`, Normal Closure)
   * @param reason - Close reason string (default: empty string)
   */
  close(code = 1000, reason = ""): void {
    if (!this._alive) return;
    // Immediately unregister so subsequent c.to({tag}) / c.emit() within the
    // same dispatch tick can't target the closing connection. Idempotent with
    // the later webSocketClose cleanup.
    this._dropFromRegistry();
    try {
      this._ws.close(code, reason);
    } catch {
      // swallow — socket may already be gone
    }
  }

  /** @internal */
  _sendRaw(frame: string | ArrayBuffer): void {
    if (!this._alive) return;
    this._ws.send(frame);
  }

  /** @internal */
  _dropFromRegistry(): void {
    if (!this._alive) return;
    this._alive = false;
    this._registry.remove(this);
  }

  /** @internal */
  _buildAttachment(): PlazaAttachment<State> {
    return {
      id: this.id,
      tags: [...this._tags],
      channels: [...this._channels],
      state: this.state,
    };
  }

  /** @internal */
  _flushAttachment(maxBytes: number): void {
    if (!this._alive || !this._dirty) return;
    if (typeof this._ws.serializeAttachment !== "function") {
      this._dirty = false;
      return;
    }
    const att = this._buildAttachment();
    const json = JSON.stringify(att);
    if (json.length > maxBytes) {
      throw new PlazaAttachmentTooLargeError(this.id, json.length, maxBytes);
    }
    this._ws.serializeAttachment(att);
    this._dirty = false;
  }

  /** @internal */
  static _restore<S>(
    ws: WebSocketLike,
    attachment: PlazaAttachment<S>,
    registry: ConnectionRegistry<S>,
    serialize: SerializeFn,
  ): Connection<S> {
    const conn = new Connection<S>(
      ws,
      attachment.id,
      attachment.state,
      registry,
      serialize,
    );
    for (const t of attachment.tags) conn._tags.add(t);
    for (const ch of attachment.channels) conn._channels.add(ch);
    return conn;
  }
}
