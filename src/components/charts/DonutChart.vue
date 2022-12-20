<script setup lang="ts">
import { ref, inject } from "vue";
import { chartInjectionSymbol } from "@/injection";
import { mapUsageColor } from "@/utilities/color-map";

const props = defineProps<{
  data: number[] | number;
  label: string;
}>();

const chart = inject(chartInjectionSymbol);
const donut = ref<HTMLCanvasElement>();

chart
  ?.configure({
    data: props.data,
    labels: props.label,
    colors: [
      mapUsageColor(Array.isArray(props.data) ? props.data[0] : props.data),
      "#e6e6e6",
    ],
  })
  .then((config) => {
    chart.donut(donut, config, { responsive: true });
  });
</script>

<template>
  <canvas ref="donut"></canvas>
</template>
