/**
 * Hub store — token, hosts, alerts, polling.
 *
 * One store owns all the periodic chatter to the hub. Components subscribe
 * via `state.hosts`, `state.alertState`, etc. — no component should poll
 * the hub on its own.
 *
 * Token lives in localStorage (admin-only UI; the hub bearer is the master
 * admin secret, so localStorage is an acceptable trust boundary).
 */

import { defineStore } from "pinia";
import { config } from "@/config";
import { hubApi, HubApiError } from "@/api/hub";
import type {
  AlertEvent,
  AlertState,
  HostStatus,
  HubOverviewHost,
} from "@/interfaces/Hub";

const TOKEN_KEY = "vigil-pro-hub-token";

interface HubState {
  token: string;
  ready: boolean;        // token verified against /healthz
  hosts: HubOverviewHost[];
  alertState: AlertState[];
  alertEvents: AlertEvent[];
  loading: boolean;
  error: string;
  /** ms epoch of the most recent successful refresh. */
  lastRefresh: number;
  // Internal poll handles
  _hostsTimer: number | null;
  _alertsTimer: number | null;
}

function readToken(): string {
  try { return localStorage.getItem(TOKEN_KEY) || ""; }
  catch { return ""; }
}

function writeToken(t: string): void {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else   localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode, etc. */ }
}

