<script setup lang="ts">
import { onMounted } from "vue";
import {
  bar,
  formatBarChartDataForSystem,
  formatBarChartDataForNetworkTraffic,
} from "@/utilities/charts/bar";

const props = defineProps<{
  metric: string;
  id: string;
  title: string;
  series: Array<any>; // TODO change
  legend?: any; // TODO change
  yAxisText?: string;
  xAxisText?: string;
  sortKey?: string;
}>();

onMounted(() => {
  const series =
    props.metric === "system"
      ? formatBarChartDataForSystem(props.series, "mem")
      : formatBarChartDataForNetworkTraffic(props.series, [
          "mb_received",
          "mb_sent",
        ]);

  bar.create({
    id: props.id,
    series,
    yAxisText: props.yAxisText,
    xAxisText: props.xAxisText,
  });
});
</script>

<template>
  <div class="highcharts-bar">
    <div :id="id"></div>
  </div>
</template>
