[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / SerializeFn

# Type Alias: SerializeFn

> **SerializeFn** = (`event`, `payload`) => `string` \| `ArrayBuffer`

Defined in: [types.ts:104](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L104)

Function that encodes an event name and payload into a wire frame on send.

The default implementation produces `JSON.stringify({ event, payload })`.
The return value must be a type the underlying WebSocket can `send()` directly.

## Parameters

### event

`string`

### payload

`unknown`

## Returns

`string` \| `ArrayBuffer`
