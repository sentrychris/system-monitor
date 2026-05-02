<script setup lang="ts">
import { useLoadingStore } from "@/stores/loading";

withDefaults(
  defineProps<{
    title: string;
    icon?: string;
    tone?: "blue" | "purple" | "amber" | "green" | "red" | "slate";
  }>(),
  {
    tone: "blue",
  },
);

const loader = useLoadingStore();
</script>

<template>
  <div class="card stat-card panel-card border-0 shadow-lg flex-fill">
    <div class="stat-header">
      <div class="d-flex align-items-center gap-3">
        <div v-if="icon" class="stat-icon" :class="`tone-${tone}`">
          <font-awesome-icon :icon="icon" />
        </div>
        <div class="stat-title">{{ title }}</div>
      </div>
    </div>
    <div class="stat-body">
      <slot v-if="loader.loaded" name="detail" />
      <div v-else class="stat-loading">Loading…</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.1rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #f9fafb;
  position: relative;
  overflow: hidden;
}
.stat-header::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(500px circle at 0% 0%, rgba(59, 130, 246, 0.10), transparent 40%),
    radial-gradient(400px circle at 100% 100%, rgba(168, 85, 247, 0.08), transparent 40%);
  pointer-events: none;
}

.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}
.stat-icon.tone-blue   { background: rgba(59, 130, 246, 0.15);  color: #60a5fa; box-shadow: inset 0 0 0 1px rgba(59,130,246,0.25); }
.stat-icon.tone-purple { background: rgba(168, 85, 247, 0.15);  color: #c084fc; box-shadow: inset 0 0 0 1px rgba(168,85,247,0.25); }
.stat-icon.tone-amber  { background: rgba(245, 158, 11, 0.15);  color: #fbbf24; box-shadow: inset 0 0 0 1px rgba(245,158,11,0.25); }
.stat-icon.tone-green  { background: rgba(16, 185, 129, 0.15);  color: #34d399; box-shadow: inset 0 0 0 1px rgba(16,185,129,0.25); }
.stat-icon.tone-red    { background: rgba(239, 68, 68, 0.15);   color: #f87171; box-shadow: inset 0 0 0 1px rgba(239,68,68,0.25); }
.stat-icon.tone-slate  { background: rgba(148, 163, 184, 0.12); color: #cbd5e1; box-shadow: inset 0 0 0 1px rgba(148,163,184,0.2); }

.stat-title {
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.2px;
}

.stat-body {
  flex: 1;
  padding: 1rem 1.1rem 1.1rem;
  background: #ffffff;
}

.stat-loading {
  color: #9ca3af;
  font-size: 0.85rem;
}

body[data-theme="dark"] .stat-body {
  background: rgb(45, 45, 45);
}
body[data-theme="dark"] .stat-loading {
  color: #6b7280;
}
</style>
