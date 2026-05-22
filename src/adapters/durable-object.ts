import { DurableObject } from "cloudflare:workers";
import type { PlazaAttachment } from "../connection.ts";
import type { Plaza } from "../plaza.ts";
import type { EventMap } from "../types.ts";

/**
 * Build a Cloudflare Durable Object base class that wires Plaza's WebSocket
 * lifecycle automatically.
 *
 * Extend the returned class (or export it directly) to handle WebSocket
 * upgrade, message dispatch, close, and error events without writing any
 * boilerplate. Hibernation rehydration of tag/channel/state indexes happens
 * lazily on the first call after a wake-up.
 *
 * @typeParam State - Per-connection state type used by `plaza`
 * @typeParam Env - Environment bindings of the Durable Object
 * @typeParam Events - Map of registered events
 * @param plaza - The Plaza instance whose handlers should drive this DO
 * @returns An abstract Durable Object class that delegates to `plaza`
 *
 * @example
 * ```ts
 * import { Plaza } from "plaza-ts";
 * import { durableObject } from "plaza-ts/durable-object";
 *
 * const plaza = new Plaza()
 *   .on("greeting", (c) => { ... });
 *
 * export class ChatRoom extends durableObject(plaza) {
 *   async alarm() { ... }
 * }
 *
 * // Or, with no DO-specific code, just re-export it:
 * // export const ChatRoom = durableObject(plaza);
 * ```
 *
 * @public
 */
export function durableObject<
  State extends Record<string, unknown>,
  Env,
  Events extends EventMap,
>(plaza: Plaza<State, Env, Events>) {
  abstract class PlazaDurableObject extends DurableObject<Env> {
    /** @internal */
    private _rehydrated = false;

    private _ensureRehydrated(): void {
      if (this._rehydrated) return;
      this._rehydrated = true;
      const sockets = this.ctx.getWebSockets();
      for (const ws of sockets) {
        const attachment =
          ws.deserializeAttachment() as PlazaAttachment<State> | null;
        if (!attachment) continue;
        plaza._restoreConnection(ws as unknown as WebSocket, attachment);
      }
    }

    override async fetch(req: Request): Promise<Response> {
      this._ensureRehydrated();
      return plaza.upgrade(req, this.ctx, this.env);
    }

    override async webSocketMessage(
      ws: WebSocket,
      msg: string | ArrayBuffer,
    ): Promise<void> {
      this._ensureRehydrated();
      await plaza.dispatch(ws, msg, this.ctx, this.env);
    }

    override async webSocketClose(
      ws: WebSocket,
      code: number,
      reason: string,
      wasClean: boolean,
    ): Promise<void> {
      this._ensureRehydrated();
      await plaza.close(ws, code, reason, wasClean, this.ctx, this.env);
    }

    override async webSocketError(ws: WebSocket, err: unknown): Promise<void> {
      this._ensureRehydrated();
      await plaza.error(ws, err, this.ctx, this.env);
    }
  }

  return PlazaDurableObject as unknown as new (
    ctx: DurableObjectState,
    env: Env,
  ) => DurableObject<Env> & {
    fetch(req: Request): Promise<Response>;
    webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer): Promise<void>;
    webSocketClose(
      ws: WebSocket,
      code: number,
      reason: string,
      wasClean: boolean,
    ): Promise<void>;
    webSocketError(ws: WebSocket, err: unknown): Promise<void>;
  };
}
