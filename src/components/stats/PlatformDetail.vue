<script setup lang="ts">
import type { PlatformInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: PlatformInformation;
}>();
</script>

<template>
  <p><strong>OS</strong> {{ detail.distro }}</p>
  <p><strong>Kernel</strong> {{ detail.kernel }}</p>
  <p><strong>Uptime</strong> {{ detail.uptime }}</p>
</template>
