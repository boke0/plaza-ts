import type { Connection } from "./connection.ts";
import type { Targets } from "./targets.ts";
import type { Validator } from "./validator.ts";

/**
 * Map from event names to their payload types.
 *
 * For each event a Plaza instance handles, the key is the event name and the
 * value is the payload type. Every call to {@link Plaza.on} extends this map,
 * and the final result is what drives client-side type inference.
 *
 * @example
 * ```ts
 * type ChatEvents = {
 *   message: { text: string };
 *   typing: { userId: string };
 * };
 * ```
 *
 * @public
 */
export type EventMap = Record<string, unknown>;

/**
 * Prefixes every key of an {@link EventMap} with a string literal.
 *
 * Used by {@link Plaza.route} to namespace the event names of a sub-Plaza when
 * a `prefix` argument is provided.
 *
 * @typeParam P - The string prefix to prepend
 * @typeParam E - The original {@link EventMap}
 *
 * @example
 * ```ts
 * type Original = { login: { token: string } };
 * type Prefixed = Prefix<"auth.", Original>;
 * // => { "auth.login": { token: string } }
 * ```
 *
 * @public
 */
export type Prefix<P extends string, E extends EventMap> = {
  [K in keyof E as `${P}${K & string}`]: E[K];
};

type UnionToIntersection<U> = (
  U extends unknown
    ? (x: U) => void
    : never
) extends (x: infer I) => void
  ? I
  : never;

/**
 * Intersects the outputs of multiple {@link Validator}s into a single type.
 *
 * When {@link Plaza.on} is called with multiple validators, the final payload
 * type is the intersection of every validator's output.
 *
 * @typeParam V - A readonly tuple of {@link Validator}s
 *
 * @public
 */
export type ValidatorsOutput<V extends readonly Validator<unknown>[]> =
  UnionToIntersection<
    {
      [I in keyof V]: V[I] extends Validator<infer O> ? O : never;
    }[number]
  >;

/**
 * Selector for narrowing the set of connections to send to.
 *
 * Has one of three shapes:
 *
 * - `{ tag: string | string[] }` — filter via the tag index (O(1) lookup)
 * - `{ channel: string | string[] }` — filter via the channel index (O(1) lookup)
 * - `(conn) => boolean` — arbitrary predicate (O(n) filter)
 *
 * @typeParam State - Per-connection state type
 *
 * @example
 * ```ts
 * c.to({ tag: "user-123" }).emit("ping", {});
 * c.to({ channel: ["lobby", "general"] }).emit("notice", {});
 * c.to((conn) => conn.state.role === "admin").emit("alert", {});
 * ```
 *
 * @public
 */
export type Selector<State> =
  | { tag: string | string[] }
  | { channel: string | string[] }
  | ((conn: Connection<State>) => boolean);

/**
 * Function that encodes an event name and payload into a wire frame on send.
 *
 * The default implementation produces `JSON.stringify({ event, payload })`.
 * The return value must be a type the underlying WebSocket can `send()` directly.
 *
 * @public
 */
export type SerializeFn = (
  event: string,
  payload: unknown,
) => string | ArrayBuffer;

/**
 * Function that decodes an incoming wire frame back into an event name and payload.
 *
 * The default implementation parses the frame as JSON and returns
 * `{ event, payload }`.
 *
 * @public
 */
export type DeserializeFn = (data: string | ArrayBuffer) => {
  event: string;
  payload: unknown;
};

/**
 * Base context passed to every handler and middleware.
 *
 * Carries the active connection, the current event name, the runtime bindings,
 * and the send-side API.
 *
 * @typeParam State - Per-connection state type
 * @typeParam Env - Environment bindings (`Env` of the Durable Object on Cloudflare)
 * @typeParam Events - The map of registered events
 *
 * @public
 */
export interface Context<State, Env, Events extends EventMap> {
  /** The connection that produced the current event. */
  readonly connection: Connection<State>;
  /**
   * Event name being dispatched. For lifecycle hooks this is one of
   * `"connect"`, `"close"`, `"error"`, etc.
   */
  readonly event: string;
  /** Environment bindings (`Env` of the Durable Object on Cloudflare). */
  readonly env: Env;
  /** Execution context (`DurableObjectState` on Cloudflare). */
  readonly executionCtx: DurableObjectState;

