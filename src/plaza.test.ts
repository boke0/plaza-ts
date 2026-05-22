import { describe, expect, it } from "vitest";
import { connect, sendFrame, sentEvents } from "./_test-harness.ts";
import { Plaza } from "./plaza.ts";

describe("Plaza.on", () => {
  it("dispatches events to the registered handler", async () => {
    const seen: string[] = [];
    const plaza = new Plaza<{}, {}, {}>().on("ping", (c) => {
      seen.push(c.event);
      c.connection.emit("pong", { ok: true });
    });
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "ping", {}, {});
    expect(seen).toEqual(["ping"]);
    expect(sentEvents(ws)).toEqual([{ event: "pong", payload: { ok: true } }]);
  });

  it("silently drops unregistered events", async () => {
    const plaza = new Plaza<{}, {}, {}>();
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "unknown", {}, {});
    expect(ws.sent).toEqual([]);
  });

  it("last registration wins when same event is registered twice", async () => {
    const seen: string[] = [];
    const plaza = new Plaza<{}, {}, {}>()
      .on("evt", () => {
        seen.push("first");
      })
      .on("evt", () => {
        seen.push("second");
      });
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "evt", {}, {});
    expect(seen).toEqual(["second"]);
  });
});

describe("Plaza middleware", () => {
  it("runs middlewares in registration order around the handler", async () => {
    const order: string[] = [];
    const plaza = new Plaza<{}, {}, {}>()
      .use(async (_c, next) => {
        order.push("a:before");
        await next();
        order.push("a:after");
      })
      .use(async (_c, next) => {
        order.push("b:before");
        await next();
        order.push("b:after");
      })
      .on("evt", () => {
        order.push("handler");
      });
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "evt", {}, {});
    expect(order).toEqual([
      "a:before",
      "b:before",
      "handler",
      "b:after",
      "a:after",
    ]);
  });

  it("skips handler when middleware does not call next()", async () => {
    let handlerRan = false;
    const plaza = new Plaza<{}, {}, {}>()
      .use(async () => {
        // no next()
      })
      .on("evt", () => {
        handlerRan = true;
      });
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "evt", {}, {});
    expect(handlerRan).toBe(false);
  });

  it("forwards handler throws to onError", async () => {
    const errors: unknown[] = [];
    const plaza = new Plaza<{}, {}, {}>()
      .onError((err) => {
        errors.push(err);
      })
      .on("evt", () => {
        throw new Error("boom");
      });
    const { ws } = await connect(plaza, {});
    await sendFrame(plaza, ws, "evt", {}, {});
    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).message).toBe("boom");
  });
});

describe("Plaza.route", () => {
  it("flat merges sub events into parent", async () => {
    const seen: string[] = [];
    const sub = new Plaza<{}, {}, {}>().on("from-sub", () => {
      seen.push("sub-handler");
    });
    const parent = new Plaza<{}, {}, {}>().route(sub);
    const { ws } = await connect(parent, {});
    await sendFrame(parent, ws, "from-sub", {}, {});
    expect(seen).toEqual(["sub-handler"]);
  });

  it("prefixes sub events when route(prefix, sub) is used", async () => {
    const seen: string[] = [];
    const sub = new Plaza<{}, {}, {}>().on("ping", () => {
      seen.push("hit");
    });
    const parent = new Plaza<{}, {}, {}>().route("v1.", sub);
    const { ws } = await connect(parent, {});
    await sendFrame(parent, ws, "ping", {}, {});
    expect(seen).toEqual([]);
    await sendFrame(parent, ws, "v1.ping", {}, {});
    expect(seen).toEqual(["hit"]);
  });

  it("limits sub-scoped middleware to sub events", async () => {
    const order: string[] = [];
    const sub = new Plaza<{}, {}, {}>()
      .use(async (_c, next) => {
        order.push("sub-mw");
        await next();
      })
      .on("sub-evt", () => {
        order.push("sub-handler");
      });
    const parent = new Plaza<{}, {}, {}>()
      .use(async (_c, next) => {
        order.push("parent-mw");
        await next();
      })
      .route(sub)
      .on("parent-evt", () => {
        order.push("parent-handler");
      });
    const { ws } = await connect(parent, {});
    await sendFrame(parent, ws, "parent-evt", {}, {});
    await sendFrame(parent, ws, "sub-evt", {}, {});
    expect(order).toEqual([
      "parent-mw",
      "parent-handler",
      "parent-mw",
      "sub-mw",
      "sub-handler",
    ]);
  });

  it("runs sub onConnect/onClose handlers alongside parent's", async () => {
    const seen: string[] = [];
    const sub = new Plaza<{}, {}, {}>()
      .onConnect(() => {
        seen.push("sub-connect");
      })
      .onClose(() => {
        seen.push("sub-close");
      });
    const parent = new Plaza<{}, {}, {}>()
      .onConnect(() => {
        seen.push("parent-connect");
      })
      .onClose(() => {
        seen.push("parent-close");
      })
      .route(sub);

    const { ws, ctx } = await connect(parent, {});
    expect(seen).toEqual(["parent-connect", "sub-connect"]);
    await parent.close(ws as unknown as WebSocket, 1000, "", true, ctx, {});
    expect(seen).toEqual([
      "parent-connect",
      "sub-connect",
      "parent-close",
      "sub-close",
    ]);
  });

  it("supports nested route() chains, baking each layer's middleware once", async () => {
    const order: string[] = [];
    const inner = new Plaza<{}, {}, {}>()
      .use(async (_c, next) => {
        order.push("inner-mw");
        await next();
      })
      .on("evt", () => {
        order.push("handler");
      });
    const mid = new Plaza<{}, {}, {}>()
      .use(async (_c, next) => {
        order.push("mid-mw");
        await next();
      })
      .route(inner);
    const parent = new Plaza<{}, {}, {}>()
      .use(async (_c, next) => {
        order.push("parent-mw");
        await next();
      })
      .route(mid);

    const { ws } = await connect(parent, {});
    await sendFrame(parent, ws, "evt", {}, {});
    expect(order).toEqual(["parent-mw", "mid-mw", "inner-mw", "handler"]);
  });
});

