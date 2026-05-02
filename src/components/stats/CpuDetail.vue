<script setup lang="ts">
import type { CpuInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: CpuInformation;
}>();
</script>

<template>
  <div class="metric-block">
    <div class="metric-primary">
      <span class="metric-value">{{ detail.usage }}</span>
      <span class="metric-unit">%</span>
    </div>
    <div class="metric-label">Usage</div>
  </div>
  <div class="metric-rows">
    <div class="metric-row">
      <span class="row-label">Frequency</span>
      <span class="row-value">{{ detail.freq }} <span class="row-unit">MHz</span></span>
    </div>
    <div class="metric-row">
      <span class="row-label">Power</span>
      <span class="row-value">12 <span class="row-unit">vCPU</span></span>
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
  font-size: 2.2rem;
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

body[data-theme="dark"] .metric-value { color: #f9fafb; }
body[data-theme="dark"] .metric-unit  { color: #8b8d8f; }
body[data-theme="dark"] .metric-label { color: #8b8d8f; }
body[data-theme="dark"] .metric-rows  { border-top-color: rgba(255, 255, 255, 0.06); }
body[data-theme="dark"] .row-label    { color: #8b8d8f; }
body[data-theme="dark"] .row-value    { color: #e5e7eb; }
body[data-theme="dark"] .row-unit     { color: #6b7280; }
</style>
