<script setup lang="ts">
defineProps<{
  status: "live" | "stale" | "offline";
}>();
</script>

<template>
  <span class="host-pill" :class="`status-${status}`">
    <span class="dot"></span>
    <span class="label">{{ status.toUpperCase() }}</span>
  </span>
</template>

<style scoped>
.host-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.22rem 0.6rem;
  border-radius: 6px;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--fs-micro, 0.625rem);
  font-weight: 700;
  letter-spacing: 0.16em;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}
body[data-theme="dark"] .host-pill { background: rgba(255, 255, 255, 0.04); }
.host-pill .dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}
.host-pill.status-live    { color: #34d399; }
.host-pill.status-stale   { color: #fbbf24; }
.host-pill.status-offline { color: #f87171; }
.host-pill.status-live .dot {
  animation: live-pulse 1.4s ease-in-out infinite;
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .host-pill.status-live .dot { animation: none; }
}
</style>
