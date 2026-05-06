import type { ConnectionTypes } from "./types/ConnectionTypes";

interface BaseConfiguration {
  name: string;
  title: string;
  version: string;
  base_url: string;
  deployment: {
    instance: string;
    region: string;
  };
}

interface ApiConfiguration {
  connectionType: ConnectionTypes;
  urls: {
    http: string;
    worker: string;
    websocket: string;
  };
}

export interface ServicesConfiguration {
  pollInterval: number;
  thresholds: {
    slow: number;
  };
}

export interface HubConfiguration {
  /** Base URL of a Vigil Pro hub. Falsy ⇒ collector-only build. */
  url: string;
  /** Sample → chart polling cadence (ms). */
  pollInterval: number;
  /** Alert-state polling cadence (ms). */
  alertPollInterval: number;
}

export interface PinsConfiguration {
  inlineLimit: number;
}

export interface Configuration {
  app: BaseConfiguration;
  api: ApiConfiguration;
  services: ServicesConfiguration;
  hub: HubConfiguration;
  pins: PinsConfiguration;
}
