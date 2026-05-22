# plaza-example-do

An example that runs Plaza on a Cloudflare Durable Object.

## Getting started

```bash
pnpm install
pnpm -F plaza-example-do dev
```

Open `http://localhost:8787/` in your browser to see the minimal client.

## Walkthrough scenarios

1. **Connect → authenticate → join → message**: Open two browser tabs against the same room (e.g. `main`), and run `authenticate` in each tab with a different `userId`. After both tabs `join lobby`, sending from one tab makes the other tab's log display a `message` event (and the sending tab does not receive it — that's `except(c.connection)`).
2. **Whisper (direct delivery by tag)**: Authenticate tab A as `alice` and tab B as `bob`. From tab A, send `to=bob`, `whisper=psst`, and only tab B will receive the `whisper` event.
3. **admin.announce (route prefix + predicate targeting)**: Authenticate tab C with role=`admin`, then send `announce`. The event will be delivered to every tab (`c.emit(...)` = broadcast to all).
4. **Reconnection**: Reload tab A and it will reconnect with a new `id`. Tab B is unaffected.
5. **Hibernation recovery**: Leave the tabs open long enough for the DO to enter hibernation, then send any event again. You can confirm that the runtime operates with `tag` / `channel` / `state` restored from the attachment (e.g. `whisper` still arrives).

## Files

- `src/index.tsx` — The Hono app plus the `ChatRoom` Durable Object. It merges three Plaza instances (`auth` / `chat` / `admin`), and `route("admin.", admin)` creates a prefixed namespace. `/` returns a minimal shell HTML built with `hono/jsx` + Tailwind CSS (CDN), `/ws` forwards to the DO, and other paths fall back to `ASSETS` to serve the build output (`public/client.js`).
- `src/client.tsx` — The client UI. It uses `useState` / `useRef` / `useCallback` from `hono/jsx/dom` to reactively manage the WebSocket connection, log display, and input form.
- `vite.config.ts` — Bundles the client (`src/client.tsx`) into `public/client.js`. JSX is transpiled for `hono/jsx/dom`.
- `tsconfig.json` / `tsconfig.client.json` — Split because the type information for the server (Workers types) and the client (DOM types) conflict.
- `wrangler.toml` — The DO binding `CHAT_ROOM` for the `ChatRoom` class, the `new_sqlite_classes` migration, and the `ASSETS` binding (`./public`).

## Development workflow

`pnpm dev` uses `concurrently` to run Vite (building the client with `--watch`) and `wrangler dev` simultaneously. When you update the client, Vite rebuilds `public/client.js`, and a browser reload picks up the changes.
