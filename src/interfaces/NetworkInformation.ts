export interface NetworkTrafficInformation {
  mb_sent: number;
  mb_received: number;
  pk_sent: number;
  pk_received: number;
  error_in: number;
  error_out: number;
  dropout: number;
}

export interface NetworkConnectionsInformation {
  local_port: number,
  remote_ip: string;
}