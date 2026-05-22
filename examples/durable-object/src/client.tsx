/** @jsxImportSource hono/jsx/dom */
import { render, useCallback, useRef, useState } from "hono/jsx/dom";

const fieldClass =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
const labelClass =
  "inline-block w-28 text-sm font-medium text-slate-700 dark:text-slate-300";
const buttonClass =
  "rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900";
const subtleButtonClass =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-offset-slate-900";
const fieldsetClass =
  "mb-4 space-y-2 rounded-lg border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-800/40";
const legendClass =
  "px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

function App() {
  const [room, setRoom] = useState("main");
  const [userId, setUserId] = useState("alice");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [channel, setChannel] = useState("lobby");
  const [message, setMessage] = useState("hello");
  const [target, setTarget] = useState("bob");
  const [whisper, setWhisper] = useState("psst");
  const [announce, setAnnounce] = useState("hello world");
  const [status, setStatus] = useState("disconnected");
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const appendLog = useCallback((line: string) => {
    setLogs((prev) => [...prev, line]);
    queueMicrotask(() => {
      const el = logRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const send = useCallback(
    (event: string, payload: unknown) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        appendLog("(not connected)");
        return;
      }
      ws.send(JSON.stringify({ event, payload }));
      appendLog(`> ${event} ${JSON.stringify(payload)}`);
    },
    [appendLog],
  );

  const connect = useCallback(() => {
    const url = new URL(
      `/ws?room=${encodeURIComponent(room || "main")}`,
      location.href,
    );
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(url.toString());
    wsRef.current = ws;
    setStatus(`connecting to ${url}`);
    ws.onopen = () => setStatus("connected");
    ws.onclose = (ev) => setStatus(`closed: ${ev.code} ${ev.reason}`);
    ws.onerror = () => appendLog("(error)");
    ws.onmessage = (ev) => appendLog(`< ${ev.data}`);
  }, [room, appendLog]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  return (
    <main class="mx-auto max-w-3xl px-4 py-8">
      <header class="mb-6 flex items-baseline justify-between">
        <h1 class="text-xl font-semibold">
          Plaza — Durable Object chat room
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">{status}</p>
      </header>

      <fieldset class={fieldsetClass}>
        <legend class={legendClass}>connection</legend>
        <div class="flex flex-wrap items-center gap-2">
          <label for="room" class={labelClass}>
            room
          </label>
          <input
            id="room"
            type="text"
            value={room}
            onInput={(e) => setRoom((e.currentTarget as HTMLInputElement).value)}
            class={fieldClass}
          />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <label for="userId" class={labelClass}>
            userId
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onInput={(e) =>
              setUserId((e.currentTarget as HTMLInputElement).value)
            }
            class={fieldClass}
          />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <label for="role" class={labelClass}>
            role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) =>
              setRole(
                (e.currentTarget as HTMLSelectElement).value as
                  | "user"
                  | "admin",
              )
            }
            class={fieldClass}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          <button type="button" class={buttonClass} onClick={connect}>
            connect
          </button>
          <button
            type="button"
            class={buttonClass}
            onClick={() => send("authenticate", { userId, role })}
          >
            authenticate
          </button>
          <button
            type="button"
            class={subtleButtonClass}
            onClick={disconnect}
          >
            disconnect
          </button>
        </div>
      </fieldset>

      <fieldset class={fieldsetClass}>
        <legend class={legendClass}>channel</legend>
        <div class="flex flex-wrap items-center gap-2">
          <label for="channel" class={labelClass}>
            channel
          </label>
          <input
            id="channel"
            type="text"
            value={channel}
            onInput={(e) =>
              setChannel((e.currentTarget as HTMLInputElement).value)
            }
            class={fieldClass}
          />
          <button
            type="button"
            class={buttonClass}
            onClick={() => send("join", { channel })}
          >
            join
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <label for="message" class={labelClass}>
            message
          </label>
          <input
            id="message"
            type="text"
            value={message}
            onInput={(e) =>
              setMessage((e.currentTarget as HTMLInputElement).value)
            }
            class={fieldClass}
          />
          <button
            type="button"
            class={buttonClass}
            onClick={() => send("message", { channel, text: message })}
          >
            send
          </button>
        </div>
      </fieldset>

      <fieldset class={fieldsetClass}>
        <legend class={legendClass}>direct / admin</legend>
        <div class="flex flex-wrap items-center gap-2">
          <label for="target" class={labelClass}>
            to (userId)
          </label>
          <input
            id="target"
            type="text"
            value={target}
            onInput={(e) =>
              setTarget((e.currentTarget as HTMLInputElement).value)
            }
            class={fieldClass}
          />
          <label for="whisper" class={labelClass}>
            whisper
          </label>
          <input
            id="whisper"
            type="text"
            value={whisper}
            onInput={(e) =>
              setWhisper((e.currentTarget as HTMLInputElement).value)
            }
            class={fieldClass}
          />
          <button
            type="button"
            class={buttonClass}
            onClick={() => send("whisper", { to: target, text: whisper })}
          >
            whisper
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <label for="announce" class={labelClass}>
            announce
          </label>
          <input
            id="announce"
            type="text"
            value={announce}
            onInput={(e) =>
              setAnnounce((e.currentTarget as HTMLInputElement).value)
            }
            class={fieldClass}
          />
          <button
            type="button"
            class={buttonClass}
            onClick={() => send("admin.announce", { text: announce })}
          >
            announce
          </button>
        </div>
      </fieldset>

      <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        log
      </h2>
      <div
        ref={logRef}
        class="h-64 overflow-auto whitespace-pre-wrap rounded-md bg-slate-100 p-3 font-mono text-xs text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      >
        {logs.join("\n")}
      </div>
    </main>
  );
}

const root = document.getElementById("root");
if (root) render(<App />, root);
