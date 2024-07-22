import type { NetworkStatisticInformation } from "./NetworkInformation";

export interface NetworkResponse {
  interfaces: Array<string>;
  wireless: {
    name: string;
    quality: string;
    channel: string;
    encryption: string;
    address: string;
    signal: string;
  };
  statistics: {
    [key: string]: NetworkStatisticInformation;
  };
}

export interface WifiResponse {
  name: string;
  quality: string;
  channel: string;
  encryption: string;
  address: string;
  signal: string;
}

export interface WifiSpeedtestResponse {
  ping: string;
  download: string;
  upload: string;
}
