/**
 * Vigil Pro Hub API types.
 *
 * Wire shapes mirror the JSON returned by `vigil_pro.api`. If a field
 * is added there, mirror it here — these are not auto-generated.
 */

export interface HubHost {
  id: number;
  name: string;
  hostname: string | null;
  os: string | null;
  arch: string | null;
  agent_version: string | null;
  tags: string[];
  first_seen: number;     // unix epoch s
  last_seen: number;      // unix epoch s
  enabled: number;        // 0|1
}

export interface SeriesPoint {
  ts: number;
  v?: number;             // raw tier
  min?: number;           // aggregated tiers
  max?: number;
  avg?: number;
}

export interface SeriesResponse {
  host_id: number;
  metric: string;
  dim: string;
  tier: "samples_raw" | "samples_1m" | "samples_5m" | "samples_1h";
  start: number;
  end: number;
  points: SeriesPoint[];
}

export type AlertStateName = "ok" | "breaching" | "firing";

export interface AlertState {
  rule_id: number;
  host_id: number;
  state: AlertStateName;
  breach_started_at: number | null;
  fired_at: number | null;
  last_value: number | null;
  rule_name: string;
  metric: string;
  dim: string;
  op: string;
  threshold: number;
  host_name: string;
}

export type AlertEventKind = "fired" | "resolved";

export interface AlertEvent {
  id: number;
  rule_id: number;
  host_id: number;
  event: AlertEventKind;
  ts: number;
  value: number;
  rule_name: string;
  host_name: string;
}

export interface HealthzResponse {
  ok: boolean;
  hosts: number;
  uptime_s: number;
}
