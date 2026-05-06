<script setup lang="ts">
type Tone = "blue" | "cyan" | "emerald" | "amber" | "purple" | "rose" | "neutral";

withDefaults(
  defineProps<{
    label: string;
    icon?: string;
    tone?: Tone;
  }>(),
  { tone: "neutral" },
);
</script>

<template>
  <span class="arch-pill" :class="[`tone-${tone}`]">
    <font-awesome-icon v-if="icon" :icon="`fa-solid ${icon}`" class="arch-pill-icon" />
    <span class="arch-pill-label">{{ label }}</span>
  </span>
</template>

<style scoped>
.arch-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.16rem 0.5rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  color: #475569;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
}
body[data-theme="dark"] .arch-pill {
  background: rgba(148, 163, 184, 0.16);
  color: #cbd5e1;
}

.arch-pill-icon {
  font-size: 0.72rem;
  opacity: 0.9;
}

.arch-pill.tone-blue    { background: rgba(96, 165, 250, 0.18);  color: #1d4ed8; }
.arch-pill.tone-cyan    { background: rgba(34, 211, 238, 0.18);  color: #0e7490; }
.arch-pill.tone-emerald { background: rgba(52, 211, 153, 0.18);  color: #047857; }
.arch-pill.tone-amber   { background: rgba(251, 191, 36, 0.20);  color: #b45309; }
.arch-pill.tone-purple  { background: rgba(167, 139, 250, 0.18); color: #6d28d9; }
.arch-pill.tone-rose    { background: rgba(244, 114, 182, 0.18); color: #be123c; }

body[data-theme="dark"] .arch-pill.tone-blue    { color: #93c5fd; }
body[data-theme="dark"] .arch-pill.tone-cyan    { color: #67e8f9; }
body[data-theme="dark"] .arch-pill.tone-emerald { color: #6ee7b7; }
body[data-theme="dark"] .arch-pill.tone-amber   { color: #fbbf24; }
body[data-theme="dark"] .arch-pill.tone-purple  { color: #c4b5fd; }
body[data-theme="dark"] .arch-pill.tone-rose    { color: #fda4af; }
</style>