export const useHubStore = defineStore("hub", {
  state: (): HubState => ({
    token: readToken(),
    ready: false,
    hosts: [],
    alertState: [],
    alertEvents: [],
    loading: false,
    error: "",
    lastRefresh: 0,
    _hostsTimer: null,
    _alertsTimer: null,
  }),

  getters: {
    isConfigured: () => Boolean(config.hub.url),

    firingAlerts: (s): AlertState[] =>
      s.alertState.filter((a) => a.state === "firing"),

    breachingAlerts: (s): AlertState[] =>
      s.alertState.filter((a) => a.state === "breaching"),

    /** Helper for callers that already have a host object — returns the
        server-computed status field. Kept as a getter so the per-status
        styling logic in components doesn't have to know about the wire shape. */
    hostStatus: () => (h: { status: HostStatus }): HostStatus => h.status,

    /** Fleet health breakdown — used by the summary hero. */
    hostCounts: (s): { live: number; stale: number; offline: number; total: number } => {
      const c = { live: 0, stale: 0, offline: 0, total: s.hosts.length };
      for (const h of s.hosts) c[h.status] += 1;
      return c;
    },

    /** Mean CPU % and mem % across LIVE hosts only — stale/offline values
     *  are last-known and would skew the headline. */
    fleetAvg: (s): { cpu: number | null; mem: number | null } => {
      const live = s.hosts.filter((h) => h.status === "live");
      const avg = (key: "cpu.usage" | "mem.percent"): number | null => {
        const vals: number[] = [];
        for (const h of live) {
          const m = h.metrics?.[key];
          if (m && typeof m.value === "number") vals.push(m.value);
        }
        if (!vals.length) return null;
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      };
      return { cpu: avg("cpu.usage"), mem: avg("mem.percent") };
    },

    /** The single hottest host for each headline metric — for the
     *  "peak: 94% on web-01" subtitles. Live hosts only. */
    fleetPeak: (s): {
      cpu: { name: string; value: number } | null;
      mem: { name: string; value: number } | null;
    } => {
      const live = s.hosts.filter((h) => h.status === "live");
      const peak = (key: "cpu.usage" | "mem.percent") => {
        let best: { name: string; value: number } | null = null;
        for (const h of live) {
          const m = h.metrics?.[key];
          if (!m || typeof m.value !== "number") continue;
          if (!best || m.value > best.value) {
            best = { name: h.name, value: m.value };
          }
        }
        return best;
      };
      return { cpu: peak("cpu.usage"), mem: peak("mem.percent") };
    },
  },

  actions: {
    /** Verify the current token and prime the first refresh. */
    async connect(token?: string): Promise<boolean> {
      if (token !== undefined) {
        this.token = token;
        writeToken(token);
      }
      if (!this.token || !config.hub.url) {
        this.ready = false;
        this.error = "";
        return false;
      }

      this.loading = true;
      this.error = "";
      try {
        await hubApi.healthz({ baseUrl: config.hub.url, token: this.token });
        this.ready = true;
        await this.refresh();
        return true;
      } catch (e) {
        this.ready = false;
        this.error = e instanceof HubApiError
          ? this._friendly(e)
          : (e as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    disconnect(): void {
      this.token = "";
      writeToken("");
      this.ready = false;
      this.hosts = [];
      this.alertState = [];
      this.alertEvents = [];
      this.error = "";
      this.stopPolling();
    },

    /** Pull the latest hosts + alert state in parallel. */
    async refresh(): Promise<void> {
      if (!this.token || !config.hub.url) return;
      const o = { baseUrl: config.hub.url, token: this.token };
      try {
        const [hosts, state] = await Promise.all([
          hubApi.fleetOverview(o),
          hubApi.alertState(o),
        ]);
        this.hosts = hosts;
        this.alertState = state;
        this.lastRefresh = Date.now();
        this.error = "";
      } catch (e) {
        this.error = e instanceof HubApiError
          ? this._friendly(e)
          : (e as Error).message;
      }
    },

    /** Update operator-managed fields on a host (collector_url, tags,
     *  enabled). Local state is patched optimistically on success so the
     *  view reflects the change without waiting for the next poll. */
    async patchHost(
      hostId: number,
      patch: { collector_url?: string | null; tags?: string[]; enabled?: boolean },
    ): Promise<boolean> {
      if (!this.token || !config.hub.url) return false;
      try {
        await hubApi.patchHost(
          { baseUrl: config.hub.url, token: this.token },
          hostId,
          patch,
        );
        const idx = this.hosts.findIndex((h) => h.id === hostId);
        if (idx >= 0) {
          // Normalise patch values to the wire shape (enabled is 0|1 here).
          const merged = { ...this.hosts[idx] };
          if ("collector_url" in patch) merged.collector_url = patch.collector_url ?? null;
          if ("tags"          in patch) merged.tags          = patch.tags!;
          if ("enabled"       in patch) merged.enabled       = patch.enabled ? 1 : 0;
          this.hosts[idx] = merged;
        }
        return true;
      } catch (e) {
        this.error = e instanceof HubApiError
          ? this._friendly(e)
          : (e as Error).message;
        return false;
      }
    },

    /** Delete a host + all its samples/alerts on the hub. Removes it from
     *  local state on success so the fleet view updates without a poll
     *  round-trip. */
    async deleteHost(hostId: number): Promise<boolean> {
      if (!this.token || !config.hub.url) return false;
      try {
        await hubApi.deleteHost(
          { baseUrl: config.hub.url, token: this.token },
          hostId,
        );
        this.hosts = this.hosts.filter((h) => h.id !== hostId);
        this.alertState = this.alertState.filter((a) => a.host_id !== hostId);
        return true;
      } catch (e) {
        this.error = e instanceof HubApiError
          ? this._friendly(e)
          : (e as Error).message;
        return false;
      }
    },

    async refreshEvents(): Promise<void> {
      if (!this.token || !config.hub.url) return;
      try {
        this.alertEvents = await hubApi.alertEvents(
          { baseUrl: config.hub.url, token: this.token },
          undefined, 50,
        );
      } catch (e) {
        // Events are non-critical for the live view — swallow but surface.
        this.error = e instanceof HubApiError
          ? this._friendly(e)
          : (e as Error).message;
      }
    },

    startPolling(): void {
      this.stopPolling();
      if (!this.token || !config.hub.url) return;
      this.refresh();
      this.refreshEvents();
      this._hostsTimer = window.setInterval(
        () => this.refresh(),
        config.hub.pollInterval,
      );
      this._alertsTimer = window.setInterval(
        () => this.refreshEvents(),
        Math.max(config.hub.alertPollInterval, 15_000),
      );
    },

    stopPolling(): void {
      if (this._hostsTimer  !== null) { window.clearInterval(this._hostsTimer);  this._hostsTimer  = null; }
      if (this._alertsTimer !== null) { window.clearInterval(this._alertsTimer); this._alertsTimer = null; }
    },

    _friendly(e: HubApiError): string {
      if (e.status === 0)   return `Hub unreachable: ${e.message}`;
      if (e.status === 401) return "Bearer token missing.";
      if (e.status === 403) return "Bearer token rejected — check it and reconnect.";
      if (e.status === 503) return "Hub admin token isn't configured.";
      return `Hub error ${e.status}: ${e.message}`;
    },
  },
});
