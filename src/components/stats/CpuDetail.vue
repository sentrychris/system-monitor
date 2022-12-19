<script setup lang="ts">
import type { CpuInformation } from "@/interfaces/SystemInformation";

defineProps<{
    detail: CpuInformation
}>();
</script>

<template>
    <p><strong>Temp</strong> {{ detail.temp }}</p>
    <p><strong>Usage</strong> {{ detail.usage }}</p>
    <p><strong>Frequency</strong> {{ detail.freq }}</p>
</template>