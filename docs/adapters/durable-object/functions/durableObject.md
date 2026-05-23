[**plaza-ts v0.0.0**](../../../README.md)

***

[plaza-ts](../../../README.md) / [adapters/durable-object](../README.md) / durableObject

# Function: durableObject()

> **durableObject**\<`State`, `Env`, `Events`\>(`plaza`): (`ctx`, `env`) => `DurableObject`\<`Env`, \{ \}\> & `object`

Defined in: adapters/durable-object.ts:39

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

## Parameters

### plaza

[`Plaza`](../../../index/classes/Plaza.md)\<`State`, `Env`, `Events`\>

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
