import type { Pie } from "@/interfaces/ChartRegistry";
import * as Highcharts from "highcharts";

export const pie: Pie = {
  registry: {},
  create({ id, title, series }) {
    // @ts-ignore
    const chart = Highcharts.chart(id, {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie",
      },
      title: {
        text: title,
      },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
      },
      accessibility: {
        point: {
          valueSuffix: "MB /s",
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            style: {
              textOutline: false,
            },
            format: "<b>{point.name}</b>: {point.percentage:.1f} %",
          },
          borderColor: "transparent",
        },
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          colorByPoint: true,
          data: series,
        },
      ],
    });

    this.addToRegistry(id, chart);

    return chart;
  },
  // updateTheme(id, color) {
  //   //@ts-ignore
  //   this.registry[id].pane[0].background[0].element.style.fill = color;
  // },
  // updateDataPoint(id, value) {
  //   const dataPoint = this.registry[id].series[0].points[0];
  //   dataPoint.update(Math.round(value));
  // },
  addToRegistry(id: string, chart: any) {
    this.registry[id] = chart;
  },
};
