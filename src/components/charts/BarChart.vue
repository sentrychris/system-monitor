<script setup lang="ts">
import { watch, onMounted } from "vue";
import { orderBy } from "lodash";
import { bar } from "@/utilities/charts/bar";

const props = defineProps<{
  metric: string;
  id: string;
  title?: string;
  series: Array<any>;
  legend?: boolean;
  yAxisText?: string;
  xAxisText?: string;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
}>();

onMounted(() => {
  const series = orderBy(props.series, props.sortKey, props.sortOrder);
  bar.create({
    id: props.id,
    title: props.title,
    series,
    yAxisText: props.yAxisText,
    xAxisText: props.xAxisText,
  });

  // watch(
  //   () => props.series,
  //   (next) => {
  //     bar.updateDataSeries(props.id, next);
  //   }
  // );
});
</script>

<template>
  <div class="highcharts-bar">
    <div :id="id"></div>
  </div>
</template>
