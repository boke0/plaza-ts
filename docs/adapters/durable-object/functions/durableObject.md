[**plaza-ts v1.0.0**](../../../README.md)

***

[plaza-ts](../../../README.md) / [adapters/durable-object](../README.md) / durableObject

# Function: durableObject()

> **durableObject**\<`State`, `Env`, `Events`, `Tasks`\>(`plaza`): (`ctx`, `env`) => `DurableObject`\<`Env`, \{ \}\> & `object`

Defined in: [adapters/durable-object.ts:39](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/adapters/durable-object.ts#L39)

Build a Cloudflare Durable Object base class that wires Plaza's WebSocket
lifecycle automatically.

Extend the returned class (or export it directly) to handle WebSocket
upgrade, message dispatch, close, and error events without writing any
boilerplate. Hibernation rehydration of tag/channel/state indexes happens
lazily on the first call after a wake-up.

## Type Parameters

### State

`State` *extends* `Record`\<`string`, `unknown`\>

Per-connection state type used by `plaza`

### Env

`Env`

Environment bindings of the Durable Object

### Events

`Events` *extends* [`EventMap`](../../../index/type-aliases/EventMap.md)

Map of registered events

### Tasks

`Tasks` *extends* [`EventMap`](../../../index/type-aliases/EventMap.md)

## Parameters

### plaza

[`Plaza`](../../../index/classes/Plaza.md)\<`State`, `Env`, `Events`, `Tasks`\>

The Plaza instance whose handlers should drive this DO

## Returns

An abstract Durable Object class that delegates to `plaza`

(`ctx`, `env`) => `DurableObject`\<`Env`, \{ \}\> & `object`

## Example

```ts
import { Plaza } from "plaza-ts";
import { durableObject } from "plaza-ts/durable-object";

const plaza = new Plaza()
  .on("greeting", (c) => { ... });

export class ChatRoom extends durableObject(plaza) {
  async alarm() { ... }
}

// Or, with no DO-specific code, just re-export it:
// export const ChatRoom = durableObject(plaza);
```
