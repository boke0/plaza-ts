[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Middleware

# Type Alias: Middleware\<State, Env, Events\>

> **Middleware**\<`State`, `Env`, `Events`\> = (`c`, `next`) => `unknown`

Defined in: types.ts:234

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

[`Context`](../interfaces/Context.md)\<`State`, `Env`, `Events`\>

### next

() => `Promise`\<`void`\>

## Returns

`unknown`
