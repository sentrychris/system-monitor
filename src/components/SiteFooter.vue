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
          {{ config.app.name }}</a> - Made with ❤️  by <a class="text-success text-decoration-none" href="https://versyx.dev">Chris Rowles</a>
      </span>
      <small class="text-muted">{{ config.app.version }}</small>
    </div>
  </footer>
</template>
