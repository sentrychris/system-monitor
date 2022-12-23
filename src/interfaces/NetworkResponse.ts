import type {
  NetworkTrafficInformation,
  NetworkConnectionsInformation
} from "./NetworkInformation"

export interface NetworkResponse {
  interfaces: {
    [key: string]: NetworkTrafficInformation
  },
  connections: {
    [key: string]: Array<NetworkConnectionsInformation>
  },
}

export interface WifiResponse {
  name: string,
  quality: string;
  channel: string;
  encryption: string;
  address: string;
  signal: string;
}

export interface WifiSpeedtestResponse {
  ping: number;
  download: string;
  upload: string;
}