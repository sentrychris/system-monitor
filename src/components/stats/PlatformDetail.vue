<script setup lang="ts">
import type { PlatformInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: PlatformInformation;
  uptime?: string | null;
}>();
</script>

<template>
  <p class="small"><strong>OS</strong> {{ detail.distro }}</p>
  <p class="small"><strong>Kernel</strong> {{ detail.kernel }}</p>
  <p class="small"><strong>Uptime</strong> {{ uptime ?? detail.uptime }}</p>
</template>
