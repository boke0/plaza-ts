[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Plaza

# Class: Plaza\<State, Env, Events, Tasks\>

Defined in: [plaza.ts:149](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L149)

Core class of the type-safe WebSocket framework.

Offers event-name-based message dispatch, type-safe payload validation via
StandardSchema, Hono-like middleware, and connection management through
tags, channels, and state. Primarily targets Cloudflare Durable Objects.

## Example

```ts
import { Plaza, validator } from "plaza-ts";
import { z } from "zod";

const plaza = new Plaza<{ role: string }>()
  .onConnect((c) => {
    c.emit("system", { message: "a user joined" });
  })
  .on(
    "greeting",
    validator(z.object({ channel: z.string(), message: z.string() })),
    (c) => {
      const { channel, message } = c.valid("json");
      c.to({ channel }).except(c.connection).emit("greeting", { message });
    }
  );
```

## Type Parameters

### State

`State` *extends* `Record`\<`string`, `unknown`\> = \{ \}

Per-connection state type. Drives type inference for
                   `setState` and predicate-based targeting.

### Env

`Env` = `unknown`

Environment bindings (`Env` of the Durable Object on Cloudflare).

### Events

`Events` *extends* [`EventMap`](../type-aliases/EventMap.md) = \{ \}

Map of registered events. Extended by every call to `.on(...)`.

### Tasks

`Tasks` *extends* [`EventMap`](../type-aliases/EventMap.md) = \{ \}

## Constructors

### Constructor

> **new Plaza**\<`State`, `Env`, `Events`, `Tasks`\>(`options?`): `Plaza`\<`State`, `Env`, `Events`, `Tasks`\>

Defined in: [plaza.ts:184](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L184)

#### Parameters

##### options?

[`PlazaOptions`](../interfaces/PlazaOptions.md) = `{}`

[PlazaOptions](../interfaces/PlazaOptions.md) to customize behavior

#### Returns

`Plaza`\<`State`, `Env`, `Events`, `Tasks`\>

## Methods

### use()

> **use**(`mw`): `this`

Defined in: [plaza.ts:210](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L210)

Register a middleware that runs before every event handler.

If `next()` is not called, subsequent middlewares and the handler are
skipped. Registered on the root Plaza, the middleware applies to every
event; registered on a sub-Plaza, it only applies to events declared on
that sub-Plaza.

#### Parameters

##### mw

[`Middleware`](../type-aliases/Middleware.md)\<`State`, `Env`, `Events`\>

Middleware to register

#### Returns

`this`

This instance (for chaining)

#### Example

```ts
plaza.use(async (c, next) => {
  console.log(`[${c.connection.id}] ${c.event}`);
  await next();
});
```

***

### serialize()

> **serialize**(`fn`): `this`

Defined in: [plaza.ts:223](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L223)

Replace the function that encodes outgoing frames.

Effective only on the root Plaza; calling it on a sub-Plaza has no effect.

#### Parameters

##### fn

[`SerializeFn`](../type-aliases/SerializeFn.md)

[SerializeFn](../type-aliases/SerializeFn.md)

#### Returns

`this`

This instance (for chaining)

***

### deserialize()

> **deserialize**(`fn`): `this`

Defined in: [plaza.ts:236](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L236)

Replace the function that decodes incoming frames.

Effective only on the root Plaza; calling it on a sub-Plaza has no effect.

#### Parameters

##### fn

[`DeserializeFn`](../type-aliases/DeserializeFn.md)

[DeserializeFn](../type-aliases/DeserializeFn.md)

#### Returns

`this`

This instance (for chaining)

***

### onConnect()

> **onConnect**(`handler`): `this`

Defined in: [plaza.ts:249](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L249)

Register a handler to run immediately after a WebSocket connects.

Multiple registrations are invoked in registration order.

#### Parameters

##### handler

[`ConnectHandler`](../type-aliases/ConnectHandler.md)\<`State`, `Env`, `Events`\>

[ConnectHandler](../type-aliases/ConnectHandler.md)

#### Returns

`this`

This instance (for chaining)

***

### onClose()

> **onClose**(`handler`): `this`

Defined in: [plaza.ts:262](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L262)

Register a handler to run immediately after a connection closes.

The handler can read `code`, `reason`, and `wasClean` from the context.

#### Parameters

##### handler

[`CloseHandler`](../type-aliases/CloseHandler.md)\<`State`, `Env`, `Events`\>

[CloseHandler](../type-aliases/CloseHandler.md)

#### Returns

`this`

This instance (for chaining)

***

### onError()

> **onError**(`handler`): `this`

Defined in: [plaza.ts:275](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L275)

Register a handler that captures exceptions thrown from handlers or middleware.

When no handler is registered, the exception is logged via `console.error`.

#### Parameters

##### handler

[`ErrorHandler`](../type-aliases/ErrorHandler.md)\<`State`, `Env`, `Events`\>

[ErrorHandler](../type-aliases/ErrorHandler.md)

#### Returns

`this`

This instance (for chaining)

***

### handle()

#### Call Signature

> **handle**\<`K`, `V`, `P`\>(`event`, ...`args`): `Plaza`\<`State`, `Env`, `Events` & `Record`\<`K`, `P`\>, `Tasks`\>

Defined in: [plaza.ts:306](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L306)

Register a handler for a client-originated WebSocket message.

Validators are optional and may be passed in any number. When multiple
validators are provided their outputs are merged and surfaced through
`c.valid("json")` with full type inference.

##### Type Parameters

###### K

`K` *extends* `string`

Event name (inferred as a string literal)

###### V

`V` *extends* readonly [`Validator`](../interfaces/Validator.md)\<`any`\>[]

Tuple of [Validator](../interfaces/Validator.md)s

###### P

`P` = [`ValidatorsOutput`](../type-aliases/ValidatorsOutput.md)\<`V`\>

Intersection of validator outputs (the payload type)

##### Parameters

###### event

`K`

Event name to handle

###### args

...\[`...V[]`, [`Handler`](../type-aliases/Handler.md)\<`State`, `Env`, `P`, `Events` & `Record`\<`K`, `P`\>\>\]

Zero or more validators followed by a final [Handler](../type-aliases/Handler.md)

##### Returns

`Plaza`\<`State`, `Env`, `Events` & `Record`\<`K`, `P`\>, `Tasks`\>

A new Plaza type with the event added (for chaining)

##### Example

```ts
plaza.handle(
  "join",
  validator(z.object({ channel: z.string() })),
  (c) => {
    const { channel } = c.valid("json");
    c.connection.joinChannel(channel);
  }
);
```

#### Call Signature

> **handle**\<`K`\>(`event`, `handler`): `Plaza`\<`State`, `Env`, `Events` & `Record`\<`K`, `unknown`\>, `Tasks`\>

Defined in: [plaza.ts:314](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L314)

Register a handler for a client-originated WebSocket message.

Validators are optional and may be passed in any number. When multiple
validators are provided their outputs are merged and surfaced through
`c.valid("json")` with full type inference.

##### Type Parameters

###### K

`K` *extends* `string`

Event name (inferred as a string literal)

##### Parameters

###### event

`K`

Event name to handle

###### handler

[`Handler`](../type-aliases/Handler.md)\<`State`, `Env`, `unknown`, `Events` & `Record`\<`K`, `unknown`\>\>

##### Returns

`Plaza`\<`State`, `Env`, `Events` & `Record`\<`K`, `unknown`\>, `Tasks`\>

A new Plaza type with the event added (for chaining)

##### Example

```ts
plaza.handle(
  "join",
  validator(z.object({ channel: z.string() })),
  (c) => {
    const { channel } = c.valid("json");
    c.connection.joinChannel(channel);
  }
);
```

***

### task()

#### Call Signature

> **task**\<`K`, `V`, `P`\>(`event`, ...`args`): `Plaza`\<`State`, `Env`, `Events`, `Tasks` & `Record`\<`K`, `P`\>\>

Defined in: [plaza.ts:359](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L359)

Register a handler for a server-side task.

Tasks are dispatched via [Plaza.runTask](#runtask) (or [MessageContext.runTask](../interfaces/MessageContext.md#runtask)
inside a handler). Unlike [Plaza.handle](#handle), tasks cannot be triggered
by clients — the route map records the kind and rejects cross-kind
dispatch.

Validators behave identically to [Plaza.handle](#handle).

##### Type Parameters

###### K

`K` *extends* `string`

Task name (inferred as a string literal)

###### V

`V` *extends* readonly [`Validator`](../interfaces/Validator.md)\<`any`\>[]

Tuple of [Validator](../interfaces/Validator.md)s

###### P

`P` = [`ValidatorsOutput`](../type-aliases/ValidatorsOutput.md)\<`V`\>

Intersection of validator outputs (the payload type)

##### Parameters

###### event

`K`

Task name to handle

###### args

...\[`...V[]`, [`TaskHandler`](../type-aliases/TaskHandler.md)\<`State`, `Env`, `P`, `Events`\>\]

Zero or more validators followed by a final
[TaskHandler](../type-aliases/TaskHandler.md)

##### Returns

`Plaza`\<`State`, `Env`, `Events`, `Tasks` & `Record`\<`K`, `P`\>\>

A new Plaza type with the task added (for chaining)

##### Example

```ts
plaza.task(
  "cleanup",
  validator(z.object({ olderThan: z.number() })),
  (c) => {
    c.to({ channel: "all" }).emit("system", { kind: "cleanup" });
  },
);
```

#### Call Signature

> **task**\<`K`\>(`event`, `handler`): `Plaza`\<`State`, `Env`, `Events`, `Tasks` & `Record`\<`K`, `unknown`\>\>

Defined in: [plaza.ts:367](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L367)

Register a handler for a server-side task.

Tasks are dispatched via [Plaza.runTask](#runtask) (or [MessageContext.runTask](../interfaces/MessageContext.md#runtask)
inside a handler). Unlike [Plaza.handle](#handle), tasks cannot be triggered
by clients — the route map records the kind and rejects cross-kind
dispatch.

Validators behave identically to [Plaza.handle](#handle).

##### Type Parameters

###### K

`K` *extends* `string`

Task name (inferred as a string literal)

##### Parameters

###### event

`K`

Task name to handle

###### handler

[`TaskHandler`](../type-aliases/TaskHandler.md)\<`State`, `Env`, `unknown`, `Events`\>

##### Returns

`Plaza`\<`State`, `Env`, `Events`, `Tasks` & `Record`\<`K`, `unknown`\>\>

A new Plaza type with the task added (for chaining)

##### Example

```ts
plaza.task(
  "cleanup",
  validator(z.object({ olderThan: z.number() })),
  (c) => {
    c.to({ channel: "all" }).emit("system", { kind: "cleanup" });
  },
);
```

***

### ~~on()~~

#### Call Signature

> **on**\<`K`, `V`, `P`\>(`event`, ...`args`): `Plaza`\<`State`, `Env`, `Events` & `Record`\<`K`, `P`\>, `Tasks`\>

Defined in: [plaza.ts:389](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L389)

Deprecated alias for [Plaza.handle](#handle).

##### Type Parameters

###### K

`K` *extends* `string`

###### V

`V` *extends* readonly [`Validator`](../interfaces/Validator.md)\<`any`\>[]

###### P

`P` = [`ValidatorsOutput`](../type-aliases/ValidatorsOutput.md)\<`V`\>

##### Parameters

###### event

`K`

###### args

...\[`...V[]`, [`Handler`](../type-aliases/Handler.md)\<`State`, `Env`, `P`, `Events` & `Record`\<`K`, `P`\>\>\]

##### Returns

`Plaza`\<`State`, `Env`, `Events` & `Record`\<`K`, `P`\>, `Tasks`\>

##### Deprecated

Use [Plaza.handle](#handle) instead. `.on()` will be removed in a
future release.

#### Call Signature

> **on**\<`K`\>(`event`, `handler`): `Plaza`\<`State`, `Env`, `Events` & `Record`\<`K`, `unknown`\>, `Tasks`\>

Defined in: [plaza.ts:397](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L397)

Deprecated alias for [Plaza.handle](#handle).

##### Type Parameters

###### K

`K` *extends* `string`

##### Parameters

###### event

`K`

###### handler

[`Handler`](../type-aliases/Handler.md)\<`State`, `Env`, `unknown`, `Events` & `Record`\<`K`, `unknown`\>\>

##### Returns

`Plaza`\<`State`, `Env`, `Events` & `Record`\<`K`, `unknown`\>, `Tasks`\>

##### Deprecated

Use [Plaza.handle](#handle) instead. `.on()` will be removed in a
future release.

***

### route()

#### Call Signature

> **route**\<`S2`, `En2`, `E2`, `T2`\>(`sub`): `Plaza`\<`State`, `Env`, `Events` & `E2`, `Tasks` & `T2`\>

Defined in: [plaza.ts:435](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L435)

Merge another `Plaza` instance into this one.

Event handlers, middleware, and lifecycle hooks declared on the sub-Plaza
are absorbed by the parent. The sub-Plaza's `.use(...)` applies only to
the events it owns.

Pass a `prefix` to namespace the sub-Plaza's event names as
`prefix + event`. The separator is not enforced, so any convention is
allowed.

Connections remain a single shared resource: tag, channel, and state
indexes — and `c.to(...)` targeting — span the entire merged graph.

##### Type Parameters

###### S2

`S2` *extends* `Record`\<`string`, `unknown`\>

###### En2

`En2`

###### E2

`E2` *extends* [`EventMap`](../type-aliases/EventMap.md)

###### T2

`T2` *extends* [`EventMap`](../type-aliases/EventMap.md)

##### Parameters

###### sub

`Plaza`\<`S2`, `En2`, `E2`, `T2`\>

##### Returns

`Plaza`\<`State`, `Env`, `Events` & `E2`, `Tasks` & `T2`\>

A new Plaza type composed with the merged events (for chaining)

##### Example

```ts
const auth = new Plaza().use(rateLimit).on("login", ...);
const chat = new Plaza().use(requireAuth).on("message", ...);

const app = new Plaza()
  .use(logger)
  .route(auth)
  .route("chat.", chat);
```

#### Call Signature

> **route**\<`P`, `S2`, `En2`, `E2`, `T2`\>(`prefix`, `sub`): `Plaza`\<`State`, `Env`, `Events` & [`Prefix`](../type-aliases/Prefix.md)\<`P`, `E2`\>, `Tasks` & [`Prefix`](../type-aliases/Prefix.md)\<`P`, `T2`\>\>

Defined in: [plaza.ts:441](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L441)

Merge another `Plaza` instance into this one.

Event handlers, middleware, and lifecycle hooks declared on the sub-Plaza
are absorbed by the parent. The sub-Plaza's `.use(...)` applies only to
the events it owns.

Pass a `prefix` to namespace the sub-Plaza's event names as
`prefix + event`. The separator is not enforced, so any convention is
allowed.

Connections remain a single shared resource: tag, channel, and state
indexes — and `c.to(...)` targeting — span the entire merged graph.

##### Type Parameters

###### P

`P` *extends* `string`

###### S2

`S2` *extends* `Record`\<`string`, `unknown`\>

###### En2

`En2`

###### E2

`E2` *extends* [`EventMap`](../type-aliases/EventMap.md)

###### T2

`T2` *extends* [`EventMap`](../type-aliases/EventMap.md)

##### Parameters

###### prefix

`P`

###### sub

`Plaza`\<`S2`, `En2`, `E2`, `T2`\>

##### Returns

`Plaza`\<`State`, `Env`, `Events` & [`Prefix`](../type-aliases/Prefix.md)\<`P`, `E2`\>, `Tasks` & [`Prefix`](../type-aliases/Prefix.md)\<`P`, `T2`\>\>

A new Plaza type composed with the merged events (for chaining)

##### Example

```ts
const auth = new Plaza().use(rateLimit).on("login", ...);
const chat = new Plaza().use(requireAuth).on("message", ...);

const app = new Plaza()
  .use(logger)
  .route(auth)
  .route("chat.", chat);
```

***

### upgrade()

> **upgrade**(`req`, `ctx`, `env`): `Promise`\<`Response`\>

Defined in: [plaza.ts:501](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L501)

Accept an HTTP request as a WebSocket upgrade and register the new connection.

Call from a Durable Object's `fetch` handler to complete WebSocket
acceptance. The Durable Object adapter (`durableObject(plaza)`) wires this automatically,
so direct use is only necessary for custom routing.

#### Parameters

##### req

`Request`

Incoming HTTP request

##### ctx

`DurableObjectState`

Durable Object `state`

##### env

`Env`

Environment bindings

#### Returns

`Promise`\<`Response`\>

`101 Switching Protocols` on success or `426 Upgrade Required` when the request lacks an `Upgrade` header

***

### dispatch()

> **dispatch**(`ws`, `message`, `ctx`, `env`): `Promise`\<`void`\>

Defined in: [plaza.ts:560](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L560)

Deserialize an incoming message and dispatch it to the matching handler.

Designed to be called from a Durable Object's `webSocketMessage`. The
Durable Object adapter (`durableObject(plaza)`) wires this automatically, so direct use is
only necessary for custom routing.

#### Parameters

##### ws

`WebSocket`

WebSocket that received the message

##### message

`string` \| `ArrayBuffer`

Raw incoming frame

##### ctx

`DurableObjectState`

Durable Object `state`

##### env

`Env`

Environment bindings

#### Returns

`Promise`\<`void`\>

***

### runTask()

> **runTask**\<`K`\>(`ctx`, `env`, `name`, `payload`): `Promise`\<`void`\>

Defined in: [plaza.ts:622](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L622)

Invoke a server-side task by name.

Looks up the route registered via [Plaza.task](#task), builds a
[TaskContext](../interfaces/TaskContext.md) (with `connection === null`), and runs the registered
middleware chain, validators, and handler. The returned promise resolves
once the handler completes, so callers may `await` it from a Durable
Object alarm or RPC method.

Errors thrown inside the chain are forwarded to [Plaza.onError](#onerror)
handlers and then rethrown so the caller can react (e.g. let the platform
retry an alarm).

#### Type Parameters

##### K

`K` *extends* `string`

Task name (must be a key of `Tasks`)

#### Parameters

##### ctx

`DurableObjectState`

Execution context (e.g. Durable Object `state`)

##### env

`Env`

Environment bindings

##### name

`K`

Registered task name

##### payload

`Tasks`\[`K`\]

Payload matching the task's validator output

#### Returns

`Promise`\<`void`\>

***

### close()

> **close**(`ws`, `code`, `reason`, `wasClean`, `ctx`, `env`): `Promise`\<`void`\>

Defined in: [plaza.ts:698](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L698)

Handle a connection close and run the registered [onClose](#onclose) handlers.

Designed to be called from a Durable Object's `webSocketClose`. The
Durable Object adapter (`durableObject(plaza)`) wires this automatically, so direct use is
only necessary for custom routing.

#### Parameters

##### ws

`WebSocket`

WebSocket that closed

##### code

`number`

WebSocket close code

##### reason

`string`

Close reason string

##### wasClean

`boolean`

Whether the close handshake completed cleanly

##### ctx

`DurableObjectState`

Durable Object `state`

##### env

`Env`

Environment bindings

#### Returns

`Promise`\<`void`\>

***

### error()

> **error**(`ws`, `err`, `ctx`, `env`): `Promise`\<`void`\>

Defined in: [plaza.ts:735](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L735)

Handle a low-level WebSocket error and run the registered [onError](#onerror) handlers.

Designed to be called from a Durable Object's `webSocketError`. The
Durable Object adapter (`durableObject(plaza)`) wires this automatically, so direct use is
only necessary for custom routing.

#### Parameters

##### ws

`WebSocket`

WebSocket that errored

##### err

`unknown`

Captured error

##### ctx

`DurableObjectState`

Durable Object `state`

##### env

`Env`

Environment bindings

#### Returns

`Promise`\<`void`\>
