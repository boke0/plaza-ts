[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / EventMap

# Type Alias: EventMap

> **EventMap** = `Record`\<`string`, `unknown`\>

Defined in: [types.ts:22](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L22)

Map from event names to their payload types.

For each event a Plaza instance handles, the key is the event name and the
value is the payload type. Every call to [Plaza.on](../classes/Plaza.md#on) extends this map,
and the final result is what drives client-side type inference.

## Example

```ts
type ChatEvents = {
  message: { text: string };
  typing: { userId: string };
};
```