  /**
   * Send an event to every connected client.
   *
   * @param event - Event name to send
   * @param payload - Arbitrary payload
   */
  emit(event: string, payload: unknown): void;

  /**
   * Build a {@link Targets} narrowed by the given selector.
   *
   * @param sel - Narrowing criterion ({@link Selector})
   */
  to(sel: Selector<State>): Targets<State, Env, Events>;

  /**
   * Build a {@link Targets} that excludes the given connections.
   *
   * @param conns - Connections to exclude
   */
  except(...conns: Connection<State>[]): Targets<State, Env, Events>;
}

/**
 * Context passed to event handlers.
 *
 * Adds {@link EventContext.valid | valid} for retrieving the validated payload.
 *
 * @typeParam State - Per-connection state type
 * @typeParam Env - Environment bindings
 * @typeParam Payload - Type of the validated payload
 * @typeParam Events - The map of registered events
 *
 * @public
 */
export interface EventContext<State, Env, Payload, Events extends EventMap>
  extends Context<State, Env, Events> {
  /**
   * Retrieve the validated payload.
   *
   * @param target - Source to read from. Only `"json"` is supported today.
   */
  valid(target: "json"): Payload;
}

/**
 * Context passed to {@link Plaza.onConnect | onConnect} handlers.
 *
 * @public
 */
export interface ConnectContext<State, Env, Events extends EventMap>
  extends Context<State, Env, Events> {}

/**
 * Context passed to {@link Plaza.onClose | onClose} handlers.
 *
 * Exposes the close reason via `code` / `reason` / `wasClean`.
 *
 * @public
 */
export interface CloseContext<State, Env, Events extends EventMap>
  extends Context<State, Env, Events> {
  /** WebSocket close code. */
  readonly code: number;
  /** WebSocket close reason string. */
  readonly reason: string;
  /** Whether the close handshake completed cleanly. */
  readonly wasClean: boolean;
}

/**
 * Type of an event handler registered with {@link Plaza.on}.
 *
 * @public
 */
export type Handler<State, Env, Payload, Events extends EventMap> = (
  c: EventContext<State, Env, Payload, Events>,
) => unknown;

/**
 * Type of a middleware registered with {@link Plaza.use}.
 *
 * Calling `next()` advances to the next middleware or to the final handler.
 * Skipping the call to `next()` stops the chain.
 *
 * @public
 */
export type Middleware<State, Env, Events extends EventMap> = (
  c: Context<State, Env, Events>,
  next: () => Promise<void>,
) => unknown;

/**
 * Type of a handler registered with {@link Plaza.onConnect}.
 *
 * @public
 */
export type ConnectHandler<State, Env, Events extends EventMap> = (
  c: ConnectContext<State, Env, Events>,
) => unknown;

/**
 * Type of a handler registered with {@link Plaza.onClose}.
 *
 * @public
 */
export type CloseHandler<State, Env, Events extends EventMap> = (
  c: CloseContext<State, Env, Events>,
) => unknown;

/**
 * Type of a handler registered with {@link Plaza.onError}.
 *
 * @public
 */
export type ErrorHandler<State, Env, Events extends EventMap> = (
  err: unknown,
  c: Context<State, Env, Events>,
) => unknown;

/**
 * Extract the registered event map from a `Plaza` instance type.
 *
 * Useful on the client side to recover the full event type information from
 * `typeof app`.
 *
 * @typeParam P - The {@link Plaza} instance type
 *
 * @example
 * ```ts
 * export type AppType = typeof app;
 * type Events = InferEvents<AppType>;
 * ```
 *
 * @public
 */
export type InferEvents<P> = P extends { __events: infer E }
  ? E extends EventMap
    ? E
    : never
  : never;

/**
 * Extract the per-connection state type from a `Plaza` instance type.
 *
 * @typeParam P - The {@link Plaza} instance type
 *
 * @public
 */
export type InferState<P> = P extends { __state: infer S } ? S : never;
