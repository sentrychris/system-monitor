import * as Highcharts from "highcharts";
import type { Bar } from "@/interfaces/ChartRegistry";
import type { ProcessInformation } from "@/interfaces/SystemInformation";
import type { NetworkTrafficInformation } from "@/interfaces/NetworkInformation";

export function formatBarChartDataForSystem(
  series: Array<ProcessInformation>,
  key: "pid" | "name" | "username" | "mem"
) {
  const response: Array<{ name: string; data: Array<number> }> = [];

  series.forEach((point) => {
    response.push({
      name: point.name,
      data: [(<unknown>point[key]) as number],
    });
  });

  return response;
}

export function formatBarChartDataForNetwork(
  series: Array<NetworkTrafficInformation>,
  key: "mb_sent" | "mb_received"
) {
  const response: Array<{ name: string; data: Array<number> }> = [];

  const keys = ["mb_sent", "mb_received"]; // TODO fix this dirty hack to get the correct series labels
  series.forEach((point, idx) => {
    response.push({
      name: keys[idx],
      data: [(<unknown>point) as number],
    });
  });

  return response;
}

export const bar: Bar = {
  registry: {},
  create({ id, series, yAxisText = null, xAxisText = null }) {
    // @ts-ignore
    const chart = Highcharts.chart(id, {
      chart: {
        type: "bar",
      },
      title: {
        text: null,
      },
      subtitle: {
        text: null,
      },
      xAxis: {
        categories: [id],
        title: {
          text: xAxisText,
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: yAxisText,
        },
      },
      tooltip: {
        valueDecimals: 2,
        valueSuffix: " MiB",
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
          },
        },
      },
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "top",
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        backgroundColor: "#FFFFFF",
        shadow: true,
      },
      credits: {
        enabled: false,
      },
      series,
    });

    this.addToRegistry(id, chart);

    return chart;
  },
  addToRegistry(id, chart) {
    this.registry[id] = chart;
  },
};
