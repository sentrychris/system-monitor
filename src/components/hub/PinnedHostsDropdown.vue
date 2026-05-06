<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import type { HubOverviewHost } from "@/interfaces/Hub";
import PinnedHostChip from "./PinnedHostChip.vue";

// Overflow menu for pins beyond the inline cap. Renders a "+N ▾"
// trigger; clicking opens a small panel of PinnedHostChips with
// inline unpin controls. Click-outside, Escape, and route navigation
// all close the panel — RouterLink inside PinnedHostChip handles the
// navigation case for free.
defineProps<{
  hosts: HubOverviewHost[];
  /** Total overflow count, shown in the trigger label. */
  count: number;
}>();

const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

function toggle(): void {
  open.value = !open.value;
}

function close(): void {
  open.value = false;
}

function onDocumentClick(e: MouseEvent): void {
  if (!wrapperRef.value) return;
  if (!wrapperRef.value.contains(e.target as Node)) close();
}

function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape") close();
}

// Listeners attach only while the panel is open, to avoid a permanent
// document-level click handler in the navbar.
watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKey);
  } else {
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onKey);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onKey);
});
</script>

<template>
  <div ref="wrapperRef" class="pin-overflow">
    <button
      type="button"
      class="pin-overflow-trigger"
      :class="{ 'is-open': open }"
      :aria-expanded="open"
      :aria-haspopup="true"
      :title="`${count} more pinned host${count === 1 ? '' : 's'}`"
      @click="toggle"
    >
      <span class="pin-overflow-count">+{{ count }}</span>
      <font-awesome-icon
        icon="fa-solid fa-caret-down"
        class="pin-overflow-caret"
        :class="{ 'is-up': open }"
      />
    </button>

    <Transition name="pin-overflow-fade">
      <div
        v-if="open"
        class="pin-overflow-panel"
        role="menu"
        aria-label="More pinned hosts"
      >
        <div class="pin-overflow-eyebrow">— MORE PINNED</div>
        <ul class="pin-overflow-list">
          <li v-for="host in hosts" :key="host.id" role="none">
            <PinnedHostChip :host="host" :show-unpin="true" />
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pin-overflow {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* Trigger reads as a quiet sibling to the inline pin chips — same
   pill silhouette but a slate palette instead of cyan, since it isn't
   itself a navigable host. */
.pin-overflow-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #cbd5e1;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: color 140ms ease, background 140ms ease, border-color 140ms ease;
}
.pin-overflow-trigger:hover,
.pin-overflow-trigger.is-open {
  color: #67e8f9;
  background: rgba(34, 211, 238, 0.10);
  border-color: rgba(34, 211, 238, 0.34);
}
.pin-overflow-trigger:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 2px;
}
.pin-overflow-count {
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
.pin-overflow-caret {
  font-size: 0.62rem;
  transition: transform 160ms ease;
}
.pin-overflow-caret.is-up { transform: rotate(180deg); }

/* Panel — small floating menu anchored under the trigger. Glass-card
   recipe consistent with the rest of the app's panels. */
.pin-overflow-panel {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  min-width: 220px;
  max-width: 320px;
  z-index: 1040;
  padding: 0.4rem 0.4rem 0.55rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 12px 32px -8px rgba(0, 0, 0, 0.55),
    0 24px 48px -16px rgba(0, 0, 0, 0.45);
}
body[data-theme="dark"] .pin-overflow-panel {
  background: rgba(15, 23, 42, 0.95);
}
.pin-overflow-eyebrow {
  padding: 0.4rem 0.55rem 0.45rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #94a3b8;
}
.pin-overflow-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

/* Fade + tiny lift on open. Respects reduced-motion. */
.pin-overflow-fade-enter-active,
.pin-overflow-fade-leave-active {
  transition: opacity 140ms ease, transform 160ms ease;
}
.pin-overflow-fade-enter-from,
.pin-overflow-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: reduce) {
  .pin-overflow-fade-enter-active,
  .pin-overflow-fade-leave-active { transition: none; }
}
</style>
