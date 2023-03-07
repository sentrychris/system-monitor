<script setup lang="ts">
import { config } from "@/config";
</script>

<template>
  <footer class="bg-dark text-white" id="site-footer">
    <div
      class="container-fluid px-5 pb-1 pt-2 d-flex align-items-center justify-content-between"
    >
      <span class="text-muted">{{ config.app.name }}</span>
      <small class="text-muted">{{ config.app.version }}</small>
    </div>
  </footer>
</template>
