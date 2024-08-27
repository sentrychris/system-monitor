<script setup lang="ts">
import type { PlatformInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: PlatformInformation;
  uptime?: string | null;
}>();
</script>

<template>
  <p class="small"><strong>Up:</strong> {{ uptime ?? detail.uptime }}</p>
  <p class="small"><strong><a class="text-success" href="https://edcts.versyx.net">https://edcts.versyx.net</a></strong></p>
  <p class="small"><strong><a class="text-success" href="https://edcts-api.versyx.net">https://edcts-api.versyx.net</a></strong></p>
</template>
