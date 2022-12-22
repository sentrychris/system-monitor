<script setup lang="ts">
import { onMounted, watch } from "vue";
import { gauge } from "@/utilities/charts";

const props = defineProps<{
  id: string;
  title: string;
  metric: number;
  format: string;
}>();

onMounted(() => {
  gauge.create({
    id: props.id,
    value: props.metric,
    format: props.format,
  });

  watch(
    () => props.metric,
    (next) => {
      gauge.updateDataPoint(props.id, next);
    }
  );
});
</script>

<template>
  <div class="highcharts-gauge">
    <div class="chart-legend text-center text-muted">
      {{ title }}
    </div>
    <div :id="id" class="gauge"></div>
  </div>
</template>

<style scoped>
.gauge {
  max-width: 400px;
  height: 300px;
  margin: 0 auto;
}
</style>
