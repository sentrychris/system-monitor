<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import type { HubOverviewHost } from "@/interfaces/Hub";
import { usePinsStore } from "@/stores/pins";
import HostStatusChip from "./HostStatusChip.vue";

// One pinned host. Wraps HostStatusChip in a RouterLink to the host
// detail page; in dropdown mode an inline × button lets the user
// unpin without going to the host page first. The button is hidden
// in inline (navbar) mode to keep that row clean.
//
// When this chip points at the host the user is currently viewing,
// it adopts the active "you are here" recipe — same look as the
// breadcrumb in the navbar. Other pins stay muted so the active vs
// navigable distinction is unambiguous.
const props = defineProps<{
  host: HubOverviewHost;
  /** Show an inline unpin (×) button. Used in the overflow dropdown
   *  where each row has space for it; suppressed inline in the navbar
   *  where the chip's only job is fast navigation. */
  showUnpin?: boolean;
}>();

const pins = usePinsStore();
const route = useRoute();

// Match against /hub/hosts/:id only — other routes leave every chip
// in the muted state. Number() coerces the param string; route.name
// guards against false positives on non-host routes that might happen
// to have an `id` param in the future.
const isCurrent = computed(
  () => route.name === "hub-host" && Number(route.params.id) === props.host.id,
);

function onUnpinClick(e: MouseEvent): void {
  // Stop the click from bubbling to the RouterLink's nav handler — we
  // want to remove the pin, not navigate to the host that's about to
  // disappear from the list.
  e.preventDefault();
  e.stopPropagation();
  pins.unpin(props.host.id);
}
</script>

<template>
  <RouterLink
    :to="`/hub/hosts/${host.id}`"
    class="pin-chip-link"
    :class="{ 'with-unpin': showUnpin }"
  >
    <HostStatusChip
      :name="host.name"
      :status="host.status"
      :active="isCurrent"
      :show-icon="false"
      :title="host.name"
    />
    <button
      v-if="showUnpin"
      type="button"
      class="pin-chip-unpin"
      title="Unpin host"
      aria-label="Unpin host"
      @click="onUnpinClick"
    >
      <font-awesome-icon icon="fa-solid fa-trash" />
    </button>
  </RouterLink>
</template>

<style scoped>
/* Link wrapper has no chrome of its own — HostStatusChip provides the
   pill background. Inline-flex so the optional unpin button sits on
   the same baseline as the chip without disturbing it. */
.pin-chip-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  border-radius: 999px;
  /* Keep the focus ring on the link as a whole rather than the inner
     chip — clearer keyboard affordance. */
  outline: none;
}
.pin-chip-link:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 2px;
}

/* Hover lift on muted chips — signals "this is interactive" without
   adopting the full active glow (that's reserved for the current
   host). is-active chips ignore the override since the selector only
   targets .is-muted. */
.pin-chip-link:hover :deep(.host-chip.is-muted) {
  background: rgba(34, 211, 238, 0.10);
  border-color: rgba(34, 211, 238, 0.34);
  color: #67e8f9;
}
/* In dropdown mode the row goes full-width so the unpin button has
   room without compressing the host name. */
.pin-chip-link.with-unpin {
  width: 100%;
  justify-content: space-between;
  padding: 0.15rem 0.25rem;
  border-radius: 8px;
}
.pin-chip-link.with-unpin:hover {
  background: rgba(148, 163, 184, 0.08);
}
body[data-theme="dark"] .pin-chip-link.with-unpin:hover {
  background: rgba(148, 163, 184, 0.10);
}

.pin-chip-unpin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 0.66rem;
  cursor: pointer;
  transition: color 140ms ease, background 140ms ease, border-color 140ms ease;
}
.pin-chip-unpin:hover {
  color: #b91c1c;
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.32);
}
body[data-theme="dark"] .pin-chip-unpin:hover { color: #fda4af; }
</style>
