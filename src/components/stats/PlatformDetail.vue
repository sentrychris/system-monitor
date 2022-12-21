<script setup lang="ts">
import type { PlatformInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: PlatformInformation;
  uptime: string;
}>();
</script>

<template>
  <p><strong>OS</strong> {{ detail.distro }}</p>
  <p><strong>Kernel</strong> {{ detail.kernel }}</p>
  <p><strong>Uptime</strong> {{ uptime }}</p>
</template>
