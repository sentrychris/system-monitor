import Chart from "chart.js/auto";
import { getRelativePosition } from 'chart.js/helpers';
import type  { ChartConfiguration, ChartItem, ChartData } from "chart.js/auto"

const chart = {
    make(type: string, ctx: ChartItem, data: ChartData) {
        return new Chart(ctx, <ChartConfiguration>{type, data});
    }
}
   