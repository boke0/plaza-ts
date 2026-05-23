import { Connection } from "./connection.ts";
import { PlazaContext } from "./context.ts";
import { compose } from "./middleware.ts";
import { ConnectionRegistry } from "./registry.ts";
import { defaultDeserialize, defaultSerialize } from "./serializer.ts";
import type {
  CloseHandler,
  ConnectHandler,
  DeserializeFn,
  ErrorHandler,
  EventMap,
  Handler,
  Middleware,
  Prefix,
  SerializeFn,
  TaskHandler,
  ValidatorsOutput,
} from "./types.ts";
import type { Validator } from "./validator.ts";

interface RouteEntry<State, Env, Events extends EventMap> {
  middlewares: Middleware<State, Env, Events>[];
  validators: Validator<unknown>[];
  handler:
    | Handler<State, Env, unknown, Events>
    | TaskHandler<State, Env, unknown, Events>;
}

/**
 * Thrown / dispatched when a route is invoked through the wrong kind of entry
 * point: e.g. a client sends a name registered as a {@link Plaza.task | task},
 * or {@link Plaza.runTask} is called with a name registered as a
 * {@link Plaza.handle | handle}.
 *
 * @public
 */
export class PlazaKindMismatchError extends Error {
  /** Kind expected by the caller (e.g. `"message"` for incoming WS frames). */
  readonly expected: "message" | "task";
  /** Kind actually registered for `routeName`. */
  readonly actual: "message" | "task";
  /** Name of the route that was looked up. */
  readonly routeName: string;

  constructor(
    routeName: string,
    expected: "message" | "task",
    actual: "message" | "task",
  ) {
    super(
      `Plaza route "${routeName}" is registered as a ${actual}; expected a ${expected}.`,
    );
    this.name = "PlazaKindMismatchError";
    this.routeName = routeName;
    this.expected = expected;
    this.actual = actual;
  }
}

/**
 * Thrown when an event name has no registered route. Surfaces through
 * {@link Plaza.onError} on both the {@link Plaza.dispatch | client-message}
 * and {@link Plaza.runTask | server-task} paths; on the task path the
 * promise also rejects so callers can react.
 *
 * @public
 */
export class PlazaUnknownEventError extends Error {
  constructor(readonly eventName: string) {
    super(`Plaza event "${eventName}" is not registered.`);
    this.name = "PlazaUnknownEventError";
  }
}

/**
 * Options accepted by the {@link Plaza} constructor.
 *
 * @public
 */
export interface PlazaOptions {
  /**
   * Maximum byte size of the serialized attachment written via
   * `serializeAttachment` per connection.
   *
   * Exceeding the limit throws {@link PlazaAttachmentTooLargeError}.
   *
   * @defaultValue 2048
   */
  maxAttachmentBytes?: number;

  /**
   * Factory for generating connection ids.
   *
   * Defaults to `crypto.randomUUID()` and falls back to a time+random string
   * when the API is not available.
   *
   * @defaultValue `crypto.randomUUID`
   */
  idFactory?: () => string;
}

interface ResolvedOptions {
  maxAttachmentBytes: number;
  idFactory: () => string;
}

