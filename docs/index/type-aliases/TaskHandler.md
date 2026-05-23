[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / TaskHandler

# Type Alias: TaskHandler\<State, Env, Payload, Events\>

> **TaskHandler**\<`State`, `Env`, `Payload`, `Events`\> = (`c`) => `unknown`

Defined in: [types.ts:301](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L301)

Type of a task handler registered with [Plaza.task](../classes/Plaza.md#task).

## Type Parameters

### State

`State`

### Env

`Env`

### Payload

`Payload`

### Events

`Events` *extends* [`EventMap`](EventMap.md)

## Parameters

### c

[`TaskEventContext`](../interfaces/TaskEventContext.md)\<`State`, `Env`, `Payload`, `Events`\>

## Returns

`unknown`
