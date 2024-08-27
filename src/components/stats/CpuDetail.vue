<script setup lang="ts">
import type { CpuInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: CpuInformation;
}>();
</script>

<template>
  <p class="small"><strong>Usage:</strong> {{ detail.usage }} %</p>
  <p class="small"><strong>Freq:</strong> {{ detail.freq }} MHz</p>
  <p class="small"><strong>Power:</strong> 2 vCPU</p>
</template>
