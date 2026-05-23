[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / EventContext

# Interface: EventContext\<State, Env, Payload, Events\>

Defined in: types.ts:182

Context passed to event handlers.

Adds [valid](#valid) for retrieving the validated payload.

## Extends

- [`Context`](Context.md)\<`State`, `Env`, `Events`\>

## Type Parameters

### State

`State`

Per-connection state type

### Env

`Env`

Environment bindings

### Payload

`Payload`

Type of the validated payload

### Events

`Events` *extends* [`EventMap`](../type-aliases/EventMap.md)

The map of registered events

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

***

### valid()

> **valid**(`target`): `Payload`

Defined in: types.ts:189

Retrieve the validated payload.

#### Parameters

##### target

`"json"`

Source to read from. Only `"json"` is supported today.

#### Returns

`Payload`
