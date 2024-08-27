<script setup lang="ts">
import type { UsageInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: UsageInformation;
}>();
</script>

<template>
  <p class="small"><strong>Usage:</strong> {{ detail.percent }} %</p>
  <p class="small"><strong>Free</strong> {{ detail.free }} GB</p>
  <p class="small"><strong>Total</strong> {{ detail.total }} GB</p>
</template>
