import type {
  CpuInformation,
  UsageInformation,
  DiskUsageInformation,
  PlatformInformation,
  ProcessInformation,
} from "./SystemInformation";

export interface SystemResponse {
  cpu: CpuInformation;
  mem: UsageInformation;
  disk: UsageInformation;
  disks: DiskUsageInformation[];
  platform: PlatformInformation;
  processes: ProcessInformation[];
  user: string;
}

export interface RealtimeSystemResponse {
  cpu: CpuInformation;
  mem: UsageInformation;
  disk: UsageInformation;
  uptime?: string | null;
  processes: ProcessInformation[];
}
