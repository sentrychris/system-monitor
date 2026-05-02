<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon?: string;
    tone?: "blue" | "purple" | "amber" | "green" | "red" | "slate";
  }>(),
  {
    tone: "blue",
  },
);
</script>

<template>
  <div class="section-header">
    <div class="d-flex align-items-center gap-3">
      <div v-if="icon" class="header-icon" :class="`tone-${tone}`">
        <font-awesome-icon :icon="icon" />
      </div>
      <div>
        <div class="header-title">{{ title }}</div>
        <div v-if="subtitle" class="header-sub">{{ subtitle }}</div>
      </div>
    </div>
    <div v-if="$slots.right" class="header-right">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #f9fafb;
  position: relative;
  overflow: hidden;
}
.section-header::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(800px circle at 0% 0%, rgba(59, 130, 246, 0.12), transparent 40%),
    radial-gradient(600px circle at 100% 100%, rgba(168, 85, 247, 0.1), transparent 40%);
  pointer-events: none;
}

.header-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  flex-shrink: 0;
}
.header-icon.tone-blue {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.25);
}
.header-icon.tone-purple {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  box-shadow: inset 0 0 0 1px rgba(168, 85, 247, 0.25);
}
.header-icon.tone-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.25);
}
.header-icon.tone-green {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.25);
}
.header-icon.tone-red {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.25);
}
.header-icon.tone-slate {
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}

.header-title {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.2px;
  line-height: 1.1;
}
.header-sub {
  font-size: 0.72rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.header-right {
  position: relative;
  z-index: 1;
}

@media (max-width: 575.98px) {
  .section-header { padding: 0.9rem 1rem; }
}
</style>
