import type { Configuration } from "./interfaces/Configuration";

export const config: Configuration = {
  app: {
    name: import.meta.env.VITE_APP_NAME,
    version: import.meta.env.VITE_APP_VERSION,
    base_url: import.meta.env.BASE_URL,
  },
  api: {
    connection: import.meta.env.VITE_CONNECTION_TYPE,
    urls: {
      http: import.meta.env.VITE_API_URL,
      worker: import.meta.env.VITE_WORKER_URL,
      websocket: import.meta.env.VITE_WEBSOCKET_URL,
    },
  },
};
