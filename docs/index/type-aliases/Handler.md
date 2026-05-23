[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Handler

# Type Alias: Handler\<State, Env, Payload, Events\>

> **Handler**\<`State`, `Env`, `Payload`, `Events`\> = (`c`) => `unknown`

Defined in: [types.ts:292](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L292)

Type of an event handler registered with [Plaza.handle](../classes/Plaza.md#handle) (or the
deprecated [Plaza.on](../classes/Plaza.md#on)).

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

[`EventContext`](../interfaces/EventContext.md)\<`State`, `Env`, `Payload`, `Events`\>

## Returns

`unknown`
