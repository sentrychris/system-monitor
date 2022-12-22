export interface RealtimeDataPoint {
  time: number;
  value: number;
}

export interface Gauge {
  registry: { [key: string]: Highcharts.Chart };
  create({
    id,
    value,
    format,
  }: {
    id: string;
    value: number;
    format: string;
  }): Highcharts.Chart;
  updatePoint(id: string, value: number): void;
  addToRegistry(id: string, chart: Highcharts.Chart): void;
}