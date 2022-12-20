import type { Ref, App } from "vue";
import Chart, {
  type ChartOptions,
  type ChartConfiguration,
  type ChartItem,
  type ChartData,
} from "chart.js/auto";
import { chartInjectionSymbol } from "../injection";

export class ChartMaker {
  async configure({
    data,
    labels,
    colors,
  }: {
    data: number[] | number;
    labels: string[] | string;
    colors?: string[];
  }) {
    const value = Array.isArray(data) ? data : [data, 100];
    const label = Array.isArray(labels) ? labels : [labels];
    
    if (!colors) {
      colors = ["rgb(255, 99, 132)", "#e6e6e6"];
    }
    
    return {
      labels: label,
      datasets: [
        {
          data: value,
          backgroundColor: colors,
          hoverOffset: 4,
        },
      ],
    };
  }
  
  bar(ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
    return this.make("bar", ctx, data, options);
  }
  
  line(ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
    return this.make("line", ctx, data, options);
  }
  
  donut(ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
    return this.make("doughnut", ctx, data, options);
  }
  
  make(
    type: string,
    ctx: Ref<ChartItem>,
    data: ChartData,
    options?: ChartOptions
  ) {
    return new Chart(ctx.value, <ChartConfiguration>{ type, data, options });
  }
}
  
const chart = new ChartMaker();

export const useChart = {
  install(app: App) {
    app.provide(chartInjectionSymbol, chart);
  },
};
  