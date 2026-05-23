[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / DeserializeFn

# Type Alias: DeserializeFn

> **DeserializeFn** = (`data`) => `object`

Defined in: [types.ts:117](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L117)

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
