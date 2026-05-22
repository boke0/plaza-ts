import type { Connection } from "./connection.ts";
import type { Plaza } from "./plaza.ts";

export class FakeWebSocket {
  readonly sent: (string | ArrayBuffer)[] = [];
  closed: { code?: number; reason?: string } | null = null;
  attachment: unknown = null;
  failNextSend = false;
  failAllSends = false;

  send(data: string | ArrayBuffer | ArrayBufferView): void {
    if (this.failAllSends || this.failNextSend) {
      this.failNextSend = false;
      throw new Error("FakeWebSocket: simulated send failure");
    }
    if (data instanceof ArrayBuffer) {
      this.sent.push(data);
    } else if (typeof data === "string") {
      this.sent.push(data);
    } else {
      this.sent.push(
        data.buffer.slice(
          data.byteOffset,
          data.byteOffset + data.byteLength,
        ) as ArrayBuffer,
      );
    }
  }

  close(code?: number, reason?: string): void {
    this.closed = { code, reason };
  }

  serializeAttachment(value: unknown): void {
    this.attachment = value;
  }

  deserializeAttachment(): unknown {
    return this.attachment;
  }
}

export function fakeDOState(): DurableObjectState {
  const sockets: WebSocket[] = [];
  return {
    acceptWebSocket(ws: WebSocket) {
      sockets.push(ws);
    },
    getWebSockets() {
      return sockets;
    },
    storage: {} as DurableObjectStorage,
  } as unknown as DurableObjectState;
}

export async function connect<
  S extends Record<string, unknown>,
  En,
  E extends Record<string, unknown>,
>(
  plaza: Plaza<S, En, E>,
  env: En,
  ctx: DurableObjectState = fakeDOState(),
): Promise<{
  ws: FakeWebSocket;
  ctx: DurableObjectState;
  conn: Connection<S>;
}> {
  const ws = new FakeWebSocket();
  const conn = await plaza._accept(ws as unknown as WebSocket, ctx, env);
  return { ws, ctx, conn };
}

export async function sendFrame<
  S extends Record<string, unknown>,
  En,
  E extends Record<string, unknown>,
>(
  plaza: Plaza<S, En, E>,
  ws: FakeWebSocket,
  event: string,
  payload: unknown,
  env: En,
  ctx: DurableObjectState = fakeDOState(),
): Promise<void> {
  await plaza.dispatch(
    ws as unknown as WebSocket,
    JSON.stringify({ event, payload }),
    ctx,
    env,
  );
}

export function sentEvents(
  ws: FakeWebSocket,
): { event: string; payload: unknown }[] {
  return ws.sent.map((frame) => {
    const text =
      typeof frame === "string" ? frame : new TextDecoder().decode(frame);
    return JSON.parse(text) as { event: string; payload: unknown };
  });
}
