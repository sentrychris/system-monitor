import * as Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsSolidGauge from "highcharts/modules/solid-gauge";
import type { Gauge } from "@/interfaces/ChartRegistry";
import { useThemeStore } from "@/stores/theme";

HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);

export const gauge: Gauge = {
  registry: {},
  create({ id, value, format }) {
    // @ts-ignore
    const chart = Highcharts.chart(id, {
      chart: {
        type: "solidgauge",
      },
      title: null,
      credits: {
        enabled: false,
      },
      tooltip: {
        enabled: false,
      },
      pane: {
        center: ["50%", "50%"],
        size: "80%",
        startAngle: 0,
        endAngle: 360,
        background: {
          borderWidth: 0,
          backgroundColor: {
            radialGradient: { cx: 0.5, cy: 0.5, r: 0.46 },
            stops: [
              [0, "#000"],
              [1, "#D6DADC"], // #535455 for dark
            ],
          },
          innerRadius: "90%",
          outerRadius: "100%",
          shape: "circle",
        },
      },
      yAxis: {
        min: 0,
        max: 100,
        stops: [
          [0, "#41B883"],
          [0.6, "#ffc107"],
          [0.9, "#dc3545"],
        ],
        lineWidth: 0,
        minorTickInterval: null,
        tickPixelInterval: 400,
        tickWidth: 0,
        labels: {
          enabled: false,
        },
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            enabled: true,
            y: -31,
            borderWidth: 0,
            useHTML: true,
            format: format,
            style: {
              fontSize: "42px",
              fontFamily: "Lato",
              fontWeight: "300",
              color: "#4A4A4A",
            },
          },
        },
      },
      series: [
        {
          innerRadius: "90%",
          data: [Math.round(value)],
        },
      ],
    });

    this.addToRegistry(id, chart);

    return chart;
  },
  registerObserver(id) {
    const theme = useThemeStore();
    const color = () => (theme.active === "dark" ? "#535455" : "#D6DADC");

    this.updateTheme(id, color());

    const observer = new MutationObserver(() => {
      this.updateTheme(id, color());
    });

    observer.observe(theme.body, {
      attributes: true,
      childList: false,
      subtree: false,
    });
  },
  updateTheme(id, color) {
    //@ts-ignore
    this.registry[id].pane[0].background[0].element.style.fill = color;
  },
  updateDataPoint(id, value) {
    const dataPoint = this.registry[id].series[0].points[0];
    dataPoint.update(Math.round(value));
  },
  addToRegistry(id, chart) {
    this.registry[id] = chart;
  },
};
