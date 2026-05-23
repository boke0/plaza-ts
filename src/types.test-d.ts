import { describe, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { Plaza } from "./plaza.ts";
import type { InferEvents, InferState, InferTasks } from "./types.ts";
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

  it("keeps Events and Tasks separated at the type level", () => {
    const app = new Plaza<{}, {}>()
      .handle("ping", validator(z.object({ id: z.string() })), (_c) => {})
      .task("cleanup", validator(z.object({ at: z.number() })), (_c) => {});

    type Events = InferEvents<typeof app>;
    type Tasks = InferTasks<typeof app>;

    // ping appears in Events, NOT in Tasks
    expectTypeOf<Events>().toMatchTypeOf<{ ping: { id: string } }>();
    expectTypeOf<Tasks>().toMatchTypeOf<{ cleanup: { at: number } }>();

    // Events does NOT have the task key
    expectTypeOf<keyof Events & "cleanup">().toEqualTypeOf<never>();
    // Tasks does NOT have the handle key
    expectTypeOf<keyof Tasks & "ping">().toEqualTypeOf<never>();
  });

  it("prefixes both Events and Tasks via route(prefix, sub)", () => {
    const sub = new Plaza<{}, {}>()
      .handle("ev", (_c) => {})
      .task("tk", (_c) => {});
    const app = new Plaza<{}, {}>().route("v1.", sub);
    type Events = InferEvents<typeof app>;
    type Tasks = InferTasks<typeof app>;
    expectTypeOf<Events>().toMatchTypeOf<{ "v1.ev": unknown }>();
    expectTypeOf<Tasks>().toMatchTypeOf<{ "v1.tk": unknown }>();
  });

  it("discriminates middleware context via c.kind", () => {
    new Plaza<{ userId?: string }, {}>().use((c, _next) => {
      if (c.kind === "message") {
        expectTypeOf(c.connection.id).toEqualTypeOf<string>();
      } else {
        expectTypeOf(c.connection).toEqualTypeOf<null>();
      }
    });
  });
});
