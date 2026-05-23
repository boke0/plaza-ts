[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / ErrorHandler

# Type Alias: ErrorHandler\<State, Env, Events\>

> **ErrorHandler**\<`State`, `Env`, `Events`\> = (`err`, `c`) => `unknown`

Defined in: types.ts:262

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

[`Context`](../interfaces/Context.md)\<`State`, `Env`, `Events`\>

## Returns

`unknown`