function defaultIdFactory(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Core class of the type-safe WebSocket framework.
 *
 * Offers event-name-based message dispatch, type-safe payload validation via
 * StandardSchema, Hono-like middleware, and connection management through
 * tags, channels, and state. Primarily targets Cloudflare Durable Objects.
 *
 * @typeParam State - Per-connection state type. Drives type inference for
 *                    `setState` and predicate-based targeting.
 * @typeParam Env - Environment bindings (`Env` of the Durable Object on Cloudflare).
 * @typeParam Events - Map of registered events. Extended by every call to `.on(...)`.
 *
 * @example
 * ```ts
 * import { Plaza, validator } from "plaza-ts";
 * import { z } from "zod";
 *
 * const plaza = new Plaza<{ role: string }>()
 *   .onConnect((c) => {
 *     c.emit("system", { message: "a user joined" });
 *   })
 *   .on(
 *     "greeting",
 *     validator(z.object({ channel: z.string(), message: z.string() })),
 *     (c) => {
 *       const { channel, message } = c.valid("json");
 *       c.to({ channel }).except(c.connection).emit("greeting", { message });
 *     }
 *   );
 * ```
 *
 * @public
 */
export class Plaza<
  State extends Record<string, unknown> = {},
  Env = unknown,
  Events extends EventMap = {},
  Tasks extends EventMap = {},
> {
  /** @internal phantom for InferEvents */
  declare readonly __events: Events;
  /** @internal phantom for InferState */
  declare readonly __state: State;
  /** @internal phantom for InferTasks */
  declare readonly __tasks: Tasks;

  /** @internal */
  readonly _routes = new Map<string, RouteEntry<State, Env, Events>>();
  /** @internal */
  readonly _pendingMiddlewares: Middleware<State, Env, Events>[] = [];
  /** @internal */
  readonly _connectHandlers: ConnectHandler<State, Env, Events>[] = [];
  /** @internal */
  readonly _closeHandlers: CloseHandler<State, Env, Events>[] = [];
  /** @internal */
  readonly _errorHandlers: ErrorHandler<State, Env, Events>[] = [];
  /** @internal */
  _serialize: SerializeFn = defaultSerialize;
  /** @internal */
  _deserialize: DeserializeFn = defaultDeserialize;
  /** @internal */
  readonly _registry = new ConnectionRegistry<State>();
  /** @internal */
  readonly _options: ResolvedOptions;

  /**
   * @param options - {@link PlazaOptions} to customize behavior
   */
  constructor(options: PlazaOptions = {}) {
    this._options = {
      maxAttachmentBytes: options.maxAttachmentBytes ?? 2048,
      idFactory: options.idFactory ?? defaultIdFactory,
    };
  }

  /**
   * Register a middleware that runs before every event handler.
   *
   * If `next()` is not called, subsequent middlewares and the handler are
   * skipped. Registered on the root Plaza, the middleware applies to every
   * event; registered on a sub-Plaza, it only applies to events declared on
   * that sub-Plaza.
   *
   * @param mw - Middleware to register
   * @returns This instance (for chaining)
   *
   * @example
   * ```ts
   * plaza.use(async (c, next) => {
   *   console.log(`[${c.connection.id}] ${c.event}`);
   *   await next();
   * });
   * ```
   */
  use(mw: Middleware<State, Env, Events>): this {
    this._pendingMiddlewares.push(mw);
    return this;
  }

  /**
   * Replace the function that encodes outgoing frames.
   *
   * Effective only on the root Plaza; calling it on a sub-Plaza has no effect.
   *
   * @param fn - {@link SerializeFn}
   * @returns This instance (for chaining)
   */
  serialize(fn: SerializeFn): this {
    this._serialize = fn;
    return this;
  }

  /**
   * Replace the function that decodes incoming frames.
   *
   * Effective only on the root Plaza; calling it on a sub-Plaza has no effect.
   *
   * @param fn - {@link DeserializeFn}
   * @returns This instance (for chaining)
   */
  deserialize(fn: DeserializeFn): this {
    this._deserialize = fn;
    return this;
  }

  /**
   * Register a handler to run immediately after a WebSocket connects.
   *
   * Multiple registrations are invoked in registration order.
   *
   * @param handler - {@link ConnectHandler}
   * @returns This instance (for chaining)
   */
  onConnect(handler: ConnectHandler<State, Env, Events>): this {
    this._connectHandlers.push(handler);
    return this;
  }

  /**
   * Register a handler to run immediately after a connection closes.
   *
   * The handler can read `code`, `reason`, and `wasClean` from the context.
   *
   * @param handler - {@link CloseHandler}
   * @returns This instance (for chaining)
   */
  onClose(handler: CloseHandler<State, Env, Events>): this {
    this._closeHandlers.push(handler);
    return this;
  }

  /**
   * Register a handler that captures exceptions thrown from handlers or
   * middleware.
   *
   * Whether to propagate the error back to the caller (e.g. let
   * {@link Plaza.runTask} reject so a Durable Object alarm retries) is up to
   * the registered handler — if it returns normally the error is considered
   * handled and swallowed; if it `throw`s, the throw propagates. When no
   * handler is registered the error propagates as-is.
   *
   * @param handler - {@link ErrorHandler}
   * @returns This instance (for chaining)
   */
  onError(handler: ErrorHandler<State, Env, Events>): this {
    this._errorHandlers.push(handler);
    return this;
  }

  /**
   * Register a handler for a client-originated WebSocket message.
   *
   * Validators are optional and may be passed in any number. When multiple
   * validators are provided their outputs are merged and surfaced through
   * `c.valid("json")` with full type inference.
   *
   * @typeParam K - Event name (inferred as a string literal)
   * @typeParam V - Tuple of {@link Validator}s
   * @typeParam P - Intersection of validator outputs (the payload type)
   * @param event - Event name to handle
   * @param args - Zero or more validators followed by a final {@link Handler}
   * @returns A new Plaza type with the event added (for chaining)
   *
   * @example
   * ```ts
   * plaza.handle(
   *   "join",
   *   validator(z.object({ channel: z.string() })),
   *   (c) => {
   *     const { channel } = c.valid("json");
   *     c.connection.joinChannel(channel);
   *   }
   * );
   * ```
   */
  handle<
    K extends string,
    const V extends readonly Validator<any>[],
    P = ValidatorsOutput<V>,
  >(
    event: K,
    ...args: [...V, Handler<State, Env, P, Events & Record<K, P>>]
  ): Plaza<State, Env, Events & Record<K, P>, Tasks>;
  handle<K extends string>(
    event: K,
    handler: Handler<State, Env, unknown, Events & Record<K, unknown>>,
  ): Plaza<State, Env, Events & Record<K, unknown>, Tasks>;
  handle(event: string, ...args: unknown[]): unknown {
    const userHandler = args.pop() as Handler<State, Env, unknown, Events>;
    const validators = args as Validator<unknown>[];
    const guarded: Handler<State, Env, unknown, Events> = (c) => {
      if (c.kind !== "message") {
        throw new PlazaKindMismatchError(event, c.kind, "message");
      }
      return userHandler(c);
    };
    this._routes.set(event, {
      middlewares: [],
      validators,
      handler: guarded,
    });
    return this as unknown;
  }

  /**
   * Register a handler for a server-side task.
   *
   * Tasks are dispatched via {@link Plaza.runTask} (or {@link MessageContext.runTask}
   * inside a handler). Unlike {@link Plaza.handle}, tasks cannot be triggered
   * by clients — the route map records the kind and rejects cross-kind
   * dispatch.
   *
   * Validators behave identically to {@link Plaza.handle}.
   *
   * @typeParam K - Task name (inferred as a string literal)
   * @typeParam V - Tuple of {@link Validator}s
   * @typeParam P - Intersection of validator outputs (the payload type)
   * @param event - Task name to handle
   * @param args - Zero or more validators followed by a final
   * {@link TaskHandler}
   * @returns A new Plaza type with the task added (for chaining)
   *
   * @example
   * ```ts
   * plaza.task(
   *   "cleanup",
   *   validator(z.object({ olderThan: z.number() })),
   *   (c) => {
   *     c.to({ channel: "all" }).emit("system", { kind: "cleanup" });
   *   },
   * );
   * ```
   */
  task<
    K extends string,
    const V extends readonly Validator<any>[],
    P = ValidatorsOutput<V>,
  >(
    event: K,
    ...args: [...V, TaskHandler<State, Env, P, Events>]
  ): Plaza<State, Env, Events, Tasks & Record<K, P>>;
  task<K extends string>(
    event: K,
    handler: TaskHandler<State, Env, unknown, Events>,
  ): Plaza<State, Env, Events, Tasks & Record<K, unknown>>;
  task(event: string, ...args: unknown[]): unknown {
    const userHandler = args.pop() as TaskHandler<State, Env, unknown, Events>;
    const validators = args as Validator<unknown>[];
    const guarded: TaskHandler<State, Env, unknown, Events> = (c) => {
      if (c.kind !== "task") {
        throw new PlazaKindMismatchError(event, c.kind, "task");
      }
      return userHandler(c);
    };
    this._routes.set(event, {
      middlewares: [],
      validators,
      handler: guarded,
    });
    return this as unknown;
  }

  /**
   * Deprecated alias for {@link Plaza.handle}.
   *
   * @deprecated Use {@link Plaza.handle} instead. `.on()` will be removed in a
   * future release.
   */
  on<
    K extends string,
    const V extends readonly Validator<any>[],
    P = ValidatorsOutput<V>,
  >(
    event: K,
    ...args: [...V, Handler<State, Env, P, Events & Record<K, P>>]
  ): Plaza<State, Env, Events & Record<K, P>, Tasks>;
  on<K extends string>(
    event: K,
    handler: Handler<State, Env, unknown, Events & Record<K, unknown>>,
  ): Plaza<State, Env, Events & Record<K, unknown>, Tasks>;
  on(event: string, ...args: unknown[]): unknown {
    return (this.handle as (e: string, ...a: unknown[]) => unknown)(
      event,
      ...args,
    );
  }

  /**
   * Merge another `Plaza` instance into this one.
   *
   * Event handlers, middleware, and lifecycle hooks declared on the sub-Plaza
   * are absorbed by the parent. The sub-Plaza's `.use(...)` applies only to
   * the events it owns.
   *
   * Pass a `prefix` to namespace the sub-Plaza's event names as
   * `prefix + event`. The separator is not enforced, so any convention is
   * allowed.
   *
   * Connections remain a single shared resource: tag, channel, and state
   * indexes — and `c.to(...)` targeting — span the entire merged graph.
   *
   * @returns A new Plaza type composed with the merged events (for chaining)
   *
   * @example
   * ```ts
   * const auth = new Plaza().use(rateLimit).on("login", ...);
   * const chat = new Plaza().use(requireAuth).on("message", ...);
   *
   * const app = new Plaza()
   *   .use(logger)
   *   .route(auth)
   *   .route("chat.", chat);
   * ```
   */
  route<
    S2 extends State,
    En2 extends Env,
    E2 extends EventMap,
    T2 extends EventMap,
  >(sub: Plaza<S2, En2, E2, T2>): Plaza<State, Env, Events & E2, Tasks & T2>;
  route<
    P extends string,
    S2 extends State,
    En2 extends Env,
    E2 extends EventMap,
    T2 extends EventMap,
  >(
    prefix: P,
    sub: Plaza<S2, En2, E2, T2>,
  ): Plaza<State, Env, Events & Prefix<P, E2>, Tasks & Prefix<P, T2>>;
  route(
    prefixOrSub: string | Plaza<any, any, any, any>,
    maybeSub?: Plaza<any, any, any, any>,
  ): unknown {
    const prefix = typeof prefixOrSub === "string" ? prefixOrSub : "";
    const sub = (maybeSub ?? prefixOrSub) as Plaza<any, any, any, any>;
    const subScopedMws = [...sub._pendingMiddlewares] as Middleware<
      State,
      Env,
      Events
    >[];
    for (const [evt, entry] of sub._routes) {
      this._routes.set(prefix + evt, {
        middlewares: [
          ...subScopedMws,
          ...(entry.middlewares as Middleware<State, Env, Events>[]),
        ],
        validators: entry.validators,
        handler: entry.handler as Handler<State, Env, unknown, Events>,
      });
    }
    this._connectHandlers.push(
      ...(sub._connectHandlers as ConnectHandler<State, Env, Events>[]),
    );
    this._closeHandlers.push(
      ...(sub._closeHandlers as CloseHandler<State, Env, Events>[]),
    );
    this._errorHandlers.push(
      ...(sub._errorHandlers as ErrorHandler<State, Env, Events>[]),
    );
    return this as unknown;
  }

  // ---------------------------------------------------------------------------
  // Low-level dispatch API (used by adapters and tests)
  // ---------------------------------------------------------------------------

  /**
   * Accept an HTTP request as a WebSocket upgrade and register the new connection.
   *
   * Call from a Durable Object's `fetch` handler to complete WebSocket
   * acceptance. The Durable Object adapter (`durableObject(plaza)`) wires this automatically,
   * so direct use is only necessary for custom routing.
   *
   * @param req - Incoming HTTP request
   * @param ctx - Durable Object `state`
   * @param env - Environment bindings
   * @returns `101 Switching Protocols` on success or `426 Upgrade Required` when the request lacks an `Upgrade` header
   */
  async upgrade(
    req: Request,
    ctx: DurableObjectState,
    env: Env,
  ): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    ctx.acceptWebSocket(server);
    await this._accept(server, ctx, env);
    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * Register an already-accepted WebSocket as a new connection and fire the
   * onConnect lifecycle. Exposed for adapters and tests that don't go through
   * a full HTTP upgrade flow.
   *
   * @internal
   */
  async _accept(
    ws: WebSocket,
    ctx: DurableObjectState,
    env: Env,
  ): Promise<Connection<State>> {
    const conn = new Connection<State>(
      ws,
      this._options.idFactory(),
      {} as State,
      this._registry,
      this._serialize,
    );
    this._registry.add(conn);

    const context = this._makeContext(conn, "connect", ctx, env);
    try {
      for (const h of this._connectHandlers) await h(context as never);
      conn._flushAttachment(this._options.maxAttachmentBytes);
    } catch (err) {
      await this._runErrorHandlers(err, context);
    }
    return conn;
  }

  /**
   * Deserialize an incoming message and dispatch it to the matching handler.
   *
   * Best-effort: any error (decode failure, unknown event, kind mismatch,
   * handler throw) is forwarded to {@link Plaza.onError} but never propagates
   * out of `dispatch` itself — the WebSocket message loop keeps running.
   *
   * Designed to be called from a Durable Object's `webSocketMessage`. The
   * Durable Object adapter (`durableObject(plaza)`) wires this automatically, so direct use is
   * only necessary for custom routing.
   *
   * @param ws - WebSocket that received the message
   * @param message - Raw incoming frame
   * @param ctx - Durable Object `state`
   * @param env - Environment bindings
   */
  async dispatch(
    ws: WebSocket,
    message: string | ArrayBuffer,
    ctx: DurableObjectState,
    env: Env,
  ): Promise<void> {
    const conn = this._registry.findByWebSocket(ws);
    if (!conn) return;
    // dispatch is best-effort: errors flow through onError but never propagate
    // to the WebSocket message loop (which would crash on every bad client).
    try {
      let event: string;
      let payload: unknown;
      try {
        const decoded = this._deserialize(message);
        event = decoded.event;
        payload = decoded.payload;
      } catch (err) {
        const context = this._makeContext(conn, "<deserialize>", ctx, env);
        await this._runErrorHandlers(err, context);
        return;
      }
      await this._runRoute(conn, event, payload, ctx, env, "message");
    } catch {}
  }

  /**
   * Invoke a server-side task by name.
   *
   * Looks up the route registered via {@link Plaza.task}, builds a
   * {@link TaskContext} (with `connection === null`), and runs the registered
   * middleware chain, validators, and handler. The returned promise resolves
   * once the handler completes, so callers may `await` it from a Durable
   * Object alarm or RPC method.
   *
   * Errors thrown inside the chain are forwarded to {@link Plaza.onError}
   * handlers. The promise rejects when no error handler is registered, or
   * when a registered handler rethrows — letting the caller (e.g. a Durable
   * Object alarm) react. A handler that returns normally swallows the error.
   *
   * @typeParam K - Task name (must be a key of `Tasks`)
   * @param ctx - Execution context (e.g. Durable Object `state`)
   * @param env - Environment bindings
   * @param name - Registered task name
   * @param payload - Payload matching the task's validator output
   */
  async runTask<K extends keyof Tasks & string>(
    ctx: DurableObjectState,
    env: Env,
    name: K,
    payload: Tasks[K],
  ): Promise<void> {
    await this._runRoute(null, name, payload, ctx, env, "task");
  }

  /**
   * Look up a route by name and run it.
   *
   * Shared backbone of {@link Plaza.dispatch} (client message) and
   * {@link Plaza.runTask} (server task). The route table is kind-agnostic; the
   * kind gate lives inside the handlers registered by {@link Plaza.handle} /
   * {@link Plaza.task}. Errors surface through {@link Plaza.onError} and
   * propagate when no handler is registered or a handler rethrows — callers
   * decide whether to swallow.
   *
   * @internal
   */
  private async _runRoute(
    conn: Connection<State> | null,
    name: string,
    payload: unknown,
    ctx: DurableObjectState,
    env: Env,
    kind: "message" | "task",
  ): Promise<void> {
    const context = this._makeContext(conn, name, ctx, env, undefined, kind);
    try {
      const entry = this._routes.get(name);
      if (!entry) throw new PlazaUnknownEventError(name);
      await this._runEntry(entry, context, payload);
    } catch (err) {
      await this._runErrorHandlers(err, context);
    } finally {
      if (conn) conn._flushAttachment(this._options.maxAttachmentBytes);
    }
  }

  /** @internal */
  private async _runEntry(
    entry: RouteEntry<State, Env, Events>,
    context: PlazaContext<State, Env, Events>,
    payload: unknown,
  ): Promise<void> {
    const chain = [
      ...this._pendingMiddlewares,
      ...entry.middlewares,
    ] as Middleware<State, Env, Events>[];

    const final = async (c: PlazaContext<State, Env, Events>) => {
      let valid: unknown;
      if (entry.validators.length === 0) {
        valid = payload;
      } else {
        for (const v of entry.validators) {
          const result = await v.validate(payload);
          if (
            valid !== undefined &&
            typeof valid === "object" &&
            valid !== null &&
            result !== null &&
            typeof result === "object"
          ) {
            valid = Object.assign({}, valid, result);
          } else {
            valid = result;
          }
        }
      }
      c._valid.json = valid;
      await (entry.handler as (c: unknown) => unknown)(c);
    };

    await compose<PlazaContext<State, Env, Events>>(
      chain as never,
      final,
    )(context);
  }

  /**
   * Handle a connection close and run the registered {@link Plaza.onClose | onClose} handlers.
   *
   * Designed to be called from a Durable Object's `webSocketClose`. The
   * Durable Object adapter (`durableObject(plaza)`) wires this automatically, so direct use is
   * only necessary for custom routing.
   *
   * @param ws - WebSocket that closed
   * @param code - WebSocket close code
   * @param reason - Close reason string
   * @param wasClean - Whether the close handshake completed cleanly
   * @param ctx - Durable Object `state`
   * @param env - Environment bindings
   */
  async close(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
    ctx: DurableObjectState,
    env: Env,
  ): Promise<void> {
    const conn = this._registry.findByWebSocket(ws);
    if (!conn) return;

    const context = this._makeContext(conn, "close", ctx, env, {
      code,
      reason,
      wasClean,
    });
    try {
      for (const h of this._closeHandlers) await h(context as never);
    } catch (err) {
      await this._runErrorHandlers(err, context);
    } finally {
      conn._dropFromRegistry();
    }
  }

  /**
   * Handle a low-level WebSocket error and run the registered {@link Plaza.onError | onError} handlers.
   *
   * Designed to be called from a Durable Object's `webSocketError`. The
   * Durable Object adapter (`durableObject(plaza)`) wires this automatically, so direct use is
   * only necessary for custom routing.
   *
   * @param ws - WebSocket that errored
   * @param err - Captured error
   * @param ctx - Durable Object `state`
   * @param env - Environment bindings
   */
  async error(
    ws: WebSocket,
    err: unknown,
    ctx: DurableObjectState,
    env: Env,
  ): Promise<void> {
    const conn = this._registry.findByWebSocket(ws);
    if (!conn) return;
    const context = this._makeContext(conn, "error", ctx, env);
    await this._runErrorHandlers(err, context);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers (used by the DO adapter)
  // ---------------------------------------------------------------------------

  /** @internal */
  _restoreConnection(
    ws: WebSocket,
    attachment: {
      id: string;
      tags: string[];
      channels: string[];
      state: State;
    },
  ): Connection<State> {
    const conn = Connection._restore<State>(
      ws,
      attachment,
      this._registry,
      this._serialize,
    );
    this._registry.add(conn);
    for (const t of attachment.tags) this._registry.indexTag(conn, t);
    for (const ch of attachment.channels) this._registry.indexChannel(conn, ch);
    return conn;
  }

  private _makeContext(
    conn: Connection<State> | null,
    event: string,
    ctx: DurableObjectState,
    env: Env,
    closeInfo?: { code: number; reason: string; wasClean: boolean },
    kind: "message" | "task" = "message",
  ): PlazaContext<State, Env, Events> {
    return new PlazaContext<State, Env, Events>({
      registry: this._registry,
      serialize: this._serialize,
      connection: conn,
      event,
      env,
      executionCtx: ctx,
      runTask: (name, payload) =>
        this.runTask(ctx, env, name as never, payload as never),
      closeInfo,
      kind,
    });
  }

  private async _runErrorHandlers(
    err: unknown,
    context: PlazaContext<State, Env, Events>,
  ): Promise<void> {
    if (this._errorHandlers.length === 0) throw err;
    for (const h of this._errorHandlers) {
      await h(err, context as never);
    }
  }
}
