export interface CpuInformation {
    freq: number;
    temp: number;
    usage: number;
}

export interface UsageInformation {
    total: number;
    used: number;
    free: number;
    percent?: number;
}

export interface PlatformInformation {
    distro: string;
    kernel: string;
    uptime: string;
}

export interface ProcessInformation {
    pid: number;
    username: string;
    name: string;
    mem: number;
}