<script setup lang="ts">
import { config } from "@/config";
</script>

<template>
  <footer id="site-footer" class="site-footer">
    <div
      class="container py-2 d-flex align-items-center justify-content-between flex-wrap"
    >
      <span class="footer-text">
        <a class="footer-link" :href="`https://github.com/sentrychris/system-monitor`">{{
          config.app.name
        }}</a>
        — Made with
        <span class="heart" aria-hidden="true">♥</span> by
        <a class="footer-link" href="https://github.com/sentrychris">Chris</a>
      </span>
      <span class="d-flex align-items-center gap-2 footer-meta">
        <span class="footer-pill">v{{ config.app.version }}</span>
        <span v-if="config.app.deployment.region" class="footer-pill">{{
          config.app.deployment.region
        }}</span>
        <span v-if="config.app.deployment.instance" class="footer-pill">{{
          config.app.deployment.instance
        }}</span>
      </span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #cbd5e1;
  position: relative;
  overflow: hidden;
}
.site-footer::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(600px circle at 0% 0%, rgba(59, 130, 246, 0.08), transparent 40%),
    radial-gradient(500px circle at 100% 100%, rgba(168, 85, 247, 0.06), transparent 40%);
  pointer-events: none;
}
.site-footer .container { position: relative; z-index: 1; }

.footer-text {
  font-size: 0.78rem;
  color: #9ca3af;
}
.footer-link {
  color: #34d399;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s ease;
}
.footer-link:hover {
  color: #6ee7b7;
  text-decoration: underline;
}

.heart {
  color: #f87171;
  font-size: 0.9rem;
}

.footer-meta { font-size: 0.7rem; }

.footer-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
</style>
