[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / MessageContext

# Interface: MessageContext\<State, Env, Events\>

Defined in: [types.ts:132](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L132)

Context passed to a client-originated message handler or middleware running
for a message.

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

### kind

> `readonly` **kind**: `"message"`

Defined in: [types.ts:134](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L134)

Always `"message"` — discriminator with [TaskContext](TaskContext.md).

***

### connection

> `readonly` **connection**: [`Connection`](../classes/Connection.md)\<`State`\>

Defined in: [types.ts:136](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L136)

The connection that produced the current event.

***

### event

> `readonly` **event**: `string`

Defined in: [types.ts:141](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L141)

Event name being dispatched. For lifecycle hooks this is one of
`"connect"`, `"close"`, `"error"`, etc.

***

### env

> `readonly` **env**: `Env`

Defined in: [types.ts:143](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L143)

Environment bindings (`Env` of the Durable Object on Cloudflare).

***

### executionCtx

> `readonly` **executionCtx**: `DurableObjectState`

Defined in: [types.ts:145](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L145)

Execution context (`DurableObjectState` on Cloudflare).

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
