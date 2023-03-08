import type { Bar } from "@/interfaces/ChartRegistry";
import * as Highcharts from "highcharts";

export const bar: Bar = {
  registry: {},
  create({ id, title, series, yAxisText = null, xAxisText = null }) {
    // @ts-ignore
    const chart = Highcharts.chart(id, {
      chart: {
        type: "bar",
      },
      title: {
        text: title,
      },
      subtitle: {
        text: null,
      },
      xAxis: {
        categories: [id],
        title: {
          text: xAxisText,
        },
        labels: {
          enabled: false,
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
            style: {
              textOutline: false,
            },
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
