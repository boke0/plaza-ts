[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / CloseHandler

# Type Alias: CloseHandler\<State, Env, Events\>

> **CloseHandler**\<`State`, `Env`, `Events`\> = (`c`) => `unknown`

Defined in: [types.ts:332](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L332)

Type of a handler registered with [Plaza.onClose](../classes/Plaza.md#onclose).

## Type Parameters

### State

`State`

### Env

`Env`

### Events

`Events` *extends* [`EventMap`](EventMap.md)

## Parameters

### c

[`CloseContext`](../interfaces/CloseContext.md)\<`State`, `Env`, `Events`\>

## Returns

`unknown`
