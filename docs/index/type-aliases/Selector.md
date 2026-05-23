[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Selector

# Type Alias: Selector\<State\>

> **Selector**\<`State`\> = \{ `tag`: `string` \| `string`[]; \} \| \{ `channel`: `string` \| `string`[]; \} \| ((`conn`) => `boolean`)

Defined in: types.ts:91

Selector for narrowing the set of connections to send to.

Has one of three shapes:

- `{ tag: string | string[] }` — filter via the tag index (O(1) lookup)
- `{ channel: string | string[] }` — filter via the channel index (O(1) lookup)
- `(conn) => boolean` — arbitrary predicate (O(n) filter)

## Type Parameters

### State

`State`

Per-connection state type

## Example

```ts
c.to({ tag: "user-123" }).emit("ping", {});
c.to({ channel: ["lobby", "general"] }).emit("notice", {});
c.to((conn) => conn.state.role === "admin").emit("alert", {});
```