describe("Plaza targeting in handlers", () => {
  it("c.emit broadcasts to all connections", async () => {
    const plaza = new Plaza<{}, {}, {}>().on("shout", (c) => {
      c.emit("shouted", { from: c.connection.id });
    });
    const a = await connect(plaza, {});
    const b = await connect(plaza, {});
    await sendFrame(plaza, a.ws, "shout", {}, {});
    expect(sentEvents(a.ws)).toHaveLength(1);
    expect(sentEvents(b.ws)).toHaveLength(1);
  });

  it("c.to({channel}).except(c.connection) skips the sender", async () => {
    const plaza = new Plaza<{}, {}, {}>()
      .on("join", (c) => {
        c.connection.joinChannel("room");
      })
      .on("message", (c) => {
        c.to({ channel: "room" }).except(c.connection).emit("message", {
          from: c.connection.id,
        });
      });
    const a = await connect(plaza, {});
    const b = await connect(plaza, {});
    await sendFrame(plaza, a.ws, "join", {}, {});
    await sendFrame(plaza, b.ws, "join", {}, {});
    await sendFrame(plaza, a.ws, "message", {}, {});
    expect(sentEvents(a.ws)).toEqual([]);
    expect(sentEvents(b.ws)).toHaveLength(1);
  });

  it("c.to({tag}) hits connections with the tag", async () => {
    const plaza = new Plaza<{}, {}, {}>()
      .on("identify", (c) => {
        c.connection.setTag("user-1");
      })
      .on("dm", (c) => {
        c.to({ tag: "user-1" }).emit("dm", { hi: true });
      });
    const a = await connect(plaza, {});
    const b = await connect(plaza, {});
    await sendFrame(plaza, a.ws, "identify", {}, {});
    await sendFrame(plaza, b.ws, "dm", {}, {});
    expect(sentEvents(a.ws)).toHaveLength(1);
    expect(sentEvents(b.ws)).toHaveLength(0);
  });

  it("c.connection.close() drops the connection before c.to() executes", async () => {
    const plaza = new Plaza<{}, {}, {}>()
      .on("join", (c) => {
        c.connection.joinChannel("room");
      })
      .on("ragequit", (c) => {
        c.connection.close();
        c.to({ channel: "room" }).emit("notice", { who: c.connection.id });
      });
    const a = await connect(plaza, {});
    const b = await connect(plaza, {});
    await sendFrame(plaza, a.ws, "join", {}, {});
    await sendFrame(plaza, b.ws, "join", {}, {});
    await sendFrame(plaza, a.ws, "ragequit", {}, {});
    expect(sentEvents(a.ws)).toEqual([]);
    expect(sentEvents(b.ws)).toHaveLength(1);
  });
});

describe("Plaza lifecycle", () => {
  it("fires onConnect on connect, onClose on close", async () => {
    const order: string[] = [];
    const plaza = new Plaza<{}, {}, {}>()
      .onConnect(() => order.push("connect"))
      .onClose((c) => order.push(`close:${c.code}:${c.reason}`));
    const { ws, ctx } = await connect(plaza, {});
    expect(order).toEqual(["connect"]);
    await plaza.close(ws as unknown as WebSocket, 1006, "bye", false, ctx, {});
    expect(order).toEqual(["connect", "close:1006:bye"]);
  });

  it("runs onClose even if a previous dispatch threw", async () => {
    const order: string[] = [];
    const plaza = new Plaza<{}, {}, {}>()
      .onClose(() => order.push("close"))
      .onError(() => order.push("error"))
      .on("boom", () => {
        throw new Error("nope");
      });
    const { ws, ctx } = await connect(plaza, {});
    await sendFrame(plaza, ws, "boom", {}, {}, ctx);
    expect(order).toContain("error");
    await plaza.close(ws as unknown as WebSocket, 1000, "", true, ctx, {});
    expect(order).toEqual(["error", "close"]);
  });

  it("forwards webSocketError through onError", async () => {
    const errors: unknown[] = [];
    const plaza = new Plaza<{}, {}, {}>().onError((err) => errors.push(err));
    const { ws, ctx } = await connect(plaza, {});
    await plaza.error(ws as unknown as WebSocket, new Error("net"), ctx, {});
    expect((errors[0] as Error).message).toBe("net");
  });
});

