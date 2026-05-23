[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Context

# Type Alias: Context\<State, Env, Events\>

> **Context**\<`State`, `Env`, `Events`\> = [`MessageContext`](../interfaces/MessageContext.md)\<`State`, `Env`, `Events`\> \| [`TaskContext`](../interfaces/TaskContext.md)\<`State`, `Env`, `Events`\>

Defined in: [types.ts:187](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/types.ts#L187)

Union of contexts that a middleware can receive: either a client-originated
[MessageContext](../interfaces/MessageContext.md) or a server-originated [TaskContext](../interfaces/TaskContext.md).

Discriminate on `c.kind` to access `c.connection` safely.

## Type Parameters

### State

`State`

### Env

`Env`

### Events

`Events` *extends* [`EventMap`](EventMap.md)
