<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Vertical alignment of nodes against the stage's full height. */
    align?: "center" | "stretch";
    /** Optional eyebrow rendered above the stack — handy for a single column note. */
    eyebrow?: string;
  }>(),
  { align: "center" },
);
</script>

<template>
  <div class="arch-stage" :class="[`align-${align}`, { 'has-eyebrow': !!eyebrow }]">
    <div v-if="eyebrow" class="arch-stage-eyebrow">{{ eyebrow }}</div>
    <div class="arch-stage-stack">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.arch-stage {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.arch-stage-stack {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex: 1 1 auto;
  /* `space-around` distributes children through the full height so a
     two-node stack lines up vertically with a two-arrow edge sibling
     (which uses the same justification). With a single child the rule
     degenerates to centering. */
  justify-content: space-around;
}
.arch-stage.align-stretch .arch-stage-stack { justify-content: stretch; }
.arch-stage.align-stretch .arch-stage-stack > :deep(*) { flex: 1 1 auto; }

.arch-stage-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  text-align: center;
  color: #64748b;
  margin-bottom: 0.55rem;
}
body[data-theme="dark"] .arch-stage-eyebrow { color: #94a3b8; }
</style>
