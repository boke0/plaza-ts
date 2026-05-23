import { Hono } from "hono";
import { html } from "hono/html";
import { Plaza, validator } from "plaza-ts";
import { durableObject } from "plaza-ts/durable-object";
import { z } from "zod";

interface State extends Record<string, unknown> {
  userId?: string;
  role?: "user" | "admin";
}

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
  ASSETS: Fetcher;
}

const auth = new Plaza<State, Env>().on(
  "authenticate",
  validator(
    z.object({
      userId: z.string().min(1),
      role: z.enum(["user", "admin"]).default("user"),
    }),
  ),
  (c) => {
    const { userId, role } = c.valid("json");
    c.connection.setTag(userId).setState({ userId, role });
    c.connection.emit("authed", { userId, role });
  },
);

const chat = new Plaza<State, Env>()
  .use(async (c, next) => {
    if (!c.connection.state.userId) {
      c.connection.emit("error", { reason: "not authenticated" });
      return;
    }
    await next();
  })
  .on("join", validator(z.object({ channel: z.string() })), (c) => {
    const { channel } = c.valid("json");
    c.connection.joinChannel(channel);
    c.connection.emit("joined", { channel });
  })
  .on(
    "message",
    validator(z.object({ channel: z.string(), text: z.string() })),
    async (c) => {
      const { channel, text } = c.valid("json");
      const stamp = Date.now();
      await c.executionCtx.storage.put(`msg:${stamp}:${c.connection.id}`, {
        from: c.connection.state.userId,
        text,
      });
      c.to({ channel }).except(c.connection).emit("message", {
        from: c.connection.state.userId,
        channel,
        text,
      });
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
  );

const admin = new Plaza<State, Env>()
  .use(async (c, next) => {
    if (c.connection.state.role !== "admin") return;
    await next();
  })
  .on("announce", validator(z.object({ text: z.string() })), (c) => {
    c.emit("announce", { text: c.valid("json").text });
  });

const plaza = new Plaza<State, Env>()
  .onConnect((c) => {
    c.connection.emit("hello", { id: c.connection.id });
  })
  .onClose(() => {
    // best-effort housekeeping
  })
  .onError((err, c) => {
    console.error(`[${c.connection.id}] ${c.event}:`, err);
    c.connection.emit("error", { reason: String(err) });
  })
  .use(async (c, next) => {
    console.log(`[${c.connection.id}] ${c.event}`);
    await next();
  })
  .route(auth)
  .route(chat)
  .route("admin.", admin);

export type AppType = typeof plaza;

export class ChatRoom extends durableObject(plaza) {}

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) =>
  c.html(html`<!doctype html>
<html lang="ja" class="h-full">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Plaza example — DO chat</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  </head>
  <body
    class="min-h-full bg-slate-50 text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100"
  >
    <div id="root"></div>
    <script type="module" src="/client.js"></script>
  </body>
</html>`),
);

app.all("/ws", (c) => {
  const room = c.req.query("room") ?? "main";
  const id = c.env.CHAT_ROOM.idFromName(room);
  return c.env.CHAT_ROOM.get(id).fetch(c.req.raw);
});

app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
