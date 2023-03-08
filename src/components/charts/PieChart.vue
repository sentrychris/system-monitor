<script setup lang="ts">
import { onMounted } from "vue";
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
});
</script>

<template>
  <div class="highcharts-pie">
    <div :id="id"></div>
  </div>
</template>
