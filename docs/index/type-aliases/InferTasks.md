[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / InferTasks

# Type Alias: InferTasks\<P\>

> **InferTasks**\<`P`\> = `P` *extends* `object` ? `T` *extends* [`EventMap`](EventMap.md) ? `T` : `never` : `never`

Defined in: [types.ts:393](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L393)

Extract the registered task map from a `Plaza` instance type.

Useful on the server side to recover the full task type information from
`typeof app`.

## Type Parameters

### P

`P`

The [Plaza](../classes/Plaza.md) instance type

## Example

```ts
export type AppType = typeof app;
type Tasks = InferTasks<AppType>;
```
