<script setup lang="ts">
import type { PlatformInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: PlatformInformation;
  uptime?: string | null;
}>();
</script>

<template>
  <div class="metric-block">
    <div class="distro" :title="detail.distro">{{ detail.distro || "—" }}</div>
    <div class="metric-label">Distribution</div>
  </div>
  <div class="metric-rows">
    <div class="metric-row">
      <span class="row-label">Kernel</span>
      <span class="row-value mono">{{ detail.kernel || "—" }}</span>
    </div>
    <div class="metric-row">
      <span class="row-label">Uptime</span>
      <span class="row-value">{{ uptime ?? detail.uptime ?? "—" }}</span>
    </div>
  </div>
</template>

<style scoped>
.metric-block { margin-bottom: 0.65rem; }
.distro {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.metric-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-top: 4px;
}

.metric-rows {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  padding-top: 0.55rem;
  margin-top: 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.8rem;
  gap: 0.5rem;
}
.row-label { color: #6b7280; flex-shrink: 0; }
.row-value {
  color: #1f2937;
  font-weight: 600;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.row-value.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.75rem;
}

body[data-theme="dark"] .distro       { color: #f9fafb; }
body[data-theme="dark"] .metric-label { color: #8b8d8f; }
body[data-theme="dark"] .metric-rows  { border-top-color: rgba(255, 255, 255, 0.06); }
body[data-theme="dark"] .row-label    { color: #8b8d8f; }
body[data-theme="dark"] .row-value    { color: #e5e7eb; }
</style>
