<script setup lang="ts">
import { onMounted, watch } from "vue";
import { gauge } from "@/utilities/charts";

const props = defineProps<{
  id: string;
  title?: string;
  metric: number;
  format: string;
}>();

onMounted(() => {
  gauge.create({
    id: props.id,
    value: props.metric,
    format: props.format,
  });

  gauge.registerObserver(props.id);

  watch(
    () => props.metric,
    (next) => {
      gauge.updateDataPoint(props.id, next);
    },
  );
});
</script>

<template>
  <div class="highcharts-gauge">
    <div class="chart-legend text-center" v-if="title">
      {{ title }}
    </div>
    <div :id="id" class="gauge"></div>
  </div>
</template>

<style scoped>
.chart-legend {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7280;
}
.gauge {
  max-width: 400px;
  height: 200px;
  margin: 0 auto;
}

body[data-theme="dark"] .chart-legend {
  color: #8b8d8f;
}
</style>
