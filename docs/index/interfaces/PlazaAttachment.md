[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / PlazaAttachment

# Interface: PlazaAttachment\<State\>

Defined in: [connection.ts:14](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/connection.ts#L14)

Connection snapshot persisted to and restored from a hibernating WebSocket.

Persisted through Cloudflare Durable Objects' `serializeAttachment`; Plaza
uses it to rebuild a [Connection](../classes/Connection.md) when the Durable Object wakes up.

## Type Parameters

### State

`State`

Application-defined state type

## Properties

### id

> **id**: `string`

Defined in: [connection.ts:16](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/connection.ts#L16)

Stable identifier of the connection.

***

### tags

> **tags**: `string`[]

Defined in: [connection.ts:18](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/connection.ts#L18)

Tags currently attached to the connection.

***

### channels

> **channels**: `string`[]

Defined in: [connection.ts:20](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/connection.ts#L20)

Channels the connection belongs to.

***

### state

> **state**: `State`

Defined in: [connection.ts:22](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/connection.ts#L22)

Snapshot of the application-defined state.
