import type { Ref } from "vue";
import Chart, {
  type ChartOptions,
  type ChartConfiguration,
  type ChartItem,
  type ChartData
} from "chart.js/auto";

export interface ChartMaker {
  configure({data, labels, colors}: {
    data: number[] | number;
    labels: string[] | string;
    colors?: string[];
  }): Promise<ChartData>;

  bar(ctx: Ref<ChartItem | undefined>, data: ChartData, options?: ChartOptions): Chart;

  line(ctx: Ref<ChartItem | undefined>, data: ChartData, options?: ChartOptions): Chart;
  
  donut(ctx: Ref<ChartItem | undefined>, data: ChartData, options?: ChartOptions): Chart;
  
  make(type: string, ctx: Ref<ChartItem | undefined>, data: ChartData, options?: ChartOptions): Chart;
}

export const chart: ChartMaker = {  
  async configure({data, labels, colors}: {
    data: number[] | number;
    labels: string[] | string;
    colors?: string[]
  }) {
    const value = Array.isArray(data)
      ? data
      : [data, 100]

    const label = Array.isArray(labels)
      ? labels
      : [labels]

    if (!colors) {
      colors = [  
        'rgb(255, 99, 132)',
        '#e6e6e6',
      ]
    }

    return {
      labels: label,
      datasets: [{
        data: value,
        backgroundColor: colors,
        hoverOffset: 4
      }],
    }
  },

  bar(ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
    return this.make('bar', ctx, data, options);
  },

  line(ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
    return this.make('line', ctx, data, options);
  },
  
  donut(ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
    // options = {
    //   ...options,
    //   cutout: 115
    // };

    return this.make('doughnut', ctx, data, options);
  },
  
  make(type: string, ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
    return new Chart(ctx.value, <ChartConfiguration>{type, data, options});
  }
}