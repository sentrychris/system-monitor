import * as Highcharts from "highcharts";
import type { Bar } from "@/interfaces/ChartRegistry";
import type { ProcessInformation } from "@/interfaces/SystemInformation";
import type { ProcessMetric } from "@/interfaces/types/SystemTypes";
import type { NetworkTrafficInformation } from "@/interfaces/NetworkInformation";
import type { NetworkTrafficMetric } from "@/interfaces/types/NetworkTypes";

export function formatBarChartDataForSystem(
  series: Array<ProcessInformation>,
  key: ProcessMetric
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

export function formatBarChartDataForNetworkTraffic(
  series: Array<NetworkTrafficInformation>,
  key: Array<NetworkTrafficMetric>
) {
  const response: Array<{ name: string; data: Array<number> }> = [];

  series.forEach((point, idx) => {
    response.push({
      name: key[idx],
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
            // style: {
            //   color: '#ffffff',
            //   textOutline: false
            // }
          },
          borderColor: "transparent",
        },
      },
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "top",
        x: -40,
        y: 140,
        floating: true,
        borderWidth: 0,
        borderRadius: 5,
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
