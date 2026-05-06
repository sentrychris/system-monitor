<script setup lang="ts">
import { computed } from "vue";
import { config } from "@/config";
import { useHubStore } from "@/stores/hub";
import { usePinsStore } from "@/stores/pins";
import PinnedHostChip from "./PinnedHostChip.vue";
import PinnedHostsDropdown from "./PinnedHostsDropdown.vue";

// Orchestrator. Resolves stored pin ids against the live hub host
// list, splits the result into inline + overflow at the configured
// limit, and renders the chips.
const props = withDefaults(
  defineProps<{ inlineLimit?: number }>(),
  { inlineLimit: 0 },  // 0 ⇒ fall through to config default below
);

const hub = useHubStore();
const pins = usePinsStore();

const limit = computed(() =>
  props.inlineLimit > 0 ? props.inlineLimit : config.pins.inlineLimit,
);

// Pinned hosts that the hub currently knows about, in pin order.
const resolved = computed(() => pins.pinnedHostsFrom(hub.hosts));

const inline = computed(() => resolved.value.slice(0, limit.value));
const overflow = computed(() => resolved.value.slice(limit.value));
</script>

<template>
  <div v-if="resolved.length" class="pin-bar" aria-label="Pinned hosts">
    <PinnedHostChip
      v-for="host in inline"
      :key="host.id"
      :host="host"
    />
    <PinnedHostsDropdown
      v-if="overflow.length"
      :hosts="overflow"
      :count="overflow.length"
    />
  </div>
</template>

<style scoped>
.pin-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.5rem;
  /* Wrap rather than overflow when the navbar is tight; on mobile the
     bar stacks below the segments via the navbar's own collapse. */
  flex-wrap: wrap;
}
@media (max-width: 991.98px) {
  .pin-bar {
    margin-left: 0;
    margin-top: 0.4rem;
    align-self: flex-start;
  }
}
</style>
