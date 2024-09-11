<script setup lang="ts">
import { watch, onMounted } from "vue";
import { pie } from "@/utilities/charts/pie";

const props = defineProps<{
  id: string;
  title?: string;
  series: Array<any>;
}>();

onMounted(() => {
  pie.create({
    id: props.id,
    title: props.title,
    series: props.series,
  });

  watch(
    () => props.series,
    (next) => {
      pie.updateDataSeries(props.id, next);
    },
  );
});
</script>

<template>
  <div class="highcharts-pie">
    <div :id="id"></div>
  </div>
</template>
