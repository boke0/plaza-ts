[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / ErrorHandler

# Type Alias: ErrorHandler\<State, Env, Events\>

> **ErrorHandler**\<`State`, `Env`, `Events`\> = (`err`, `c`) => `unknown`

Defined in: [types.ts:341](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L341)

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
