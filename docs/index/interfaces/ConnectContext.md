[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / ConnectContext

# Interface: ConnectContext\<State, Env, Events\>

Defined in: [types.ts:218](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L218)

Context passed to [onConnect](../classes/Plaza.md#onconnect) handlers.

## Extends

- [`MessageContext`](MessageContext.md)\<`State`, `Env`, `Events`\>

## Type Parameters

### State

`State`

### Env

`Env`

### Events

`Events` *extends* [`EventMap`](../type-aliases/EventMap.md)

## Properties

### kind

> `readonly` **kind**: `"message"`

Defined in: [types.ts:134](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L134)

Always `"message"` — discriminator with [TaskContext](TaskContext.md).

#### Inherited from

[`MessageContext`](MessageContext.md).[`kind`](MessageContext.md#kind)

***

### connection

> `readonly` **connection**: [`Connection`](../classes/Connection.md)\<`State`\>

Defined in: [types.ts:136](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L136)

The connection that produced the current event.

#### Inherited from

[`MessageContext`](MessageContext.md).[`connection`](MessageContext.md#connection)

***

### event

> `readonly` **event**: `string`

Defined in: [types.ts:141](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L141)

Event name being dispatched. For lifecycle hooks this is one of
`"connect"`, `"close"`, `"error"`, etc.

#### Inherited from

[`MessageContext`](MessageContext.md).[`event`](MessageContext.md#event)

***

### env

> `readonly` **env**: `Env`

Defined in: [types.ts:143](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L143)

Environment bindings (`Env` of the Durable Object on Cloudflare).

#### Inherited from

[`MessageContext`](MessageContext.md).[`env`](MessageContext.md#env-1)

***

### executionCtx

> `readonly` **executionCtx**: `DurableObjectState`

Defined in: [types.ts:145](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L145)

Execution context (`DurableObjectState` on Cloudflare).

#### Inherited from

[`MessageContext`](MessageContext.md).[`executionCtx`](MessageContext.md#executionctx)

## Methods

### emit()

> **emit**(`event`, `payload`): `void`

Defined in: [types.ts:153](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L153)

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

[`MessageContext`](MessageContext.md).[`emit`](MessageContext.md#emit)

***

### to()

> **to**(`sel`): [`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

Defined in: [types.ts:160](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L160)

Build a [Targets](../classes/Targets.md) narrowed by the given selector.

#### Parameters

##### sel

[`Selector`](../type-aliases/Selector.md)\<`State`\>

Narrowing criterion ([Selector](../type-aliases/Selector.md))

#### Returns

[`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

#### Inherited from

[`MessageContext`](MessageContext.md).[`to`](MessageContext.md#to)

***

### except()

> **except**(...`conns`): [`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

Defined in: [types.ts:167](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L167)

Build a [Targets](../classes/Targets.md) that excludes the given connections.

#### Parameters

##### conns

...[`Connection`](../classes/Connection.md)\<`State`\>[]

Connections to exclude

#### Returns

[`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

#### Inherited from

[`MessageContext`](MessageContext.md).[`except`](MessageContext.md#except)

***

### runTask()

> **runTask**(`name`, `payload`): `Promise`\<`void`\>

Defined in: [types.ts:176](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L176)

Invoke a server-side task registered via [Plaza.task](../classes/Plaza.md#task).

Equivalent to [Plaza.runTask](../classes/Plaza.md#runtask) but reuses the current `env` and
`executionCtx`. Returns a promise that resolves after the task handler
completes.

#### Parameters

##### name

`string`

##### payload

`unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`MessageContext`](MessageContext.md).[`runTask`](MessageContext.md#runtask)
