/**
 * Vigil Pro Hub HTTP client.
 *
 * Stateless wrapper around fetch — token is supplied per-call so callers
 * can decide whether to source from a store, query string, or test fixture.
 * The Pinia hub store is the production caller; tests can call directly.
 */

import type {
  AlertEvent,
  AlertRule,
  AlertState,
  Channel,
  HealthzResponse,
  HubHost,
  HubOverviewHost,
  HubProcessesResponse,
  SeriesResponse,
} from "@/interfaces/Hub";

export class HubApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HubApiError";
  }
}

interface CallOptions {
  baseUrl: string;
  token: string;
  signal?: AbortSignal;
}

async function call<T>(
  path: string,
  opts: CallOptions,
  init: RequestInit = {},
): Promise<T> {
  const url = opts.baseUrl.replace(/\/$/, "") + path;
  const headers = new Headers(init.headers || {});
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let resp: Response;
  try {
    resp = await fetch(url, { ...init, headers, signal: opts.signal });
  } catch (e) {
    // Network-level error — surfaced separately from HTTP errors so the
    // store can render a "Hub unreachable" state distinctly from "401".
    throw new HubApiError(0, (e as Error).message || "network error");
  }

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new HubApiError(resp.status, body || resp.statusText);
  }
  return (await resp.json()) as T;
}

export const hubApi = {
  healthz: (o: CallOptions) => call<HealthzResponse>("/healthz", o),

  listHosts: (o: CallOptions) => call<HubHost[]>("/api/hosts", o),

  fleetOverview: (o: CallOptions) =>
    call<HubOverviewHost[]>("/api/overview", o),

  deleteHost: (o: CallOptions, hostId: number) =>
    call<{ ok: true }>(`/api/hosts/${hostId}`, o, { method: "DELETE" }),

  patchHost: (
    o: CallOptions,
    hostId: number,
    patch: { collector_url?: string | null; tags?: string[]; enabled?: boolean },
  ) =>
    call<{ ok: true }>(`/api/hosts/${hostId}`, o, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  getSeries: (
    o: CallOptions,
    hostId: number,
    metric: string,
    opts: { dim?: string; start?: number; end?: number } = {},
  ) => {
    const q = new URLSearchParams({ metric });
    if (opts.dim) q.set("dim", opts.dim);
    if (opts.start) q.set("start", String(opts.start));
    if (opts.end) q.set("end", String(opts.end));
    return call<SeriesResponse>(
      `/api/hosts/${hostId}/series?${q}`, o,
    );
  },

  getProcesses: (o: CallOptions, hostId: number, limit = 10) =>
    call<HubProcessesResponse>(
      `/api/hosts/${hostId}/processes?limit=${limit}`, o,
    ),

  alertState: (o: CallOptions) => call<AlertState[]>("/api/alert_state", o),

  alertEvents: (o: CallOptions, since?: number, limit = 100) => {
    const q = new URLSearchParams({ limit: String(limit) });
    if (since) q.set("since", String(since));
    return call<AlertEvent[]>(`/api/alert_events?${q}`, o);
  },

  listAlertRules: (o: CallOptions) =>
    call<AlertRule[]>("/api/alert_rules", o),

  createAlertRule: (
    o: CallOptions,
    body: {
      name: string;
      metric: string;
      dim?: string;
      scope?: string;       // "all" | "host:<name>" | "tag:<tag>"
      op: string;           // ">" | ">=" | "<" | "<="
      threshold: number;
      for_seconds?: number;
      channel_id: number;
      enabled?: boolean;
    },
  ) =>
    call<{ id: number; name: string }>("/api/alert_rules", o, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patchAlertRule: (
    o: CallOptions,
    ruleId: number,
    patch: {
      name?: string;
      op?: string;
      threshold?: number;
      for_seconds?: number;
      scope?: string;
      channel_id?: number;
      enabled?: boolean;
    },
  ) =>
    call<AlertRule>(`/api/alert_rules/${ruleId}`, o, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteAlertRule: (o: CallOptions, ruleId: number) =>
    call<{ ok: true }>(`/api/alert_rules/${ruleId}`, o, { method: "DELETE" }),

  listChannels: (o: CallOptions) => call<Channel[]>("/api/channels", o),

  createChannel: (
    o: CallOptions,
    body: {
      name: string;
      type: "slack" | "discord" | "webhook";
      config: Record<string, unknown>;
    },
  ) =>
    call<Channel>("/api/channels", o, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patchChannel: (
    o: CallOptions,
    channelId: number,
    patch: {
      name?: string;
      type?: "slack" | "discord" | "webhook";
      config?: Record<string, unknown>;
    },
  ) =>
    call<Channel>(`/api/channels/${channelId}`, o, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteChannel: (o: CallOptions, channelId: number) =>
    call<{ ok: true }>(`/api/channels/${channelId}`, o, { method: "DELETE" }),
};
