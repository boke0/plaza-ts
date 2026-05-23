[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Targets

# Class: Targets\<State, Env, Events\>

Defined in: [targets.ts:35](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/targets.ts#L35)

Immutable description of a set of send targets.

Build up a narrowing plan by chaining `to(...)` / `except(...)`, then call
[Targets.emit](#emit) to send to every connection that matches.

## Remarks

Each method returns a new `Targets` instance, so the original is unaffected.
`Targets` also implements `Symbol.iterator`, so you can iterate over the
matching connections with `for...of`.

## Example

```ts
// Send to everyone in "lobby" except the sender.
c.to({ channel: "lobby" }).except(c.connection).emit("greeting", { message });
```

## Type Parameters

### State

`State`

Per-connection state type

### Env

`Env`

Environment bindings type

### Events

`Events` *extends* [`EventMap`](../type-aliases/EventMap.md)

Registered event map

## Methods

### to()

> **to**(`sel`): `Targets`\<`State`, `Env`, `Events`\>

Defined in: [targets.ts:55](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/targets.ts#L55)

Return a new Targets with an additional narrowing step appended.

Chained selectors compose as AND filters.

#### Parameters

##### sel

[`Selector`](../type-aliases/Selector.md)\<`State`\>

Selector to AND with the current plan

#### Returns

`Targets`\<`State`, `Env`, `Events`\>

#### Example

```ts
c.to({ channel: "lobby" }).to({ tag: "admin" }).emit("ping", {});
```

***

### except()

> **except**(...`conns`): `Targets`\<`State`, `Env`, `Events`\>

Defined in: [targets.ts:83](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/targets.ts#L83)

Return a new Targets that excludes the given connections.

#### Parameters

##### conns

...[`Connection`](Connection.md)\<`State`\>[]

Connections to exclude (variadic)

#### Returns

`Targets`\<`State`, `Env`, `Events`\>

#### Example

```ts
c.to({ channel: "lobby" }).except(c.connection).emit("notice", {});
```

***

### emit()

> **emit**(`event`, `payload`): `void`

Defined in: [targets.ts:101](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/targets.ts#L101)

Resolve the plan and dispatch an event to every matching connection.

The payload is serialized exactly once and the same wire frame is sent to
each target. If sending to a target throws, that connection is dropped
from the registry.

#### Parameters

##### event

`string`

Event name

##### payload

`unknown`

Arbitrary payload

#### Returns

`void`

***

### \[iterator\]()

> **\[iterator\]**(): `IterableIterator`\<[`Connection`](Connection.md)\<`State`\>\>

Defined in: [targets.ts:120](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/targets.ts#L120)

Iterate over the connections that match the current plan.

Useful when you need to inspect or process matching connections without
sending them an event.

#### Returns

`IterableIterator`\<[`Connection`](Connection.md)\<`State`\>\>
