<script setup lang="ts">
withDefaults(
  defineProps<{
    decorTitle: string;
    title: string;
    compact?: boolean;
  }>(),
  { compact: false },
);
</script>

<template>
  <div class="page-header" :class="{ 'is-compact': compact }">
    <div class="eyebrow">{{ decorTitle }}</div>
    <h1 class="page-title">{{ title }}</h1>
  </div>
</template>

<style scoped>
.page-header {
  padding: 0;
  line-height: 1;
}

.eyebrow {
  font-family: "Orbitron", "Exo 2", sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #60a5fa;
}

.page-title {
  font-family: "Orbitron", "Exo 2", sans-serif;
  font-weight: 600;
  font-size: 1.15rem;
  letter-spacing: 0.04em;
  color: #f9fafb;
  margin: 0.2rem 0 0;
  line-height: 1.1;
}

/* Default (non-compact) page header for use outside the navbar */
.page-header:not(.is-compact) {
  padding: 0.75rem 0 0.25rem;
}
.page-header:not(.is-compact) .eyebrow {
  color: #6b7280;
}
.page-header:not(.is-compact) .page-title {
  font-weight: 200;
  font-size: 2rem;
  letter-spacing: -0.5px;
  color: #111827;
}
body[data-theme="dark"] .page-header:not(.is-compact) .page-title {
  color: var(--text-primary);
}
body[data-theme="dark"] .page-header:not(.is-compact) .eyebrow {
  color: var(--text-muted);
}

@media (max-width: 575.98px) {
  .page-title { font-size: 1rem; }
  .eyebrow { font-size: 0.55rem; letter-spacing: 0.2em; }
  .page-header:not(.is-compact) .page-title { font-size: 1.5rem; }
}
</style>
