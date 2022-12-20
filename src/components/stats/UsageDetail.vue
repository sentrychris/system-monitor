<script setup lang="ts">
import type { UsageInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: UsageInformation;
}>();
</script>

<template>
  <p><strong>Used</strong> {{ detail.used }} GB</p>
  <p><strong>Free</strong> {{ detail.free }} GB</p>
  <p><strong>Total</strong> {{ detail.total }} GB</p>
</template>
