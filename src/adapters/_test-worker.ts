import { z } from "zod";
import { Plaza } from "../plaza.ts";
import { validator } from "../validator.ts";
import { durableObject } from "./durable-object.ts";

interface State extends Record<string, unknown> {
  userId?: string;
  role?: string;
}

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
}

const plaza = new Plaza<State, Env>()
  .onConnect((c) => {
    c.connection.emit("welcome", { id: c.connection.id });
  })
  .on(
    "authenticate",
    validator(z.object({ userId: z.string(), role: z.string().optional() })),
    (c) => {
      const { userId, role } = c.valid("json");
      c.connection.setTag(userId);
      c.connection.setState({ userId, role: role ?? "user" });
      c.connection.emit("authed", { userId });
    },
  )
  .on("join", validator(z.object({ channel: z.string() })), (c) => {
    c.connection.joinChannel(c.valid("json").channel);
    c.connection.emit("joined", { channel: c.valid("json").channel });
  })
  .on(
    "message",
    validator(z.object({ channel: z.string(), text: z.string() })),
    (c) => {
      const { channel, text } = c.valid("json");
      c.to({ channel })
        .except(c.connection)
        .emit("message", { from: c.connection.state.userId, text });
    },
  )
  .on(
    "whisper",
    validator(z.object({ to: z.string(), text: z.string() })),
    (c) => {
      const { to, text } = c.valid("json");
      c.to({ tag: to }).emit("whisper", {
        from: c.connection.state.userId,
        text,
      });
    },
  )
  .on("ctxcheck", (c) => {
    c.connection.emit("ctxcheck-result", {
      hasStorage:
        c.executionCtx !== undefined &&
        typeof c.executionCtx.storage === "object",
      hasEnv: typeof c.env.CHAT_ROOM === "object",
    });
  })
  .on("self-close", (c) => {
    c.connection.close(1000, "client requested");
  })
  .task("broadcast", validator(z.object({ text: z.string() })), (c) => {
    c.emit("broadcast", { text: c.valid("json").text });
  });

export class ChatRoom extends durableObject(plaza) {
  // user-defined method coexisting with the adapter
  override async alarm(): Promise<void> {
    // no-op for tests
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      const room = url.searchParams.get("room") ?? "default";
      const id = env.CHAT_ROOM.idFromName(room);
      return env.CHAT_ROOM.get(id).fetch(req);
    }
    return new Response("not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
