import type { Chart } from "highcharts";

interface ChartRegistry {
  registry: { [key: string]: Chart };
  addToRegistry(id: string, chart: Chart): void;
}

export interface Gauge extends ChartRegistry {
  create({
    id,
    value,
    format,
  }: {
    id: string;
    value: number;
    format: string;
  }): Chart;
  updateDataPoint(id: string, value: number): void;
}

export interface Bar extends ChartRegistry {
  create({
    id,
    series,
  }: {
    id: string;
    series: Array<any>; // TODO change
    yAxisText?: string;
    xAxisText?: string;
  }): Chart;
}

export interface RealtimeDataPoint {
  time: number;
  value: number;
}
