import { describe, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { Plaza } from "./plaza.ts";
import type { InferEvents, InferState } from "./types.ts";
import { validator } from "./validator.ts";

describe("Plaza types", () => {
  it("infers payload from a single validator", () => {
    const app = new Plaza<{}, {}, {}>().on(
      "ping",
      validator(z.object({ name: z.string() })),
      (c) => {
        expectTypeOf(c.valid("json")).toEqualTypeOf<{ name: string }>();
      },
    );
    type Events = InferEvents<typeof app>;
    expectTypeOf<Events>().toMatchTypeOf<{ ping: { name: string } }>();
  });

  it("intersects payloads from multiple validators", () => {
    new Plaza<{}, {}, {}>().on(
      "evt",
      validator(z.object({ a: z.string() })),
      validator(z.object({ b: z.number() })),
      (c) => {
        expectTypeOf(c.valid("json")).toMatchTypeOf<{ a: string; b: number }>();
      },
    );
  });

  it("prefixes events from route(prefix, sub)", () => {
    const sub = new Plaza<{}, {}, {}>().on("x", (_c) => {});
    const app = new Plaza<{}, {}, {}>().route("v1.", sub);
    type Events = InferEvents<typeof app>;
    expectTypeOf<Events>().toMatchTypeOf<{ "v1.x": unknown }>();
  });

  it("propagates State through c.connection.state", () => {
    type S = { role: "admin" | "user" };
    const app = new Plaza<S, {}, {}>().on("evt", (c) => {
      expectTypeOf(c.connection.state).toEqualTypeOf<S>();
    });
    expectTypeOf<InferState<typeof app>>().toEqualTypeOf<S>();
  });
});
