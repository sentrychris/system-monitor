<script setup lang="ts">
import type { PlatformInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: PlatformInformation;
  uptime?: string | null;
}>();
</script>

<template>
  <p><strong>OS</strong> {{ detail.distro }}</p>
  <p><strong>Kernel</strong> {{ detail.kernel }}</p>
  <p><strong>Uptime</strong> {{ uptime ?? detail.uptime }}</p>
</template>
