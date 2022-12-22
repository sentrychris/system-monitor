import type { Chart } from "highcharts";

export interface RealtimeDataPoint {
  time: number;
  value: number;
}

export interface Gauge {
  registry: { [key: string]: Chart };
  create({
    id,
    value,
    format,
  }: {
    id: string;
    value: number;
    format: string;
  }): Chart;
  updatePoint(id: string, value: number): void;
  addToRegistry(id: string, chart: Chart): void;
}