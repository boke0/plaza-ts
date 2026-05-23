[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / ConnectHandler

# Type Alias: ConnectHandler\<State, Env, Events\>

> **ConnectHandler**\<`State`, `Env`, `Events`\> = (`c`) => `unknown`

Defined in: [types.ts:323](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L323)

Type of a handler registered with [Plaza.onConnect](../classes/Plaza.md#onconnect).

## Type Parameters

### State

`State`

### Env

`Env`

### Events

`Events` *extends* [`EventMap`](EventMap.md)

## Parameters

### c

[`ConnectContext`](../interfaces/ConnectContext.md)\<`State`, `Env`, `Events`\>

## Returns

`unknown`
