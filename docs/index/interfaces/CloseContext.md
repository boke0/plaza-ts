[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / CloseContext

# Interface: CloseContext\<State, Env, Events\>

Defined in: types.ts:207

Context passed to [onClose](../classes/Plaza.md#onclose) handlers.

Exposes the close reason via `code` / `reason` / `wasClean`.

## Extends

- [`Context`](Context.md)\<`State`, `Env`, `Events`\>

## Type Parameters

### State

`State`

### Env

`Env`

### Events

`Events` *extends* [`EventMap`](../type-aliases/EventMap.md)

## Properties

### connection

> `readonly` **connection**: [`Connection`](../classes/Connection.md)\<`State`\>

Defined in: types.ts:136

The connection that produced the current event.

#### Inherited from

[`Context`](Context.md).[`connection`](Context.md#connection)

***

### event

> `readonly` **event**: `string`

Defined in: types.ts:141

Event name being dispatched. For lifecycle hooks this is one of
`"connect"`, `"close"`, `"error"`, etc.

#### Inherited from

[`Context`](Context.md).[`event`](Context.md#event)

***

### env

> `readonly` **env**: `Env`

Defined in: types.ts:143

Environment bindings (`Env` of the Durable Object on Cloudflare).

#### Inherited from

[`Context`](Context.md).[`env`](Context.md#env-1)

***

### executionCtx

> `readonly` **executionCtx**: `DurableObjectState`

Defined in: types.ts:145

Execution context (`DurableObjectState` on Cloudflare).

#### Inherited from

[`Context`](Context.md).[`executionCtx`](Context.md#executionctx)

***

### code

> `readonly` **code**: `number`

Defined in: types.ts:210

WebSocket close code.

***

### reason

> `readonly` **reason**: `string`

Defined in: types.ts:212

WebSocket close reason string.

***

### wasClean

> `readonly` **wasClean**: `boolean`

Defined in: types.ts:214

Whether the close handshake completed cleanly.

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

#### Inherited from

[`Context`](Context.md).[`emit`](Context.md#emit)

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

#### Inherited from

[`Context`](Context.md).[`to`](Context.md#to)

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

#### Inherited from

[`Context`](Context.md).[`except`](Context.md#except)
