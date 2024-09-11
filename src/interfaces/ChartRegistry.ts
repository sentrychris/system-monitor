import type { Chart, Series } from "highcharts";

interface ChartRegistry {
  registry: { [key: string]: Chart };
  addToRegistry(id: string, chart: Chart): void;
}

export interface Gauge extends ChartRegistry {
  create({ id, value, format }: { id: string; value: number; format: string }): Chart;
  registerObserver(id: string): void;
  updateTheme(id: string, color: string): void;
  updateDataPoint(id: string, value: number): void;
}

export interface Bar extends ChartRegistry {
  create({
    id,
    title,
    series,
  }: {
    id: string;
    title?: string;
    series: Array<any>;
    yAxisText?: string;
    xAxisText?: string;
  }): Chart;
  updateDataSeries(id: string, series: Series[]): void;
}

export interface Pie extends ChartRegistry {
  create({ id, title, series }: { id: string; title?: string; series: Array<any> }): Chart;
  updateDataSeries(id: string, series: Series[]): void;
}

export interface RealtimeDataPoint {
  time: number;
  value: number;
}
