import type { Configuration } from "./interfaces/Configuration";
import { APP_VERSION } from './version';

export const config: Configuration = {
  app: {
    base_url: import.meta.env.BASE_URL,
    name: import.meta.env.VITE_APP_NAME,
    title: import.meta.env.VITE_APP_TITLE,
    version: APP_VERSION,
    deployment: {
      region: import.meta.env.VITE_DEPLOY_REGION,
      instance: import.meta.env.VITE_DEPLOY_INSTANCE,
    }
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
