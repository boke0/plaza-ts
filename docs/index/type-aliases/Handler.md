[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Handler

# Type Alias: Handler\<State, Env, Payload, Events\>

> **Handler**\<`State`, `Env`, `Payload`, `Events`\> = (`c`) => `unknown`

Defined in: types.ts:222

Type of an event handler registered with [Plaza.on](../classes/Plaza.md#on).

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
