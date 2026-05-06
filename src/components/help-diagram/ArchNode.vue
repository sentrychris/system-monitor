<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

type Tone = "blue" | "cyan" | "emerald" | "amber" | "purple" | "rose";

const props = withDefaults(
  defineProps<{
    title: string;
    sub?: string;
    icon?: string;
    tone?: Tone;
    /** When set, the whole card becomes a router link to this path. */
    to?: string;
    /**
     * Visual size. `lg` is used for hub-style nodes that need to read as a
     * larger, central piece compared to flanking collector / UI cards.
     */
    size?: "md" | "lg";
  }>(),
  { tone: "blue", size: "md" },
);

const isLink = computed(() => !!props.to);
</script>

<template>
  <component
    :is="isLink ? RouterLink : 'div'"
    v-bind="isLink ? { to } : {}"
    class="arch-node"
    :class="[`tone-${tone}`, `size-${size}`, { 'is-link': isLink }]"
  >
    <span v-if="icon" class="arch-node-icon" aria-hidden="true">
      <font-awesome-icon :icon="`fa-solid ${icon}`" />
    </span>
    <span class="arch-node-body">
      <span class="arch-node-title">{{ title }}</span>
      <span v-if="sub" class="arch-node-sub">{{ sub }}</span>
      <span v-if="$slots.default" class="arch-node-extras"><slot /></span>
    </span>
  </component>
</template>

<style scoped>
.arch-node {
  --tone-fg: #475569;
  --tone-bg: rgba(148, 163, 184, 0.10);
  --tone-bd: rgba(148, 163, 184, 0.35);
  --tone-glow: rgba(148, 163, 184, 0.0);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.6));
  border: 1px solid var(--tone-bd);
  border-left: 3px solid var(--tone-fg);
  border-radius: 9px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  min-width: 9rem;
  flex: 0 1 auto;
}
body[data-theme="dark"] .arch-node {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.8));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.arch-node.size-lg {
  padding: 0.85rem 0.95rem;
  min-width: 10.5rem;
}

.arch-node.is-link { cursor: pointer; }
.arch-node.is-link:hover,
.arch-node.is-link:focus-visible {
  transform: translateY(-1px);
  border-color: var(--tone-fg);
  box-shadow:
    0 6px 18px -10px var(--tone-glow),
    0 1px 2px rgba(15, 23, 42, 0.06);
  outline: none;
}

.arch-node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 7px;
  background: var(--tone-bg);
  color: var(--tone-fg);
  font-size: 0.95rem;
  flex-shrink: 0;
}
.arch-node.size-lg .arch-node-icon {
  width: 2.3rem;
  height: 2.3rem;
  font-size: 1.05rem;
}

.arch-node-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.arch-node-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: #0f172a;
  letter-spacing: -0.005em;
}
body[data-theme="dark"] .arch-node-title { color: #f1f5f9; }
.arch-node.size-lg .arch-node-title { font-size: 1rem; }

.arch-node-sub {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  color: #64748b;
  letter-spacing: 0.01em;
}
body[data-theme="dark"] .arch-node-sub { color: #94a3b8; }

.arch-node-extras {
  margin-top: 0.35rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

/* ── Tone palette — keys match the existing icon-tile tones in help.scss. ─ */
.arch-node.tone-blue {
  --tone-fg: #2563eb;
  --tone-bg: rgba(96, 165, 250, 0.14);
  --tone-bd: rgba(96, 165, 250, 0.40);
  --tone-glow: rgba(59, 130, 246, 0.45);
}
.arch-node.tone-cyan {
  --tone-fg: #0891b2;
  --tone-bg: rgba(34, 211, 238, 0.14);
  --tone-bd: rgba(34, 211, 238, 0.40);
  --tone-glow: rgba(34, 211, 238, 0.45);
}
.arch-node.tone-emerald {
  --tone-fg: #059669;
  --tone-bg: rgba(52, 211, 153, 0.14);
  --tone-bd: rgba(52, 211, 153, 0.40);
  --tone-glow: rgba(16, 185, 129, 0.45);
}
.arch-node.tone-amber {
  --tone-fg: #d97706;
  --tone-bg: rgba(251, 191, 36, 0.16);
  --tone-bd: rgba(251, 191, 36, 0.45);
  --tone-glow: rgba(245, 158, 11, 0.45);
}
.arch-node.tone-purple {
  --tone-fg: #7c3aed;
  --tone-bg: rgba(167, 139, 250, 0.14);
  --tone-bd: rgba(167, 139, 250, 0.40);
  --tone-glow: rgba(139, 92, 246, 0.45);
}
.arch-node.tone-rose {
  --tone-fg: #e11d48;
  --tone-bg: rgba(244, 114, 182, 0.14);
  --tone-bd: rgba(244, 114, 182, 0.40);
  --tone-glow: rgba(244, 63, 94, 0.45);
}

body[data-theme="dark"] .arch-node.tone-blue    { --tone-fg: #60a5fa; }
body[data-theme="dark"] .arch-node.tone-cyan    { --tone-fg: #22d3ee; }
body[data-theme="dark"] .arch-node.tone-emerald { --tone-fg: #34d399; }
body[data-theme="dark"] .arch-node.tone-amber   { --tone-fg: #fbbf24; }
body[data-theme="dark"] .arch-node.tone-purple  { --tone-fg: #a78bfa; }
body[data-theme="dark"] .arch-node.tone-rose    { --tone-fg: #fb7185; }
</style>
