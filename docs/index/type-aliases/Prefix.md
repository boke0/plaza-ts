[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Prefix

# Type Alias: Prefix\<P, E\>

> **Prefix**\<`P`, `E`\> = `` { [K in keyof E as `${P}${K & string}`]: E[K] } ``

Defined in: types.ts:42

Prefixes every key of an [EventMap](EventMap.md) with a string literal.

Used by [Plaza.route](../classes/Plaza.md#route) to namespace the event names of a sub-Plaza when
a `prefix` argument is provided.

## Type Parameters

### P

`P` *extends* `string`

The string prefix to prepend

### E

`E` *extends* [`EventMap`](EventMap.md)

The original [EventMap](EventMap.md)

## Example

```ts
type Original = { login: { token: string } };
type Prefixed = Prefix<"auth.", Original>;
// => { "auth.login": { token: string } }
```
