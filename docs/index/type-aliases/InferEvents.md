[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / InferEvents

# Type Alias: InferEvents\<P\>

> **InferEvents**\<`P`\> = `P` *extends* `object` ? `E` *extends* [`EventMap`](EventMap.md) ? `E` : `never` : `never`

Defined in: [types.ts:362](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L362)

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
