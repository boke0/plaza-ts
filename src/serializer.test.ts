import { describe, expect, it } from "vitest";
import { defaultDeserialize, defaultSerialize } from "./serializer.ts";

describe("default serializer", () => {
  it("round-trips JSON event frames", () => {
    const frame = defaultSerialize("evt", { x: 1 });
    expect(frame).toBe('{"event":"evt","payload":{"x":1}}');
    expect(defaultDeserialize(frame as string)).toEqual({
      event: "evt",
      payload: { x: 1 },
    });
  });

  it("decodes ArrayBuffer input", () => {
    const buf = new TextEncoder().encode('{"event":"x","payload":42}')
      .buffer as ArrayBuffer;
    expect(defaultDeserialize(buf)).toEqual({ event: "x", payload: 42 });
  });

  it("throws on missing event name", () => {
    expect(() => defaultDeserialize('{"payload":1}')).toThrow();
  });
});
