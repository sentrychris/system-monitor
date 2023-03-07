import type { ConnectionTypes } from "./types/ConnectionTypes";

interface BaseConfiguration {
  base_url: string;
}

interface ApiConfiguration {
  connection: ConnectionTypes;
  urls: {
    http: string;
    worker: string;
    websocket: string;
  };
}

export interface Configuration {
  app: BaseConfiguration;
  api: ApiConfiguration;
}
