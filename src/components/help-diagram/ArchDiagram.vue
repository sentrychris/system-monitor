<script setup lang="ts">
defineProps<{
  caption?: string;
}>();
</script>

<template>
  <figure
    class="arch-diagram"
    :role="caption ? 'group' : undefined"
    :aria-label="caption"
  >
    <div class="arch-diagram-track">
      <slot />
    </div>
    <figcaption v-if="caption" class="arch-diagram-caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.arch-diagram {
  margin: 1rem;
  padding: 1.4rem 1.15rem 1.5rem;
  background:
    radial-gradient(circle at 18% 8%, rgba(56, 189, 248, 0.07), transparent 55%),
    radial-gradient(circle at 84% 90%, rgba(167, 139, 250, 0.06), transparent 60%),
    rgba(15, 23, 42, 0.025);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow-x: auto;
}
body[data-theme="dark"] .arch-diagram {
  background:
    radial-gradient(circle at 18% 8%, rgba(56, 189, 248, 0.10), transparent 55%),
    radial-gradient(circle at 84% 90%, rgba(167, 139, 250, 0.10), transparent 60%),
    rgba(10, 14, 23, 0.55);
  border-color: rgba(148, 163, 184, 0.18);
}

.arch-diagram-track {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0;
}

/* Narrow viewports: stack vertically so we don't push horizontal scroll.
   Children (ArchStage / ArchEdge) carry their own narrow-mode rules. */
@media (max-width: 720px) {
  .arch-diagram { overflow-x: visible; }
  .arch-diagram-track {
    flex-direction: column;
    align-items: stretch;
    gap: 0.4rem;
  }
}

.arch-diagram-caption {
  margin: 0.85rem 0 0;
  text-align: center;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #64748b;
}
body[data-theme="dark"] .arch-diagram-caption { color: #94a3b8; }
</style>
