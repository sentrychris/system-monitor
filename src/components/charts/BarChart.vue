<script setup lang="ts">
import { watch, onMounted } from "vue";
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
}>();

onMounted(() => {
  bar.create({
    id: props.id,
    title: props.title,
    series: props.series,
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
