import { describe, expect, it } from "vitest";
import { FakeWebSocket } from "./_test-harness.ts";
import { Connection } from "./connection.ts";
import { ConnectionRegistry } from "./registry.ts";
import { defaultSerialize } from "./serializer.ts";

function makeConn(id: string) {
  const registry = new ConnectionRegistry<{}>();
  const ws = new FakeWebSocket();
  const conn = new Connection<{}>(ws, id, {}, registry, defaultSerialize);
  registry.add(conn);
  return { conn, registry, ws };
}

describe("ConnectionRegistry", () => {
  it("indexes tags symmetrically", () => {
    const { conn, registry } = makeConn("a");
    conn.setTag("user-1");
    expect(conn.tags.has("user-1")).toBe(true);
    expect(registry.byTagLookup("user-1")?.has(conn)).toBe(true);
    conn.removeTag("user-1");
    expect(conn.tags.has("user-1")).toBe(false);
    expect(registry.byTagLookup("user-1")).toBeUndefined();
  });

  it("indexes channels symmetrically", () => {
    const { conn, registry } = makeConn("a");
    conn.joinChannel("lobby");
    expect(conn.channels.has("lobby")).toBe(true);
    expect(registry.byChannelLookup("lobby")?.has(conn)).toBe(true);
    conn.leaveChannel("lobby");
    expect(registry.byChannelLookup("lobby")).toBeUndefined();
  });

  it("remove() prunes tag and channel indexes", () => {
    const { conn, registry } = makeConn("a");
    conn.setTag("t1");
    conn.joinChannel("ch1");
    registry.remove(conn);
    expect(registry.byId.has("a")).toBe(false);
    expect(registry.byTagLookup("t1")).toBeUndefined();
    expect(registry.byChannelLookup("ch1")).toBeUndefined();
  });

  it("close() immediately drops from registry", () => {
    const { conn, registry } = makeConn("a");
    conn.setTag("t1");
    conn.close();
    expect(registry.byId.has("a")).toBe(false);
    expect(registry.byTagLookup("t1")).toBeUndefined();
  });
});
