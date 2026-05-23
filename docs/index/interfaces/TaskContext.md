[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / TaskContext

# Interface: TaskContext\<State, Env, Events\>

Defined in: [types.ts:249](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L249)

Context passed to a server-side [task](../classes/Plaza.md#task) handler.

Tasks are dispatched via [Plaza.runTask](../classes/Plaza.md#runtask) from server code (Durable
Object alarms, RPC methods, other handlers, ...). They have no originating
client `connection`, so `connection` is `null`. The remaining surface
(`emit`, `to`, `except`, `env`, `executionCtx`) is identical to the message
context.

## Extended by

- [`TaskEventContext`](TaskEventContext.md)

## Type Parameters

### State

`State`

### Env

`Env`

### Events

`Events` *extends* [`EventMap`](../type-aliases/EventMap.md)

## Properties

### kind

> `readonly` **kind**: `"task"`

Defined in: [types.ts:251](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L251)

Always `"task"` — discriminator with [Context](../type-aliases/Context.md).

***

### connection

> `readonly` **connection**: `null`

Defined in: [types.ts:253](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L253)

Tasks are not tied to a specific connection.

***

### event

> `readonly` **event**: `string`

Defined in: [types.ts:255](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L255)

Name passed to [Plaza.runTask](../classes/Plaza.md#runtask).

***

### env

> `readonly` **env**: `Env`

Defined in: [types.ts:257](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L257)

Environment bindings (`Env` of the Durable Object on Cloudflare).

***

### executionCtx

> `readonly` **executionCtx**: `DurableObjectState`

Defined in: [types.ts:259](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L259)

Execution context (`DurableObjectState` on Cloudflare).

## Methods

### emit()

> **emit**(`event`, `payload`): `void`

Defined in: [types.ts:262](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L262)

Broadcast an event to every connected client.

#### Parameters

##### event

`string`

##### payload

`unknown`

#### Returns

`void`

***

### to()

> **to**(`sel`): [`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

Defined in: [types.ts:264](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L264)

Build a [Targets](../classes/Targets.md) narrowed by the given selector.

#### Parameters

##### sel

[`Selector`](../type-aliases/Selector.md)\<`State`\>

#### Returns

[`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

***

### except()

> **except**(...`conns`): [`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

Defined in: [types.ts:266](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L266)

Build a [Targets](../classes/Targets.md) that excludes the given connections.

#### Parameters

##### conns

...[`Connection`](../classes/Connection.md)\<`State`\>[]

#### Returns

[`Targets`](../classes/Targets.md)\<`State`, `Env`, `Events`\>

***

### runTask()

> **runTask**(`name`, `payload`): `Promise`\<`void`\>

Defined in: [types.ts:272](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L272)

Invoke another server-side task. Same semantics as [Plaza.runTask](../classes/Plaza.md#runtask)
but reuses the current `env` and `executionCtx`.

#### Parameters

##### name

`string`

##### payload

`unknown`

#### Returns

`Promise`\<`void`\>
