[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / InferEvents

# Type Alias: InferEvents\<P\>

> **InferEvents**\<`P`\> = `P` *extends* `object` ? `E` *extends* [`EventMap`](EventMap.md) ? `E` : `never` : `never`

Defined in: types.ts:283

Extract the registered event map from a `Plaza` instance type.

Useful on the client side to recover the full event type information from
`typeof app`.

## Type Parameters

### P

`P`

The [Plaza](../classes/Plaza.md) instance type

## Example

```ts
export type AppType = typeof app;
type Events = InferEvents<AppType>;
```
