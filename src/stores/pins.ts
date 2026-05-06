/**
 * Pinned hosts — user shortcuts shown in the navbar.
 *
 * Pure preference state, intentionally separate from `useHubStore` (which
 * owns live hub session state). Persisted to localStorage so pins survive
 * reloads.
 */
import { defineStore } from "pinia";
import type { HubOverviewHost } from "@/interfaces/Hub";

const STORAGE_KEY = "vigil-pinned-host-ids";

interface PinsState {
  /** Host IDs in display order. New pins are appended; oldest first. */
  ids: number[];
}

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: drop anything that isn't a finite positive integer in
    // case storage was hand-edited or the schema ever shifts.
    return parsed.filter(
      (n): n is number => typeof n === "number" && Number.isInteger(n) && n > 0,
    );
  } catch {
    return [];
  }
}

function writeIds(ids: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Private mode, quota exceeded, etc. — pins are nice-to-have, not
    // critical, so swallowing is fine. Next mutation will retry.
  }
}

export const usePinsStore = defineStore("pins", {
  state: (): PinsState => ({
    ids: readIds(),
  }),

  getters: {
    isPinned: (s) => (hostId: number): boolean => s.ids.includes(hostId),
    count: (s): number => s.ids.length,

    /** Resolve pinned ids against the live hub host list, in pin order.
     *  Hosts the hub no longer knows about are silently dropped from
     *  the rendered output but stay in storage (see module docstring). */
    pinnedHostsFrom: (s) => (hosts: HubOverviewHost[]): HubOverviewHost[] => {
      const byId = new Map(hosts.map((h) => [h.id, h]));
      const out: HubOverviewHost[] = [];
      for (const id of s.ids) {
        const h = byId.get(id);
        if (h) out.push(h);
      }
      return out;
    },
  },

  actions: {
    pin(hostId: number): void {
      if (this.ids.includes(hostId)) return;
      this.ids.push(hostId);
      writeIds(this.ids);
    },

    unpin(hostId: number): void {
      const next = this.ids.filter((id) => id !== hostId);
      if (next.length === this.ids.length) return;
      this.ids = next;
      writeIds(this.ids);
    },

    toggle(hostId: number): void {
      if (this.ids.includes(hostId)) this.unpin(hostId);
      else this.pin(hostId);
    },

    /** Drop pins whose host no longer exists on the hub. Not called
     *  automatically — exposed for an explicit "tidy" affordance later
     *  (e.g. a settings page or a janitor button). */
    pruneAgainst(hosts: HubOverviewHost[]): void {
      const known = new Set(hosts.map((h) => h.id));
      const next = this.ids.filter((id) => known.has(id));
      if (next.length === this.ids.length) return;
      this.ids = next;
      writeIds(this.ids);
    },
  },
});
