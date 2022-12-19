<script setup lang="ts">
import type { UsageInformation } from "@/interfaces/SystemInformation";

defineProps<{
    detail: UsageInformation
}>();
</script>

<template>
    <p><strong>Used</strong> {{ detail.used }}</p>
    <p><strong>Free</strong> {{ detail.free }}</p>
    <p><strong>Total</strong> {{ detail.total }}</p>
</template>