describe("Plaza._restoreConnection (hibernation rehydration)", () => {
  it("restores tags / channels / state from an attachment", async () => {
    interface State extends Record<string, unknown> {
      userId?: string;
    }
    let observed: {
      tags: string[];
      channels: string[];
      state: State;
    } | null = null;
    const plaza = new Plaza<State, {}>().on("inspect", (c) => {
      observed = {
        tags: [...c.connection.tags],
        channels: [...c.connection.channels],
        state: c.connection.state,
      };
    });
    const ws = new (await import("./_test-harness.ts")).FakeWebSocket();
    plaza._restoreConnection(ws as unknown as WebSocket, {
      id: "restored-1",
      tags: ["user-7"],
      channels: ["lobby", "room"],
      state: { userId: "user-7" },
    });
    await plaza.dispatch(
      ws as unknown as WebSocket,
      JSON.stringify({ event: "inspect", payload: {} }),
      {} as DurableObjectState,
      {},
    );
    expect(observed).toEqual({
      tags: ["user-7"],
      channels: ["lobby", "room"],
      state: { userId: "user-7" },
    });
  });

  it("does NOT re-fire onConnect when restoring", async () => {
    const connectCalls: string[] = [];
    const plaza = new Plaza<{}, {}>().onConnect((c) => {
      connectCalls.push(c.connection.id);
    });
    const ws = new (await import("./_test-harness.ts")).FakeWebSocket();
    plaza._restoreConnection(ws as unknown as WebSocket, {
      id: "restored-2",
      tags: [],
      channels: [],
      state: {},
    });
    expect(connectCalls).toEqual([]);
  });

  it("preserves the original id across restore", async () => {
    let observedId: string | null = null;
    const plaza = new Plaza<{}, {}>().on("inspect", (c) => {
      observedId = c.connection.id;
    });
    const ws = new (await import("./_test-harness.ts")).FakeWebSocket();
    plaza._restoreConnection(ws as unknown as WebSocket, {
      id: "stable-id-xyz",
      tags: [],
      channels: [],
      state: {},
    });
    await plaza.dispatch(
      ws as unknown as WebSocket,
      JSON.stringify({ event: "inspect", payload: {} }),
      {} as DurableObjectState,
      {},
    );
    expect(observedId).toBe("stable-id-xyz");
  });

  it("indexes restored tags so c.to({tag}) finds the connection", async () => {
    let count = 0;
    const plaza = new Plaza<{}, {}>().on("ping-tag", (c) => {
      for (const _ of c.to({ tag: "team-a" })) count++;
    });
    const ws = new (await import("./_test-harness.ts")).FakeWebSocket();
    plaza._restoreConnection(ws as unknown as WebSocket, {
      id: "x",
      tags: ["team-a"],
      channels: [],
      state: {},
    });
    await plaza.dispatch(
      ws as unknown as WebSocket,
      JSON.stringify({ event: "ping-tag", payload: {} }),
      {} as DurableObjectState,
      {},
    );
    expect(count).toBe(1);
  });
});

describe("Plaza attachment write", () => {
  it("writes attachment once per dispatch even when multiple mutators fire", async () => {
    const writes: unknown[] = [];
    const plaza = new Plaza<{ role?: string }, {}>().on("setup", (c) => {
      c.connection.setTag("t1");
      c.connection.joinChannel("ch1");
      c.connection.setState({ role: "admin" });
    });
    const { ws } = await connect(plaza, {});
    const originalSerialize = ws.serializeAttachment.bind(ws);
    ws.serializeAttachment = (value) => {
      writes.push(value);
      originalSerialize(value);
    };
    await sendFrame(plaza, ws, "setup", {}, {});
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      tags: ["t1"],
      channels: ["ch1"],
      state: { role: "admin" },
    });
  });
});

describe("Plaza serializer", () => {
  it("uses custom serialize/deserialize for the full round trip", async () => {
    const seen: { event: string; payload: unknown }[] = [];
    const plaza = new Plaza<{}, {}, {}>()
      .serialize((event, payload) => `wire:${event}|${JSON.stringify(payload)}`)
      .deserialize((data) => {
        const text =
          typeof data === "string" ? data : new TextDecoder().decode(data);
        const match = /^wire:([^|]+)\|(.+)$/.exec(text);
        if (!match) throw new Error("bad frame");
        return { event: match[1]!, payload: JSON.parse(match[2]!) };
      })
      .on("ping", (c) => {
        seen.push({ event: c.event, payload: c.valid("json") });
        c.connection.emit("pong", { reply: 1 });
      });

    const { ws } = await connect(plaza, {});
    await plaza.dispatch(
      ws as unknown as WebSocket,
      'wire:ping|{"x":2}',
      {} as DurableObjectState,
      {},
    );
    expect(seen).toEqual([{ event: "ping", payload: { x: 2 } }]);
    expect(ws.sent[0]).toBe('wire:pong|{"reply":1}');
  });
});
