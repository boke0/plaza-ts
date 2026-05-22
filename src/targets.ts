import type { Connection } from "./connection.ts";
import type { ConnectionRegistry } from "./registry.ts";
import type { EventMap, Selector, SerializeFn } from "./types.ts";

type TargetStep<S> =
  | { kind: "all" }
  | { kind: "tag"; tags: string[] }
  | { kind: "channel"; channels: string[] }
  | { kind: "predicate"; fn: (c: Connection<S>) => boolean }
  | { kind: "except"; ids: Set<string> };

/**
 * Immutable description of a set of send targets.
 *
 * Build up a narrowing plan by chaining `to(...)` / `except(...)`, then call
 * {@link Targets.emit} to send to every connection that matches.
 *
 * @typeParam State - Per-connection state type
 * @typeParam Env - Environment bindings type
 * @typeParam Events - Registered event map
 *
 * @remarks
 * Each method returns a new `Targets` instance, so the original is unaffected.
 * `Targets` also implements `Symbol.iterator`, so you can iterate over the
 * matching connections with `for...of`.
 *
 * @example
 * ```ts
 * // Send to everyone in "lobby" except the sender.
 * c.to({ channel: "lobby" }).except(c.connection).emit("greeting", { message });
 * ```
 *
 * @public
 */
export class Targets<State, Env, Events extends EventMap> {
  /** @internal */
  constructor(
    private readonly registry: ConnectionRegistry<State>,
    private readonly serialize: SerializeFn,
    private readonly plan: readonly TargetStep<State>[],
  ) {}

  /**
   * Return a new {@link Targets} with an additional narrowing step appended.
   *
   * Chained selectors compose as AND filters.
   *
   * @param sel - Selector to AND with the current plan
   *
   * @example
   * ```ts
   * c.to({ channel: "lobby" }).to({ tag: "admin" }).emit("ping", {});
   * ```
   */
  to(sel: Selector<State>): Targets<State, Env, Events> {
    let step: TargetStep<State>;
    if (typeof sel === "function") {
      step = { kind: "predicate", fn: sel };
    } else if ("tag" in sel) {
      step = {
        kind: "tag",
        tags: Array.isArray(sel.tag) ? sel.tag : [sel.tag],
      };
    } else {
      step = {
        kind: "channel",
        channels: Array.isArray(sel.channel) ? sel.channel : [sel.channel],
      };
    }
    return new Targets(this.registry, this.serialize, [...this.plan, step]);
  }

  /**
   * Return a new {@link Targets} that excludes the given connections.
   *
   * @param conns - Connections to exclude (variadic)
   *
   * @example
   * ```ts
   * c.to({ channel: "lobby" }).except(c.connection).emit("notice", {});
   * ```
   */
  except(...conns: Connection<State>[]): Targets<State, Env, Events> {
    const ids = new Set(conns.map((c) => c.id));
    return new Targets(this.registry, this.serialize, [
      ...this.plan,
      { kind: "except", ids },
    ]);
  }

  /**
   * Resolve the plan and dispatch an event to every matching connection.
   *
   * The payload is serialized exactly once and the same wire frame is sent to
   * each target. If sending to a target throws, that connection is dropped
   * from the registry.
   *
   * @param event - Event name
   * @param payload - Arbitrary payload
   */
  emit(event: string, payload: unknown): void {
    const targets = this.resolve();
    if (targets.size === 0) return;
    const frame = this.serialize(event, payload);
    for (const conn of targets) {
      try {
        conn._sendRaw(frame);
      } catch {
        conn._dropFromRegistry();
      }
    }
  }

  /**
   * Iterate over the connections that match the current plan.
   *
   * Useful when you need to inspect or process matching connections without
   * sending them an event.
   */
  *[Symbol.iterator](): IterableIterator<Connection<State>> {
    yield* this.resolve();
  }

  /** @internal */
  resolve(): Set<Connection<State>> {
    let seed: Iterable<Connection<State>> | null = null;
    let seedSet = false;
    const filters: TargetStep<State>[] = [];

    for (const step of this.plan) {
      switch (step.kind) {
        case "all":
          if (!seedSet) {
            seed = this.registry.all();
            seedSet = true;
          }
          break;
        case "tag":
          if (!seedSet) {
            seed = this.unionTags(step.tags);
            seedSet = true;
          } else {
            filters.push(step);
          }
          break;
        case "channel":
          if (!seedSet) {
            seed = this.unionChannels(step.channels);
            seedSet = true;
          } else {
            filters.push(step);
          }
          break;
        case "predicate":
        case "except":
          filters.push(step);
          break;
      }
    }

    if (!seedSet) seed = this.registry.all();

    const result = new Set<Connection<State>>();
    for (const conn of seed as Iterable<Connection<State>>) {
      if (!this.applyFilters(conn, filters)) continue;
      result.add(conn);
    }
    return result;
  }

  private applyFilters(
    conn: Connection<State>,
    filters: TargetStep<State>[],
  ): boolean {
    for (const f of filters) {
      switch (f.kind) {
        case "predicate":
          if (!f.fn(conn)) return false;
          break;
        case "except":
          if (f.ids.has(conn.id)) return false;
          break;
        case "tag":
          if (!f.tags.some((t) => conn.tags.has(t))) return false;
          break;
        case "channel":
          if (!f.channels.some((ch) => conn.channels.has(ch))) return false;
          break;
        case "all":
          break;
      }
    }
    return true;
  }

  private unionTags(tags: string[]): Set<Connection<State>> {
    const out = new Set<Connection<State>>();
    for (const t of tags) {
      const s = this.registry.byTagLookup(t);
      if (!s) continue;
      for (const c of s) out.add(c);
    }
    return out;
  }

  private unionChannels(channels: string[]): Set<Connection<State>> {
    const out = new Set<Connection<State>>();
    for (const ch of channels) {
      const s = this.registry.byChannelLookup(ch);
      if (!s) continue;
      for (const c of s) out.add(c);
    }
    return out;
  }
}

/** @internal */
export function createTargets<S, Env, E extends EventMap>(
  registry: ConnectionRegistry<S>,
  serialize: SerializeFn,
): Targets<S, Env, E> {
  return new Targets<S, Env, E>(registry, serialize, []);
}
