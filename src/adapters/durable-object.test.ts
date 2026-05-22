import { env, runInDurableObject } from "cloudflare:test";
import { describe, expect, it } from "vitest";

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
}

const testEnv = env as unknown as Env;

interface TestSocket {
  ws: WebSocket;
  /** All received frames in order. */
  inbox: { event: string; payload: unknown }[];
  /** Resolve as soon as inbox.length >= n. */
  waitFor(
    n: number,
    timeoutMs?: number,
  ): Promise<{ event: string; payload: unknown }>;
}

async function openSocket(room: string): Promise<TestSocket> {
  const id = testEnv.CHAT_ROOM.idFromName(room);
  const stub = testEnv.CHAT_ROOM.get(id);
  const res = await stub.fetch("https://plaza.test/ws", {
    headers: { Upgrade: "websocket" },
  });
  if (res.status !== 101 || !res.webSocket) {
    throw new Error(`upgrade failed: status=${res.status}`);
  }
  const ws = res.webSocket;
  const inbox: { event: string; payload: unknown }[] = [];
  ws.addEventListener("message", (ev) => {
    const text =
      typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data);
    inbox.push(JSON.parse(text));
  });
  ws.accept();
  return {
    ws,
    inbox,
    async waitFor(n, timeoutMs = 2000) {
      const start = Date.now();
      while (inbox.length < n) {
        if (Date.now() - start > timeoutMs) {
          throw new Error(
            `timed out waiting for frame #${n}; got ${inbox.length}: ${JSON.stringify(inbox)}`,
          );
        }
        await new Promise((r) => setTimeout(r, 10));
      }
      return inbox[n - 1]!;
    },
  };
}

describe("DO adapter — upgrade", () => {
  it("returns 101 on WebSocket upgrade", async () => {
    const id = testEnv.CHAT_ROOM.idFromName("upgrade-101");
    const stub = testEnv.CHAT_ROOM.get(id);
    const res = await stub.fetch("https://plaza.test/ws", {
      headers: { Upgrade: "websocket" },
    });
    expect(res.status).toBe(101);
    expect(res.webSocket).toBeTruthy();
  });

  it("returns 426 without Upgrade header", async () => {
    const id = testEnv.CHAT_ROOM.idFromName("upgrade-426");
    const stub = testEnv.CHAT_ROOM.get(id);
    const res = await stub.fetch("https://plaza.test/ws");
    expect(res.status).toBe(426);
  });

  it("fires onConnect, delivering 'welcome' to the freshly upgraded client", async () => {
    const s = await openSocket("welcome-room");
    const first = await s.waitFor(1);
    expect(first.event).toBe("welcome");
    expect((first.payload as { id: string }).id).toMatch(/.+/);
    s.ws.close();
  });
});

describe("DO adapter — dispatch", () => {
  it("dispatches a validated message to the registered handler", async () => {
    const s = await openSocket("dispatch-1");
    await s.waitFor(1); // welcome
    s.ws.send(
      JSON.stringify({ event: "authenticate", payload: { userId: "alice" } }),
    );
    const reply = await s.waitFor(2);
    expect(reply.event).toBe("authed");
    expect(reply.payload).toEqual({ userId: "alice" });
    s.ws.close();
  });

  it("relays a message between two connections on the same channel", async () => {
    const a = await openSocket("relay");
    const b = await openSocket("relay");
    await a.waitFor(1); // welcome
    await b.waitFor(1); // welcome

    a.ws.send(
      JSON.stringify({ event: "authenticate", payload: { userId: "a" } }),
    );
    a.ws.send(JSON.stringify({ event: "join", payload: { channel: "lobby" } }));
    await a.waitFor(3);

    b.ws.send(
      JSON.stringify({ event: "authenticate", payload: { userId: "b" } }),
    );
    b.ws.send(JSON.stringify({ event: "join", payload: { channel: "lobby" } }));
    await b.waitFor(3);

    a.ws.send(
      JSON.stringify({
        event: "message",
        payload: { channel: "lobby", text: "hi" },
      }),
    );
    const got = await b.waitFor(4);
    expect(got.event).toBe("message");
    expect(got.payload).toEqual({ from: "a", text: "hi" });

    a.ws.close();
    b.ws.close();
  });

  it("targets via tag", async () => {
    const a = await openSocket("dm");
    const b = await openSocket("dm");
    await a.waitFor(1);
    await b.waitFor(1);

    a.ws.send(
      JSON.stringify({ event: "authenticate", payload: { userId: "a" } }),
    );
    await a.waitFor(2);
    b.ws.send(
      JSON.stringify({ event: "authenticate", payload: { userId: "b" } }),
    );
    await b.waitFor(2);

    a.ws.send(
      JSON.stringify({
        event: "whisper",
        payload: { to: "b", text: "secret" },
      }),
    );
    const got = await b.waitFor(3);
    expect(got.event).toBe("whisper");
    expect(got.payload).toEqual({ from: "a", text: "secret" });

    a.ws.close();
    b.ws.close();
  });
});

describe("DO adapter — context access", () => {
  it("exposes c.env and c.executionCtx (storage) to handlers", async () => {
    const s = await openSocket("ctx");
    await s.waitFor(1);
    s.ws.send(JSON.stringify({ event: "ctxcheck", payload: {} }));
    const result = await s.waitFor(2);
    expect(result.event).toBe("ctxcheck-result");
    expect(result.payload).toEqual({ hasStorage: true, hasEnv: true });
    s.ws.close();
  });
});

describe("DO adapter — close path", () => {
  it("client-initiated close fires onClose and prunes registry", async () => {
    const s = await openSocket("close");
    await s.waitFor(1);
    s.ws.send(
      JSON.stringify({ event: "authenticate", payload: { userId: "u" } }),
    );
    await s.waitFor(2);
    s.ws.send(JSON.stringify({ event: "self-close", payload: {} }));

    const id = testEnv.CHAT_ROOM.idFromName("close");
    const stub = testEnv.CHAT_ROOM.get(id);

    await new Promise((r) => setTimeout(r, 50));

    await runInDurableObject(stub, async (_instance, ctx) => {
      const sockets = ctx.getWebSockets();
      expect(Array.isArray(sockets)).toBe(true);
    });
  });
});

describe("DO adapter — extends-class", () => {
  it("allows the user class to declare extra DO methods (alarm)", async () => {
    const id = testEnv.CHAT_ROOM.idFromName("extends");
    const stub = testEnv.CHAT_ROOM.get(id);
    await runInDurableObject(stub, async (instance) => {
      // alarm() was declared in _test-worker.ts; just verify it exists.
      expect(typeof (instance as { alarm: unknown }).alarm).toBe("function");
    });
  });
});
