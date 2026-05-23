# Plaza

A type-safe WebSocket framework, primarily designed to run on Cloudflare Durable Objects.

Plaza gives you [Hono](https://hono.dev/)-like ergonomics for real-time apps: name your events, validate their payloads with [Standard Schema](https://standardschema.dev/) (zod, valibot, arktype, ...), and dispatch messages to exactly the connections you want — without giving up end-to-end type inference between server and client.

## Why Plaza?

- **Event-name routing** — Just like HTTP routes, but for WebSocket messages.
- **Server-initiated tasks** — Trigger handlers from alarms, RPC, or any server code with `.task()` and `runTask()`; clients can't fire them.
- **Type-safe payloads** — Standard Schema validators turn `c.valid("json")` into a fully inferred object.
- **[Hono](https://hono.dev/)-like middleware** — `.use()` for logging, auth, rate-limiting, anything you need before a handler runs.
- **First-class targeting** — Send to a single connection, a tag, a channel, a predicate, or everyone. Indexed lookups are O(1).
- **Mergeable apps** — Compose multiple `Plaza` instances with `.route()`, sharing a single connection across modules.
- **Durable Object adapter** — One line to wire up `fetch`, `webSocketMessage`, `webSocketClose`, and Hibernation state restoration.
- **Pluggable wire format** — `.serialize` / `.deserialize` let you swap JSON for MessagePack, CBOR, protobuf, or anything else.

## Installation

```bash
pnpm add plaza-ts
# or
npm install plaza-ts
# or
yarn add plaza-ts
```

Plaza relies on [Standard Schema](https://standardschema.dev/), so install a compatible validator such as `zod`:

```bash
pnpm add zod
```

If you target Cloudflare Workers / Durable Objects:

```bash
pnpm add -D @cloudflare/workers-types wrangler
```

## Quick start

```typescript
import { Plaza, validator } from "plaza-ts";
import { z } from "zod";

const plaza = new Plaza()
  .onConnect((c) => {
    c.emit("system", { message: "a user joined" });
  })
  .handle(
    "greeting",
    validator(z.object({ channel: z.string(), message: z.string() })),
    (c) => {
      const { channel, message } = c.valid("json");
      c.to({ channel }).except(c.connection).emit("greeting", { message });
    },
  );
```

That's a complete app: a connect handler that broadcasts a system message and a `greeting` handler that re-broadcasts the message to everyone in the same channel except the sender.

## Running on a Cloudflare Durable Object

The `plaza-ts/durable-object` adapter wires Plaza into a Cloudflare Durable Object's lifecycle.

```typescript
import { Plaza, validator } from "plaza-ts";
import { durableObject } from "plaza-ts/durable-object";
import { z } from "zod";

interface State extends Record<string, unknown> {
  userId?: string;
}

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
}

const plaza = new Plaza<State, Env>()
  .handle(
    "authenticate",
    validator(z.object({ userId: z.string() })),
    (c) => {
      const { userId } = c.valid("json");
      c.connection.setTag(userId);
      c.connection.setState({ userId });
    },
  )
  .handle(
    "join",
    validator(z.object({ channel: z.string() })),
    (c) => {
      c.connection.joinChannel(c.valid("json").channel);
    },
  )
  .handle(
    "message",
    validator(z.object({ channel: z.string(), text: z.string() })),
    (c) => {
      const { channel, text } = c.valid("json");
      c.to({ channel }).except(c.connection).emit("message", { text });
    },
  );

export class ChatRoom extends durableObject(plaza) {}
```

…and in your `wrangler.toml`:

```toml
[[durable_objects.bindings]]
name = "CHAT_ROOM"
class_name = "ChatRoom"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["ChatRoom"]
```

Then in your Worker `fetch` handler:

```typescript
export default {
  async fetch(request: Request, env: Env) {
    const id = env.CHAT_ROOM.idFromName("main");
    return env.CHAT_ROOM.get(id).fetch(request);
  },
};
```

The adapter takes care of:

| Cloudflare Durable Object method | What the adapter does |
|---|---|
| `fetch` | Accepts the WebSocket upgrade with `ctx.acceptWebSocket` |
| `webSocketMessage` | `deserialize` → middleware → matching handler |
| `webSocketClose` | Fires your `.onClose` handlers |
| `webSocketError` | Fires your `.onError` handlers |
| Hibernation wake-up | Restores `tag` / `channel` / `state` from the WebSocket's attachment |
| `runTask(name, payload)` (added) | Calls `plaza.runTask` with the bound `ctx` / `env` (see [Server-side tasks](#server-side-tasks)) |

If you need to mix HTTP routes and WebSockets in the same Cloudflare Durable Object, drop down to the low-level API: `plaza.upgrade`, `plaza.dispatch`, `plaza.close`, `plaza.error`.

## Core concepts

### Connections

Every WebSocket has a `Connection` object exposing identity, metadata, and grouping:

```typescript
c.connection.id                       // auto-generated unique ID
c.connection.tags                     // ReadonlySet<string>
c.connection.channels                 // ReadonlySet<string>
c.connection.state                    // your app-defined State

c.connection.setTag("user-123");
c.connection.joinChannel("room-7");
c.connection.setState({ role: "admin" });
c.connection.emit("event", payload);  // send to just this connection
c.connection.close(1000, "bye");
```

### Tags vs. channels

Both are O(1) indexes, but they communicate intent:

| | Meaning | Example |
|---|---|---|
| `tag` | What the connection **is** (identity) | `user-123`, `device-abc` |
| `channel` | Where the connection **is** (membership) | `lobby`, `room-7` |

### Targeting

All sending goes through `emit(event, payload)`. The differences are in how you select the recipients:

```typescript
c.emit(event, payload);                              // everyone
c.connection.emit(event, payload);                   // only this connection
c.to({ tag: "user-123" }).emit(event, payload);      // O(1) by tag
c.to({ channel: "lobby" }).emit(event, payload);     // O(1) by channel
c.to((conn) => conn.state.role === "admin").emit(... );  // predicate (O(n))
c.to({ channel: "lobby" }).except(c.connection).emit(...);  // chainable filter
```

| Targeting | Complexity |
|---|---|
| `c.emit()` | O(n) |
| `c.to({ tag })` / `c.to({ channel })` | O(1) lookup + O(k) emit |
| `c.to(predicate)` | O(n × p) |

Prefer indexed targets on hot paths; reach for predicates when you need flexibility.

### Middleware

Middleware runs before every event handler, just like [Hono](https://hono.dev/). It runs for both client messages and server-side [tasks](#server-side-tasks); use the `c.kind` discriminator when you need to touch connection-only state:

```typescript
plaza.use(async (c, next) => {
  console.log(`[${c.kind}] ${c.event}`); // "message" or "task"
  await next();
});
```

If you don't call `next()`, downstream handlers are skipped.

### Composition with `.route()`

Split your app into modules and merge them. Per-module middleware only applies to that module's events:

```typescript
const auth = new Plaza()
  .use(rateLimit)
  .handle("login", ...)
  .handle("logout", ...);

const chat = new Plaza()
  .use(requireAuth)
  .handle("message", ...)
  .handle("typing", ...);

const app = new Plaza()
  .use(logger)         // applies to everything
  .route(auth)         // adds login/logout (with rateLimit)
  .route(chat)         // adds message/typing (with requireAuth)
  .route("admin.", adminPlaza);  // prefixes events: admin.kick, admin.ban, ...

export type AppType = typeof app;  // export for client-side type inference
```

The prefix separator is up to you — use `"v1:"`, `"v1."`, `"v1/"`, whatever you like.

Merged apps share one connection: `c.connection`, tags, channels, state, and `c.to(...)` all operate over the combined connection set.

### Server-side tasks

Sometimes you need to push to clients from server-only code — a Durable Object
alarm, an RPC call from another Worker, or a follow-up action inside another
handler. Register these with `.task()` and trigger them with `plaza.runTask()`:

```typescript
const plaza = new Plaza<{}, Env>()
  .handle("subscribe", (c) => {
    c.connection.joinChannel("updates");
  })
  .task(
    "broadcast-notice",
    validator(z.object({ text: z.string() })),
    (c) => {
      // c.kind === "task" — no triggering connection, so c.connection is null.
      c.to({ channel: "updates" }).emit("notice", { text: c.valid("json").text });
    },
  );

// Fire a task. Returns Promise<void>; await it to know when handlers finish.
await plaza.runTask(ctx, env, "broadcast-notice", { text: "maintenance in 5 min" });
```

Key differences vs `.handle()`:

| | `.handle()` (client message) | `.task()` (server only) |
|---|---|---|
| Triggered by | `ws.send(...)` from a client | `plaza.runTask(...)` from your code |
| `c.kind` | `"message"` | `"task"` |
| `c.connection` | `Connection<State>` | `null` |

Tasks live on a separate `Tasks` type generic, so clients can't see them through `InferEvents` and `runTask` only accepts registered task names. See [`Plaza`](./docs/index/classes/Plaza.md) and [`InferTasks`](./docs/index/type-aliases/InferTasks.md) for the full type surface.

Cross-kind invocation is rejected:

- A client sending a name registered as `.task()` triggers your `.onError(...)` handlers with [`PlazaKindMismatchError`](./docs/index/classes/PlazaKindMismatchError.md).
- `plaza.runTask(...)` called with a `.handle()` name throws `PlazaKindMismatchError`; an unregistered name throws [`PlazaUnknownTaskError`](./docs/index/classes/PlazaUnknownTaskError.md).

#### Calling `runTask` from inside handlers

Both message handlers and task handlers can chain tasks via `c.runTask()` (it
reuses the current `ctx` / `env`):

```typescript
plaza
  .task("cleanup", (c) => { /* ... */ })
  .handle("admin-trigger", async (c) => {
    await c.runTask("cleanup", { reason: "manual" });
  });
```

#### From a Durable Object

The DO adapter exposes `this.runTask(name, payload)` so alarms and RPC methods
don't have to thread `ctx` / `env` themselves:

```typescript
export class ChatRoom extends durableObject(plaza) {
  override async alarm() {
    await this.runTask("broadcast-notice", { text: "scheduled ping" });
  }
}
```

#### Middleware applies to both kinds

`.use()` middleware runs for both client messages and server tasks. Discriminate
via `c.kind` when you need to access connection-only state:

```typescript
plaza.use(async (c, next) => {
  console.log(`[${c.kind}] ${c.event}`);
  if (c.kind === "message" && !c.connection.state.userId) {
    c.connection.emit("error", { reason: "unauth" });
    return; // do not call next()
  }
  await next();
});
```

### Custom wire format

By default Plaza ships `JSON.stringify` / `JSON.parse` over a `{ event, payload }` envelope. Swap it for anything you want:

```typescript
new Plaza()
  .serialize((event, payload) =>
    JSON.stringify({ event, payload: JSON.stringify(payload) }),
  )
  .deserialize((data) => {
    const { event, payload } = JSON.parse(data as string);
    return { event, payload: JSON.parse(payload) };
  });
```

Only the root `Plaza` controls serialization — child Plazas passed to `.route()` cannot override it.

### Authentication

WebSocket handshakes can't carry arbitrary headers, so you have two options:

1. **Before connect** — Inspect the URL query string, cookies, or `Sec-WebSocket-Protocol` in your `fetch` handler before upgrading.
2. **First message** — Define an `authenticate` event; use middleware to reject other events until the connection has identified itself.

```typescript
const chat = new Plaza<State>()
  .use(async (c, next) => {
    // Only gate client messages — tasks come from trusted server code.
    if (c.kind === "message" && !c.connection.state.userId) {
      c.connection.emit("error", { reason: "not authenticated" });
      return; // do not call next()
    }
    await next();
  })
  .handle("message", ...);
```

## Lifecycle hooks

```typescript
plaza
  .onConnect((c) => { /* connection opened */ })
  .onClose((c)   => { /* c.code, c.reason, c.wasClean */ })
  .onError((err, c) => { /* exception inside a handler or task */ });
```

All three are stackable and run in the order they were registered, including hooks attached to sub-Plazas. `onConnect` / `onClose` only fire for client connections; `onError` is also invoked for failures inside `.task()` handlers (with `c.kind === "task"`).

## Migrating from `.on()`

`.handle()` replaces `.on()` for registering client-message handlers. `.on()` is still exported as a deprecated alias and forwards to `.handle()`, so existing code keeps working — but new code should prefer `.handle()` for symmetry with `.task()`.

```diff
- plaza.on("greeting", ...)
+ plaza.handle("greeting", ...)
```

## Example

A complete chat room app — auth, channels, whispers, admin announcements, and a browser client — lives in [`examples/durable-object`](./examples/durable-object).

## API References

See the generated API reference under [`docs/`](./docs/README.md).

## License

MIT
