import type {
  CpuInformation,
  UsageInformation,
  PlatformInformation,
  ProcessInformation,
} from "./SystemInformation";

export interface SystemResponse {
  cpu: CpuInformation;
  mem: UsageInformation;
  disk: UsageInformation;
  platform: PlatformInformation;
  processes: ProcessInformation[];
  user: string;
}

export interface RealtimeSystemResponse {
  uptime: string;
  cpu: CpuInformation;
  mem: UsageInformation;
  disk: UsageInformation;
}
