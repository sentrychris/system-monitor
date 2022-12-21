export interface CpuInformation {
  freq: number;
  temp: number;
  usage: number;
}

export interface UsageInformation {
  total: number;
  used: number;
  free: number;
  percent: number; // (total - free) / total * 100
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

export interface SystemMetrics {
  metric: 'cpu' | 'mem' | 'disk';
  track: 'temp' | 'usage' | 'percent' | 'used' | 'free' | 'total'; 
}