[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Context

# Interface: Context\<State, Env, Events\>

Defined in: types.ts:134

Base context passed to every handler and middleware.

Carries the active connection, the current event name, the runtime bindings,
and the send-side API.

## Extended by

- [`EventContext`](EventContext.md)
- [`ConnectContext`](ConnectContext.md)
- [`CloseContext`](CloseContext.md)

## Type Parameters

### State

`State`

Per-connection state type

### Env

`Env`

Environment bindings (`Env` of the Durable Object on Cloudflare)

### Events

`Events` *extends* [`EventMap`](../type-aliases/EventMap.md)

The map of registered events

## Properties

### connection

> `readonly` **connection**: [`Connection`](../classes/Connection.md)\<`State`\>

Defined in: types.ts:136

The connection that produced the current event.

***

### event

> `readonly` **event**: `string`

Defined in: types.ts:141

Event name being dispatched. For lifecycle hooks this is one of
`"connect"`, `"close"`, `"error"`, etc.

***

### env

> `readonly` **env**: `Env`

Defined in: types.ts:143

Environment bindings (`Env` of the Durable Object on Cloudflare).

***

### executionCtx

> `readonly` **executionCtx**: `DurableObjectState`

Defined in: types.ts:145

Execution context (`DurableObjectState` on Cloudflare).

## Methods

### emit()

> **emit**(`event`, `payload`): `void`

Defined in: types.ts:153

Send an event to every connected client.

#### Parameters

##### event

`string`

Event name to send

##### payload

`unknown`

Arbitrary payload

#### Returns

`void`

***

### to()

> **to**(`sel`): [`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

Defined in: types.ts:160

Build a [Targets](../classes/Targets.md) narrowed by the given selector.

#### Parameters

##### sel

[`Selector`](../type-aliases/Selector.md)\<`State`\>

Narrowing criterion ([Selector](../type-aliases/Selector.md))

#### Returns

[`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

***

### except()

> **except**(...`conns`): [`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

Defined in: types.ts:167

Build a [Targets](../classes/Targets.md) that excludes the given connections.

#### Parameters

##### conns

...[`Connection`](../classes/Connection.md)\<`State`\>[]

Connections to exclude

#### Returns

[`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>
