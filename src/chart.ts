import type { Ref } from "vue";
import Chart, {
    type ChartOptions,
    type ChartConfiguration,
    type ChartItem,
    type ChartData
} from "chart.js/auto";

export interface ChartMaker {
    line(ctx: Ref<ChartItem | undefined>, data: ChartData, options?: ChartOptions): Chart
    bar(ctx: Ref<ChartItem | undefined>, data: ChartData, options?: ChartOptions): Chart
    donut(ctx: Ref<ChartItem | undefined>, data: ChartData, options?: any): Chart
    make(type: string, ctx: Ref<ChartItem | undefined>, data: ChartData, options?: any): Chart
}

export const chart: ChartMaker = {
    line(ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
        return this.make('line', ctx, data, options);
    },

    bar(ctx: Ref<ChartItem>, data: ChartData, options?: ChartOptions) {
        return this.make('bar', ctx, data, options);
    },

    donut(ctx: Ref<ChartItem>, data: ChartData, options?: any) {
        return this.make('doughnut', ctx, data, options);
    },

    make(type: string, ctx: Ref<ChartItem>, data: ChartData, options?: any) {
        return new Chart(ctx.value, <ChartConfiguration>{type, data, options});
    }
}