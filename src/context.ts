import type { Connection } from "./connection.ts";
import type { ConnectionRegistry } from "./registry.ts";
import { Targets, createTargets } from "./targets.ts";
import type { EventMap, Selector, SerializeFn } from "./types.ts";

/** @internal */
export interface CloseInfo {
  code: number;
  reason: string;
  wasClean: boolean;
}

/**
 * Concrete implementation of {@link Context}, {@link EventContext},
 * {@link ConnectContext}, and {@link CloseContext}.
 *
 * Constructed by `Plaza` during dispatch and passed to user handlers via the
 * narrower public interfaces. Not meant to be instantiated outside the
 * framework.
 *
 * @internal
 */
export class PlazaContext<State, Env, Events extends EventMap> {
  readonly kind: "message" | "task";
  readonly connection: Connection<State> | null;
  readonly event: string;
  readonly env: Env;
  readonly executionCtx: DurableObjectState;
  readonly code?: number;
  readonly reason?: string;
  readonly wasClean?: boolean;
  /** @internal */
  _valid: Record<string, unknown> = {};

  private readonly registry: ConnectionRegistry<State>;
  private readonly serialize: SerializeFn;
  private readonly _runTask: (name: string, payload: unknown) => Promise<void>;

  constructor(opts: {
    registry: ConnectionRegistry<State>;
    serialize: SerializeFn;
    connection: Connection<State> | null;
    event: string;
    env: Env;
    executionCtx: DurableObjectState;
    runTask: (name: string, payload: unknown) => Promise<void>;
    kind?: "message" | "task";
    closeInfo?: CloseInfo;
  }) {
    this.registry = opts.registry;
    this.serialize = opts.serialize;
    this.connection = opts.connection;
    this.event = opts.event;
    this.env = opts.env;
    this.executionCtx = opts.executionCtx;
    this._runTask = opts.runTask;
    this.kind = opts.kind ?? "message";
    if (opts.closeInfo) {
      this.code = opts.closeInfo.code;
      this.reason = opts.closeInfo.reason;
      this.wasClean = opts.closeInfo.wasClean;
    }
  }

  runTask(name: string, payload: unknown): Promise<void> {
    return this._runTask(name, payload);
  }

  emit(event: string, payload: unknown): void {
    createTargets<State, Env, Events>(this.registry, this.serialize).emit(
      event,
      payload,
    );
  }

  to(sel: Selector<State>): Targets<State, Env, Events> {
    return createTargets<State, Env, Events>(this.registry, this.serialize).to(
      sel,
    );
  }

  except(...conns: Connection<State>[]): Targets<State, Env, Events> {
    return createTargets<State, Env, Events>(
      this.registry,
      this.serialize,
    ).except(...conns);
  }

  valid(target: "json"): unknown {
    return this._valid[target];
  }
}
