import type { DeserializeFn, SerializeFn } from "./types.ts";

/**
 * Default serializer used when {@link Plaza.serialize} is not called.
 *
 * Encodes `{ event, payload }` as a JSON string.
 *
 * @internal
 */
export const defaultSerialize: SerializeFn = (event, payload) =>
  JSON.stringify({ event, payload });

/**
 * Default deserializer used when {@link Plaza.deserialize} is not called.
 *
 * Parses the incoming frame as JSON and returns `{ event, payload }`.
 * `ArrayBuffer` input is decoded as UTF-8 before parsing. Throws when the
 * `event` field is missing or not a string.
 *
 * @internal
 */
export const defaultDeserialize: DeserializeFn = (data) => {
  const text = typeof data === "string" ? data : new TextDecoder().decode(data);
  const parsed = JSON.parse(text) as { event: unknown; payload: unknown };
  if (typeof parsed.event !== "string") {
    throw new Error("Plaza: missing event name in incoming frame");
  }
  return { event: parsed.event, payload: parsed.payload };
};
