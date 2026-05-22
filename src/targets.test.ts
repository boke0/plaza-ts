import { describe, expect, it } from "vitest";
import { FakeWebSocket } from "./_test-harness.ts";
import { Connection } from "./connection.ts";
import { ConnectionRegistry } from "./registry.ts";
import { defaultSerialize } from "./serializer.ts";
import { Targets, createTargets } from "./targets.ts";

function setup() {
  const registry = new ConnectionRegistry<{ role?: string }>();
  const make = (id: string, state: { role?: string } = {}) => {
    const ws = new FakeWebSocket();
    const conn = new Connection(ws, id, state, registry, defaultSerialize);
    registry.add(conn);
    return { conn, ws };
  };
  return { registry, make };
}

describe("Targets", () => {
  it("to/except return new Targets (immutable chain)", () => {
    const { registry } = setup();
    const t = createTargets<{ role?: string }, {}, {}>(
      registry,
      defaultSerialize,
    );
    const t1 = t.to({ tag: "x" });
    const t2 = t1.except();
    expect(t).not.toBe(t1);
    expect(t1).not.toBe(t2);
    expect(t1 instanceof Targets).toBe(true);
  });

  it("dispatches to tag index", () => {
    const { registry, make } = setup();
    const { conn: a, ws: aWs } = make("a");
    const { conn: b, ws: bWs } = make("b");
    a.setTag("alpha");
    b.setTag("beta");
    createTargets<{ role?: string }, {}, { evt: { x: number } }>(
      registry,
      defaultSerialize,
    )
      .to({ tag: "alpha" })
      .emit("evt", { x: 1 });
    expect(aWs.sent).toHaveLength(1);
    expect(bWs.sent).toHaveLength(0);
  });

  it("filters via predicate", () => {
    const { registry, make } = setup();
    const { ws: aWs } = make("a", { role: "admin" });
    const { ws: bWs } = make("b", { role: "user" });
    createTargets<{ role?: string }, {}, { evt: { x: number } }>(
      registry,
      defaultSerialize,
    )
      .to((conn) => conn.state.role === "admin")
      .emit("evt", { x: 1 });
    expect(aWs.sent).toHaveLength(1);
    expect(bWs.sent).toHaveLength(0);
  });

  it("excludes specific connections", () => {
    const { registry, make } = setup();
    const { conn: a, ws: aWs } = make("a");
    const { ws: bWs } = make("b");
    createTargets<{ role?: string }, {}, { evt: { x: number } }>(
      registry,
      defaultSerialize,
    )
      .except(a)
      .emit("evt", { x: 1 });
    expect(aWs.sent).toHaveLength(0);
    expect(bWs.sent).toHaveLength(1);
  });

  it("isolates a dead socket and continues broadcasting", () => {
    const { registry, make } = setup();
    const { ws: aWs } = make("a");
    const { ws: bWs } = make("b");
    aWs.failAllSends = true;
    createTargets<{ role?: string }, {}, { evt: { x: number } }>(
      registry,
      defaultSerialize,
    ).emit("evt", { x: 1 });
    expect(bWs.sent).toHaveLength(1);
    expect(registry.byId.has("a")).toBe(false);
    expect(registry.byId.has("b")).toBe(true);
  });

  it("serializes the frame once and reuses bytes", () => {
    const calls: string[] = [];
    const tracingSerialize = (event: string, payload: unknown) => {
      calls.push(event);
      return JSON.stringify({ event, payload });
    };
    const registry = new ConnectionRegistry<{}>();
    const a = new Connection(
      new FakeWebSocket(),
      "a",
      {},
      registry,
      tracingSerialize,
    );
    const b = new Connection(
      new FakeWebSocket(),
      "b",
      {},
      registry,
      tracingSerialize,
    );
    registry.add(a);
    registry.add(b);
    createTargets<{}, {}, { evt: { x: number } }>(
      registry,
      tracingSerialize,
    ).emit("evt", { x: 1 });
    expect(calls).toEqual(["evt"]);
  });
});
