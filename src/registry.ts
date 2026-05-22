import type { Connection } from "./connection.ts";

export class ConnectionRegistry<State> {
  /** @internal */ readonly byId = new Map<string, Connection<State>>();
  /** @internal */ readonly byTag = new Map<string, Set<Connection<State>>>();
  /** @internal */ readonly byChannel = new Map<
    string,
    Set<Connection<State>>
  >();

  add(c: Connection<State>): void {
    this.byId.set(c.id, c);
  }

  remove(c: Connection<State>): void {
    if (!this.byId.delete(c.id)) return;
    for (const tag of c.tags) {
      const s = this.byTag.get(tag);
      if (!s) continue;
      s.delete(c);
      if (s.size === 0) this.byTag.delete(tag);
    }
    for (const ch of c.channels) {
      const s = this.byChannel.get(ch);
      if (!s) continue;
      s.delete(c);
      if (s.size === 0) this.byChannel.delete(ch);
    }
  }

  indexTag(c: Connection<State>, tag: string): void {
    let s = this.byTag.get(tag);
    if (!s) {
      s = new Set();
      this.byTag.set(tag, s);
    }
    s.add(c);
  }

  unindexTag(c: Connection<State>, tag: string): void {
    const s = this.byTag.get(tag);
    if (!s) return;
    s.delete(c);
    if (s.size === 0) this.byTag.delete(tag);
  }

  indexChannel(c: Connection<State>, channel: string): void {
    let s = this.byChannel.get(channel);
    if (!s) {
      s = new Set();
      this.byChannel.set(channel, s);
    }
    s.add(c);
  }

  unindexChannel(c: Connection<State>, channel: string): void {
    const s = this.byChannel.get(channel);
    if (!s) return;
    s.delete(c);
    if (s.size === 0) this.byChannel.delete(channel);
  }

  all(): Iterable<Connection<State>> {
    return this.byId.values();
  }

  byTagLookup(tag: string): ReadonlySet<Connection<State>> | undefined {
    return this.byTag.get(tag);
  }

  byChannelLookup(channel: string): ReadonlySet<Connection<State>> | undefined {
    return this.byChannel.get(channel);
  }

  findByWebSocket(ws: WebSocket): Connection<State> | undefined {
    for (const c of this.byId.values()) if (c._ws === ws) return c;
    return undefined;
  }
}
