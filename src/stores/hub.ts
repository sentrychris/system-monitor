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
  HubHost,
} from "@/interfaces/Hub";

const TOKEN_KEY = "vigil-pro-hub-token";

interface HubState {
  token: string;
  ready: boolean;        // token verified against /healthz
  hosts: HubHost[];
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

    /** Bucket hosts by liveness. Live = last_seen within 90s, the same
        threshold the hub uses to decide a host is "fresh enough" to evaluate. */
    hostStatus: (s) => (h: HubHost): "live" | "stale" | "offline" => {
      const ageS = Math.floor(Date.now() / 1000) - h.last_seen;
      if (ageS <= 90)  return "live";
      if (ageS <= 600) return "stale";
      return "offline";
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
          hubApi.listHosts(o),
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
