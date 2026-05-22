/**
 * Type-safe WebSocket framework primarily targeting Cloudflare Durable Objects.
 *
 * The {@link Plaza} class is the main entry point. It dispatches messages by
 * event name, validates payloads with StandardSchema-compatible schemas,
 * supports Hono-like middleware, and manages connections through tags,
 * channels, and per-connection state.
 *
 * @example
 * ```ts
 * import { Plaza, validator } from "plaza-ts";
 * import { durableObject } from "plaza-ts/durable-object";
 * import { z } from "zod";
 *
 * const plaza = new Plaza()
 *   .on(
 *     "greeting",
 *     validator(z.object({ channel: z.string(), message: z.string() })),
 *     (c) => {
 *       const { channel, message } = c.valid("json");
 *       c.to({ channel }).emit("greeting", { message });
 *     }
 *   );
 *
 * export const ChatRoom = durableObject(plaza);
 * ```
 *
 * @packageDocumentation
 */

export { Plaza } from "./plaza.ts";
export type { PlazaOptions } from "./plaza.ts";
export { validator, ValidationError } from "./validator.ts";
export type { Validator } from "./validator.ts";
export { Connection, PlazaAttachmentTooLargeError } from "./connection.ts";
export type { PlazaAttachment } from "./connection.ts";
export { Targets } from "./targets.ts";
export type {
  Context,
  EventContext,
  ConnectContext,
  CloseContext,
  Middleware,
  Handler,
  ConnectHandler,
  CloseHandler,
  ErrorHandler,
  Selector,
  SerializeFn,
  DeserializeFn,
  EventMap,
  Prefix,
  InferEvents,
  InferState,
  ValidatorsOutput,
} from "./types.ts";
