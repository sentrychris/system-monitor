<script setup lang="ts">
import type { HostStatus } from "@/interfaces/Hub";

// Visual primitive — server icon + host name + status-coloured dot.
// Two consumers today: the navbar's "you-are-here" host crumb, and
// PinnedHostChip (which wraps this in a RouterLink). Status null
// means we know the id but haven't seen the host on the hub yet —
// renders a neutral grey dot rather than a status color.
//
// :active is the "you are here" signal — lit cyan recipe with an
// inset glow. Default is the muted slate recipe so pin chips read as
// secondary navigable items distinct from the active breadcrumb. The
// pin orchestrator flips :active on whichever chip matches the
// currently-viewed host, so breadcrumb + matching pin stay visually
// consistent.
defineProps<{
  name: string;
  status: HostStatus | null;
  /** Show the small server icon on the left. The crumb wants it; the
   *  pin chips want a tighter footprint, so they pass `false`. */
  showIcon?: boolean;
  /** Render the lit "you are here" variant. Default is the muted
   *  variant used by navigable pin chips. */
  active?: boolean;
  /** Optional title attribute — e.g. for tooltips on truncation. */
  title?: string;
}>();
</script>

<template>
  <span
    class="host-chip"
    :class="[
      active ? 'is-active' : 'is-muted',
      status ? `status-${status}` : 'status-unknown',
    ]"
    :title="title"
  >
    <font-awesome-icon
      v-if="showIcon !== false"
      icon="fa-solid fa-server"
      class="host-chip-icon"
    />
    <span class="host-chip-name">{{ name }}</span>
    <span
      class="host-chip-dot"
      :title="status ? status.toUpperCase() : 'UNKNOWN'"
    ></span>
  </span>
</template>

<style scoped>
/* Two visual recipes:
   - .is-muted: slate palette, secondary nav target. Pin chips at rest
     use this so they read as "places you can go".
   - .is-active: lit cyan with an inset glow. The breadcrumb and any
     pin chip whose host matches the current route use this so the
     "you are here" signal is unambiguous.
   The animation keyframe is duplicated locally because Vue scoped
   styles don't share names across components. */
.host-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.7rem 0.3rem 0.55rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  transition: color 140ms ease, background 140ms ease, border-color 140ms ease, box-shadow 200ms ease;
}

.host-chip.is-muted {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.28);
  color: #cbd5e1;
}

.host-chip.is-active {
  background: rgba(34, 211, 238, 0.12);
  border: 1px solid rgba(34, 211, 238, 0.4);
  color: #67e8f9;
  /* Inset ring + outer glow — same recipe as .seg.is-active in
     SiteNavbar.vue so the active host chip and the active view-mode
     segment share one "you-are-here" vocabulary. */
  box-shadow:
    inset 0 0 0 1px rgba(34, 211, 238, 0.2),
    0 0 14px -4px rgba(34, 211, 238, 0.4);
}

.host-chip-icon {
  font-size: 0.74rem;
  opacity: 0.85;
}
.host-chip.is-muted   .host-chip-icon { color: #94a3b8; }
.host-chip.is-active  .host-chip-icon { color: #22d3ee; }
.host-chip-name {
  color: #e2e8f0;
  line-height: 1;
  /* Long host names get truncated rather than pushing other navbar
     items off the row. 18ch lets typical hostnames render in full
     while clamping the worst offenders. */
  max-width: 18ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Status dot — same emerald/amber/rose vocab as the host pages so
   colour coding is consistent across the app. */
.host-chip-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 6px #94a3b8;
  flex-shrink: 0;
}
.host-chip.status-live    .host-chip-dot { background: #34d399; box-shadow: 0 0 8px #34d399; animation: host-chip-pulse 1.4s ease-in-out infinite; }
.host-chip.status-stale   .host-chip-dot { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
.host-chip.status-offline .host-chip-dot { background: #f87171; box-shadow: 0 0 8px #f87171; }
.host-chip.status-unknown .host-chip-dot { background: #94a3b8; box-shadow: 0 0 6px rgba(148, 163, 184, 0.6); }

@keyframes host-chip-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .host-chip.status-live .host-chip-dot { animation: none; }
}
@media (max-width: 575.98px) {
  .host-chip-name { max-width: 12ch; }
}
</style>
