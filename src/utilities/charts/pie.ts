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
        pointFormat: "{point.name}: <b>{point.percentage:.0f}%</b>",
      },
      accessibility: {
        point: {
          valueSuffix: "MB /s",
        },
      },
      plotOptions: {
        pie: {
          size: '160',
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            style: {
              textOutline: false,
            },
            format: "<b>{point.name}</b>: {point.percentage:.0f}%",
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
          allowPointSelect: true,
          data: series,
        },
      ],
    });

    this.addToRegistry(id, chart);

    return chart;
  },
  updateDataSeries(id, series) {
    this.registry[id].series[0].setData(series);
  },
  addToRegistry(id: string, chart: any) {
    this.registry[id] = chart;
  },
};
