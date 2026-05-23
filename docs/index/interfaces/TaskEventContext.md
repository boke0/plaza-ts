[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / TaskEventContext

# Interface: TaskEventContext\<State, Env, Payload, Events\>

Defined in: [types.ts:281](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L281)

Context passed to a [task](../classes/Plaza.md#task) handler with a validated
payload accessor.

## Extends

- [`TaskContext`](TaskContext.md)\<`State`, `Env`, `Events`\>

## Type Parameters

### State

`State`

### Env

`Env`

### Payload

`Payload`

### Events

`Events` *extends* [`EventMap`](../type-aliases/EventMap.md)

## Properties

### kind

> `readonly` **kind**: `"task"`

Defined in: [types.ts:251](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L251)

Always `"task"` — discriminator with [Context](../type-aliases/Context.md).

#### Inherited from

[`TaskContext`](TaskContext.md).[`kind`](TaskContext.md#kind)

***

### connection

> `readonly` **connection**: `null`

Defined in: [types.ts:253](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L253)

Tasks are not tied to a specific connection.

#### Inherited from

[`TaskContext`](TaskContext.md).[`connection`](TaskContext.md#connection)

***

### event

> `readonly` **event**: `string`

Defined in: [types.ts:255](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L255)

Name passed to [Plaza.runTask](../classes/Plaza.md#runtask).

#### Inherited from

[`TaskContext`](TaskContext.md).[`event`](TaskContext.md#event)

***

### env

> `readonly` **env**: `Env`

Defined in: [types.ts:257](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L257)

Environment bindings (`Env` of the Durable Object on Cloudflare).

#### Inherited from

[`TaskContext`](TaskContext.md).[`env`](TaskContext.md#env-1)

***

### executionCtx

> `readonly` **executionCtx**: `DurableObjectState`

Defined in: [types.ts:259](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L259)

Execution context (`DurableObjectState` on Cloudflare).

#### Inherited from

[`TaskContext`](TaskContext.md).[`executionCtx`](TaskContext.md#executionctx)

## Methods

### emit()

> **emit**(`event`, `payload`): `void`

Defined in: [types.ts:262](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L262)

Broadcast an event to every connected client.

#### Parameters

##### event

`string`

##### payload

`unknown`

#### Returns

`void`

#### Inherited from

[`TaskContext`](TaskContext.md).[`emit`](TaskContext.md#emit)

***

### to()

> **to**(`sel`): [`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

Defined in: [types.ts:264](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L264)

Build a [Targets](../classes/Targets.md) narrowed by the given selector.

#### Parameters

##### sel

[`Selector`](../type-aliases/Selector.md)\<`State`\>

#### Returns

[`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

#### Inherited from

[`TaskContext`](TaskContext.md).[`to`](TaskContext.md#to)

***

### except()

> **except**(...`conns`): [`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

Defined in: [types.ts:266](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L266)

Build a [Targets](../classes/Targets.md) that excludes the given connections.

#### Parameters

##### conns

...[`Connection`](../classes/Connection.md)\<`State`\>[]

#### Returns

[`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

#### Inherited from

[`TaskContext`](TaskContext.md).[`except`](TaskContext.md#except)

***

### runTask()

> **runTask**(`name`, `payload`): `Promise`\<`void`\>

Defined in: [types.ts:272](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L272)

Invoke another server-side task. Same semantics as [Plaza.runTask](../classes/Plaza.md#runtask)
but reuses the current `env` and `executionCtx`.

#### Parameters

##### name

`string`

##### payload

`unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`TaskContext`](TaskContext.md).[`runTask`](TaskContext.md#runtask)

***

### valid()

> **valid**(`target`): `Payload`

Defined in: [types.ts:283](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L283)

#### Parameters

##### target

`"json"`

#### Returns

`Payload`
