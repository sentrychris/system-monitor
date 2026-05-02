<script setup lang="ts">
import type { CpuInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: CpuInformation;
}>();
</script>

<template>
  <div class="metric-block">
    <div class="metric-primary metric-num">
      <span class="metric-value">{{ detail.usage }}</span>
      <span class="metric-unit">%</span>
    </div>
    <div class="metric-label">CPU LOAD</div>
  </div>
  <div class="metric-rows">
    <div class="metric-row">
      <span class="row-label">FREQ</span>
      <span class="row-value mono">{{ detail.freq }} <span class="row-unit">MHz</span></span>
    </div>
    <div class="metric-row">
      <span class="row-label">CORES</span>
      <span class="row-value mono">12 <span class="row-unit">vCPU</span></span>
    </div>
  </div>
</template>

<style scoped>
.metric-block { margin-bottom: 0.65rem; }
.metric-primary {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}
.metric-unit {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 500;
  margin-left: 4px;
}
.metric-label {
  font-family: "Orbitron", "Exo 2", monospace;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #6b7280;
  margin-top: 4px;
}
.row-value.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.75rem;
}
.row-label {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.metric-rows {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  padding-top: 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.8rem;
}
.row-label { color: #6b7280; }
.row-value {
  color: #1f2937;
  font-weight: 600;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
.row-unit { color: #9ca3af; font-weight: 500; font-size: 0.72rem; margin-left: 2px; }

body[data-theme="dark"] .metric-value { color: var(--text-primary); }
body[data-theme="dark"] .metric-unit  { color: var(--text-muted); }
body[data-theme="dark"] .metric-label { color: var(--text-muted); }
body[data-theme="dark"] .metric-rows  { border-top-color: var(--border-subtle); }
body[data-theme="dark"] .row-label    { color: var(--text-muted); }
body[data-theme="dark"] .row-value    { color: var(--text-secondary); }
body[data-theme="dark"] .row-unit     { color: var(--text-dim); }
</style>
