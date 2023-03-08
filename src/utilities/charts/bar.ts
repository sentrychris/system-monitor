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
          cursor: "pointer",
          allowPointSelect: true,
          dataLabels: {
            enabled: true,
            style: {
              textOutline: false,
            },
            format: '{point.y:.2f} MB'
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
  updateDataSeries(id, series) {
    console.log(this.registry[id].series);
  },
  addToRegistry(id, chart) {
    this.registry[id] = chart;
  },
};
