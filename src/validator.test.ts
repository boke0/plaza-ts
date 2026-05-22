import { describe, expect, it } from "vitest";
import { z } from "zod";
import { connect, sendFrame } from "./_test-harness.ts";
import { Plaza } from "./plaza.ts";
import { ValidationError, validator } from "./validator.ts";

describe("validator", () => {
  it("validates and types payload through c.valid('json')", async () => {
    let received: unknown = null;
    const plaza = new Plaza<{}, {}, {}>().on(
      "evt",
      validator(z.object({ name: z.string() })),
      (c) => {
        received = c.valid("json");
      },
    );
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "evt", { name: "alice" }, {});
    expect(received).toEqual({ name: "alice" });
  });

  it("surfaces validation errors to onError", async () => {
    const errors: unknown[] = [];
    const plaza = new Plaza<{}, {}, {}>()
      .onError((err) => {
        errors.push(err);
      })
      .on("evt", validator(z.object({ name: z.string() })), () => {
        throw new Error("should not reach handler");
      });
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "evt", { name: 42 }, {});
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(ValidationError);
  });

  it("merges multiple validator outputs (intersection)", async () => {
    let received: unknown = null;
    const plaza = new Plaza<{}, {}, {}>().on(
      "evt",
      validator(z.object({ a: z.string() })),
      validator(z.object({ b: z.number() })),
      (c) => {
        received = c.valid("json");
      },
    );
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "evt", { a: "x", b: 1 }, {});
    expect(received).toEqual({ a: "x", b: 1 });
  });
});
