import type {
    CpuInformation,
    UsageInformation,
    PlatformInformation,
    ProcessInformation
} from "./SystemInformation";

export interface SystemResponse {
    cpu: CpuInformation;
    disk: UsageInformation; 
    mem: UsageInformation;
    platform: PlatformInformation;
    processes: ProcessInformation[];
    user: string;
}