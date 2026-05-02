<script setup lang="ts">
import type { UsageInformation } from "@/interfaces/SystemInformation";

defineProps<{
  detail: UsageInformation;
}>();
</script>

<template>
  <div class="metric-block">
    <div class="metric-primary">
      <span class="metric-value">{{ detail.percent }}</span>
      <span class="metric-unit">%</span>
    </div>
    <div class="metric-label">Used</div>
    <div class="usage-bar">
      <div
        class="usage-bar-fill"
        :class="{
          'is-warn': detail.percent >= 75 && detail.percent < 90,
          'is-crit': detail.percent >= 90,
        }"
        :style="{ width: Math.min(100, Math.max(2, detail.percent)) + '%' }"
      ></div>
    </div>
  </div>
  <div class="metric-rows">
    <div class="metric-row">
      <span class="row-label">Free</span>
      <span class="row-value">{{ detail.free }} <span class="row-unit">GB</span></span>
    </div>
    <div class="metric-row">
      <span class="row-label">Total</span>
      <span class="row-value">{{ detail.total }} <span class="row-unit">GB</span></span>
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
  margin-bottom: 0.5rem;
}

.usage-bar {
  height: 4px;
  background: rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  overflow: hidden;
}
.usage-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 999px;
  transition: width 0.5s ease, background 0.3s ease;
}
.usage-bar-fill.is-warn { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.usage-bar-fill.is-crit { background: linear-gradient(90deg, #ef4444, #f87171); }

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
body[data-theme="dark"] .usage-bar    { background: rgba(255, 255, 255, 0.08); }
body[data-theme="dark"] .metric-rows  { border-top-color: rgba(255, 255, 255, 0.06); }
body[data-theme="dark"] .row-label    { color: #8b8d8f; }
body[data-theme="dark"] .row-value    { color: #e5e7eb; }
body[data-theme="dark"] .row-unit     { color: #6b7280; }
</style>
