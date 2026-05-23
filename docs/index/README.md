[**plaza-ts v0.0.0**](../README.md)

***

[plaza-ts](../README.md) / index

# index

Type-safe WebSocket framework primarily targeting Cloudflare Durable Objects.

The [Plaza](classes/Plaza.md) class is the main entry point. It dispatches messages by
event name, validates payloads with StandardSchema-compatible schemas,
supports Hono-like middleware, and manages connections through tags,
channels, and per-connection state.

## Example

```ts
import { Plaza, validator } from "plaza-ts";
import { durableObject } from "plaza-ts/durable-object";
import { z } from "zod";

const plaza = new Plaza()
  .on(
    "greeting",
    validator(z.object({ channel: z.string(), message: z.string() })),
    (c) => {
      const { channel, message } = c.valid("json");
      c.to({ channel }).emit("greeting", { message });
    }
  );

export const ChatRoom = durableObject(plaza);
```

## Classes

- [PlazaAttachmentTooLargeError](classes/PlazaAttachmentTooLargeError.md)
- [Connection](classes/Connection.md)
- [Plaza](classes/Plaza.md)
- [Targets](classes/Targets.md)
- [ValidationError](classes/ValidationError.md)

## Interfaces

- [PlazaAttachment](interfaces/PlazaAttachment.md)
- [PlazaOptions](interfaces/PlazaOptions.md)
- [Context](interfaces/Context.md)
- [EventContext](interfaces/EventContext.md)
- [ConnectContext](interfaces/ConnectContext.md)
- [CloseContext](interfaces/CloseContext.md)
- [Validator](interfaces/Validator.md)

## Type Aliases

- [EventMap](type-aliases/EventMap.md)
- [Prefix](type-aliases/Prefix.md)
- [ValidatorsOutput](type-aliases/ValidatorsOutput.md)
- [Selector](type-aliases/Selector.md)
- [SerializeFn](type-aliases/SerializeFn.md)
- [DeserializeFn](type-aliases/DeserializeFn.md)
- [Handler](type-aliases/Handler.md)
- [Middleware](type-aliases/Middleware.md)
- [ConnectHandler](type-aliases/ConnectHandler.md)
- [CloseHandler](type-aliases/CloseHandler.md)
- [ErrorHandler](type-aliases/ErrorHandler.md)
- [InferEvents](type-aliases/InferEvents.md)
- [InferState](type-aliases/InferState.md)

## Functions

- [validator](functions/validator.md)
