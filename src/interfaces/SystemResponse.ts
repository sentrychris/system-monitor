import type {
  CpuInformation,
  UsageInformation,
  DiskUsageInformation,
  NetworkRateInformation,
  PlatformInformation,
  ProcessInformation,
} from "./SystemInformation";

export interface SystemResponse {
  cpu: CpuInformation;
  mem: UsageInformation;
  disk: UsageInformation;
  disks: DiskUsageInformation[];
  network: NetworkRateInformation;
  platform: PlatformInformation;
  processes: ProcessInformation[];
  user: string;
}

export interface RealtimeSystemResponse {
  cpu: CpuInformation;
  mem: UsageInformation;
  disk: UsageInformation;
  network: NetworkRateInformation;
  uptime?: string | null;
  processes: ProcessInformation[];
}
