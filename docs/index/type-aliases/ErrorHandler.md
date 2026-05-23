[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / ErrorHandler

# Type Alias: ErrorHandler\<State, Env, Events\>

> **ErrorHandler**\<`State`, `Env`, `Events`\> = (`err`, `c`) => `unknown`

Defined in: [types.ts:341](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L341)

Type of a handler registered with [Plaza.onError](../classes/Plaza.md#onerror).

## Type Parameters

### State

`State`

### Env

`Env`

### Events

`Events` *extends* [`EventMap`](EventMap.md)

## Parameters

### err

`unknown`

### c

[`Context`](Context.md)\<`State`, `Env`, `Events`\>

## Returns

`unknown`
