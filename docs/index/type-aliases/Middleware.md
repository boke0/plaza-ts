[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Middleware

# Type Alias: Middleware\<State, Env, Events\>

> **Middleware**\<`State`, `Env`, `Events`\> = (`c`, `next`) => `unknown`

Defined in: [types.ts:313](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L313)

Type of a middleware registered with [Plaza.use](../classes/Plaza.md#use).

Calling `next()` advances to the next middleware or to the final handler.
Skipping the call to `next()` stops the chain.

## Type Parameters

### State

`State`

### Env

`Env`

### Events

`Events` *extends* [`EventMap`](EventMap.md)

## Parameters

### c

[`Context`](Context.md)\<`State`, `Env`, `Events`\>

### next

() => `Promise`\<`void`\>

## Returns

`unknown`
