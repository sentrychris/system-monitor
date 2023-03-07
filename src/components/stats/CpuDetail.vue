<script setup lang="ts">
import type { CpuInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: CpuInformation;
}>();
</script>

<template>
  <p class="small"><strong>Temp</strong> {{ detail.temp }} °C</p>
  <p class="small"><strong>Usage</strong> {{ detail.usage }} %</p>
  <p class="small"><strong>Frequency</strong> {{ detail.freq }} MHz</p>
</template>
