<script setup lang="ts">
import { config } from "@/config";
</script>

<template>
  <footer class="bg-dark text-white" id="site-footer">
    <div
      class="container py-2 d-flex align-items-center justify-content-between flex-wrap"
    >
      <span class="text-muted small"><a class="text-success text-decoration-none"
        href="https://github.com/sentrychris/system-monitor">
          {{ config.app.name }}</a> - Made with ❤️  by <a class="text-success text-decoration-none" href="https://versyx.dev">Versyx</a>
      </span>
      <span class="d-flex items-center justify-between flex-wrap gap-1">
        <small class="text-muted">v{{ config.app.version }}</small>
        <div class="d-flex items-cetner">
          <small v-if="config.app.deployment.region" class="text-muted">- {{ config.app.deployment.region }}&nbsp;</small>
          <small v-if="config.app.deployment.instance" class="text-muted">- {{ config.app.deployment.instance }}</small>
        </div>
      </span>
    </div>
  </footer>
</template>
