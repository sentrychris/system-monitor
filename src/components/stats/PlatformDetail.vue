<script setup lang="ts">
import type { PlatformInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: PlatformInformation;
  uptime?: string | null;
}>();
</script>

<template>
  <p class="small"><strong>ED:CS</strong> v1.0.0</p>
  <p class="small"><a style="color:#eeeeee" href="https://edcs.app">https://edcs.app</a></p>
  <p class="small"><strong>Up</strong> {{ uptime ?? detail.uptime }}</p>
</template>
