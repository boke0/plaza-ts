[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / DeserializeFn

# Type Alias: DeserializeFn

> **DeserializeFn** = (`data`) => `object`

Defined in: types.ts:117

Function that decodes an incoming wire frame back into an event name and payload.

The default implementation parses the frame as JSON and returns
`{ event, payload }`.

## Parameters

### data

`string` \| `ArrayBuffer`

## Returns

`object`

### event

> **event**: `string`

### payload

> **payload**: `unknown`
