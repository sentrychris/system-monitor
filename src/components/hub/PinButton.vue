<script setup lang="ts">
import { computed } from "vue";
import { usePinsStore } from "@/stores/pins";

// Toggle pin state for a host. Reads/writes the pins store directly,
// no events bubbled to the parent — the store is the source of truth
// and any other consumer (the navbar bar, future fleet-view buttons)
// will react automatically.
const props = defineProps<{
  hostId: number;
}>();

const pins = usePinsStore();
const pinned = computed(() => pins.isPinned(props.hostId));

const icon = computed(() =>
  pinned.value ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark",
);
const title = computed(() => (pinned.value ? "Unpin host" : "Pin host"));

function onClick(): void {
  pins.toggle(props.hostId);
}
</script>

<template>
  <button
    type="button"
    class="pin-btn"
    :class="{ 'is-pinned': pinned }"
    :title="title"
    :aria-label="title"
    :aria-pressed="pinned"
    @click="onClick"
  >
    <font-awesome-icon :icon="icon" />
  </button>
</template>

<style scoped>
/* Icon-button shape that fits next to other host-detail action buttons
   (collector-link, collector-edit, host-delete). Same 34px square,
   rounded corners, hover lift to amber on the unpinned state and gold
   on the pinned state — gold communicates "this is now bookmarked"
   without leaning on the alert-rose or success-emerald palette. */
.pin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(148, 163, 184, 0.06);
  color: #6b7280;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}
.pin-btn:hover:not(:disabled) {
  color: #b45309;
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.08);
}
.pin-btn.is-pinned {
  /* Active/pinned state — fills the icon and warms the chrome. */
  color: #b45309;
  border-color: rgba(251, 191, 36, 0.55);
  background: rgba(251, 191, 36, 0.14);
}
.pin-btn.is-pinned:hover:not(:disabled) {
  /* Slight darken so the click target reads as interactive even in
     the active state. */
  background: rgba(251, 191, 36, 0.22);
  border-color: rgba(251, 191, 36, 0.7);
}
body[data-theme="dark"] .pin-btn {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(148, 163, 184, 0.04);
}
body[data-theme="dark"] .pin-btn:hover:not(:disabled),
body[data-theme="dark"] .pin-btn.is-pinned {
  color: #fbbf24;
}
</style>
