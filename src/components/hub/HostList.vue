<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { useHubStore } from "@/stores/hub";
import type { HostStatus, HubOverviewHost } from "@/interfaces/Hub";
import SortToolbar, {
  type SortState,
  type SortOption,
} from "@/components/SortToolbar.vue";

const hub = useHubStore();
const filter = ref("");

// Default: status ascending = "unhealthy first" (offline → stale → live),
// preserving the original behaviour of the hardcoded sort.
const sort = ref<SortState>({ field: "status", direction: "asc" });
const sortOptions: SortOption[] = [
  {
    value: "status",
    label: "Status",
    defaultDirection: "asc",
    tooltip: "Asc: unhealthy first · Desc: healthy first",
  },
  {
    value: "name",
    label: "Name",
    defaultDirection: "asc",
    tooltip: "Asc: A→Z · Desc: Z→A",
  },
];

const filtered = computed<HubOverviewHost[]>(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return hub.hosts;
  return hub.hosts.filter((h) =>
    h.name.toLowerCase().includes(q) ||
    (h.os ?? "").toLowerCase().includes(q) ||
    h.tags.some((t) => t.toLowerCase().includes(q))
  );
});

const STATUS_ORDER: Record<HostStatus, number> = { offline: 0, stale: 1, live: 2 };

const sorted = computed<HubOverviewHost[]>(() => {
  const dir = sort.value.direction === "asc" ? 1 : -1;
  return [...filtered.value].sort((a, b) => {
    if (sort.value.field === "name") {
      return a.name.localeCompare(b.name) * dir;
    }
    // status — primary key honours direction; alphabetical tiebreak is
    // always ascending so equal-status hosts stay readable regardless.
    const oa = STATUS_ORDER[a.status], ob = STATUS_ORDER[b.status];
    if (oa !== ob) return (oa - ob) * dir;
    return a.name.localeCompare(b.name);
  });
});

// Surface controls when there's enough fleet to warrant them — sorting
// one host is meaningless, filtering under ~6 is slower than eyeballing.
const showSorter = computed(() => hub.hosts.length >= 2);
const showFilter = computed(() => hub.hosts.length >= 6);

function relTime(unixS: number): string {
  const ageS = Math.max(0, Math.floor(Date.now() / 1000) - unixS);
  if (ageS < 60)    return `${ageS}s`;
  if (ageS < 3600)  return `${Math.floor(ageS / 60)}m`;
  if (ageS < 86400) return `${Math.floor(ageS / 3600)}h`;
  return `${Math.floor(ageS / 86400)}d`;
}

function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return `${v.toFixed(1)}%`;
}

function metricTone(v: number | null | undefined): "ok" | "warn" | "crit" | "none" {
  if (v === null || v === undefined) return "none";
  if (v >= 90) return "crit";
  if (v >= 75) return "warn";
  return "ok";
}
</script>

<template>
  <div class="card panel-card border-0 shadow-lg flex-fill">
    <div class="section-header">
      <div class="header-left">
        <div class="header-icon">
          <font-awesome-icon icon="fa-solid fa-server" />
        </div>
        <div>
          <div class="header-title">Hosts</div>
          <div class="header-sub">
            <template v-if="filter && sorted.length !== hub.hosts.length">
              {{ sorted.length }} / {{ hub.hosts.length }} SHOWN
            </template>
            <template v-else>
              {{ hub.hosts.length }} REGISTERED
            </template>
          </div>
        </div>
      </div>
      <div class="header-right">
        <SortToolbar v-if="showSorter" v-model="sort" :options="sortOptions" />
        <div v-if="showFilter" class="header-filter">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="filter-icon" />
          <input
            v-model="filter"
            type="text"
            placeholder="filter…"
            spellcheck="false"
            autocomplete="off"
            aria-label="Filter hosts"
          />
        </div>
      </div>
    </div>

    <div v-if="filter && !sorted.length" class="empty filter-empty">
      <font-awesome-icon icon="fa-solid fa-circle-question" class="empty-icon" />
      <div class="empty-title">No matches</div>
      <div class="empty-sub">
        Nothing in the fleet matches <code>{{ filter }}</code>.
      </div>
    </div>

    <div v-if="!hub.hosts.length" class="empty">
      <font-awesome-icon icon="fa-solid fa-circle-nodes" class="empty-icon" />
      <div class="empty-title">No hosts yet</div>
      <div class="empty-sub">
        Run a Collector with <code>--hub</code> + <code>--hub_key</code>
        to register one.
      </div>
    </div>

    <div v-else class="host-list">
      <RouterLink
        v-for="h in sorted"
        :key="h.id"
        :to="`/hub/hosts/${h.id}`"
        class="host-row"
        :class="`status-${h.status}`"
      >
        <span class="status-edge" aria-hidden="true"></span>

        <div class="host-meta">
          <div class="host-line">
            <span class="host-name">{{ h.name }}</span>
            <span class="host-pill" :class="`status-${h.status}`">
              <span class="pill-dot"></span>
              {{ h.status.toUpperCase() }}
            </span>
            <span class="host-seen">{{ relTime(h.last_seen) }} ago</span>
          </div>
          <div class="host-tags">
            <span v-if="h.os"   class="host-tag">{{ h.os }}</span>
            <span v-if="h.arch" class="host-tag">{{ h.arch }}</span>
            <span v-for="tag in h.tags" :key="tag" class="host-tag">{{ tag }}</span>
          </div>
        </div>

        <div class="host-metrics">
          <div class="metric" :class="`tone-${metricTone(h.metrics['cpu.usage']?.value)}`">
            <div class="metric-label">CPU</div>
            <div class="metric-value metric-num">
              {{ fmtPct(h.metrics["cpu.usage"]?.value) }}
            </div>
            <div class="metric-bar">
              <span :style="{ width: `${Math.min(100, h.metrics['cpu.usage']?.value ?? 0)}%` }"></span>
            </div>
          </div>
          <div class="metric" :class="`tone-${metricTone(h.metrics['mem.percent']?.value)}`">
            <div class="metric-label">MEM</div>
            <div class="metric-value metric-num">
              {{ fmtPct(h.metrics["mem.percent"]?.value) }}
            </div>
            <div class="metric-bar">
              <span :style="{ width: `${Math.min(100, h.metrics['mem.percent']?.value ?? 0)}%` }"></span>
            </div>
          </div>
        </div>

        <font-awesome-icon
          icon="fa-solid fa-chevron-right"
          class="host-chevron"
        />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
/* ── Header chrome (brand recipe) ─────────────────────────────────────── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  color: #f1f5f9;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(96, 165, 250, 0.22);
}
.section-header::before {
  content: ""; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.04) 1px, transparent 1px);
  background-size: 32px 32px; opacity: 0.6; pointer-events: none;
}
.section-header::after {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(700px circle at 0% 0%, rgba(59, 130, 246, 0.14), transparent 50%),
    radial-gradient(500px circle at 100% 100%, rgba(34, 211, 238, 0.08), transparent 50%);
  pointer-events: none;
}
.section-header > * { position: relative; z-index: 1; }

.header-left {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.header-right {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 575.98px) {
  .section-header { flex-wrap: wrap; row-gap: 0.55rem; }
  .header-right { width: 100%; justify-content: flex-start; }
}

.header-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--fs-body);
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.25);
}
.header-title {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: var(--fs-body);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f1f5f9;
}
.header-sub {
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--fs-micro);
  color: #9ca3af;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

/* ── Filter input (header right slot) ─────────────────────────────────── */
.header-filter {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.7rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 160ms ease, background 160ms ease;
}
.header-filter:focus-within {
  border-color: rgba(96, 165, 250, 0.55);
  background: rgba(96, 165, 250, 0.08);
}
.filter-icon {
  font-size: 0.72rem;
  color: #94a3b8;
}
.header-filter input {
  background: transparent;
  border: 0;
  outline: 0;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.78rem;
  color: #f1f5f9;
  width: 110px;
  letter-spacing: 0.04em;
}
.header-filter input::placeholder {
  color: #64748b;
}
@media (max-width: 575.98px) {
  .header-filter input { width: 80px; }
}

/* ── Empty state ──────────────────────────────────────────────────────── */
.empty {
  padding: 2.4rem 1.2rem;
  text-align: center;
  color: #6b7280;
}
.filter-empty { padding: 1.6rem 1.2rem; }
body[data-theme="dark"] .empty { color: #94a3b8; }
.empty-icon {
  font-size: 1.8rem;
  color: #94a3b8;
  opacity: 0.5;
  margin-bottom: 0.8rem;
}
body[data-theme="dark"] .empty-icon { color: #64748b; }
.empty-title {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  margin-bottom: 0.3rem;
}
body[data-theme="dark"] .empty-title { color: #f1f5f9; }
.empty-sub { font-size: 0.85rem; line-height: 1.55; }
.empty code {
  font-family: ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  color: #2563eb;
  font-size: 0.85em;
}
body[data-theme="dark"] .empty code { color: #67e8f9; }

/* ── Host rows ────────────────────────────────────────────────────────── */
.host-list { display: flex; flex-direction: column; }
.host-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 14px;
  align-items: center;
  gap: 1.2rem;
  padding: 0.85rem 1rem 0.85rem 1.1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  text-decoration: none;
  color: #111827;
  transition: background 160ms ease, transform 200ms ease;
}
body[data-theme="dark"] .host-row {
  color: #f1f5f9;
  border-bottom-color: rgba(148, 163, 184, 0.1);
}
.host-row:last-child { border-bottom: 0; }
.host-row:hover {
  background: rgba(96, 165, 250, 0.06);
}
body[data-theme="dark"] .host-row:hover {
  background: rgba(96, 165, 250, 0.08);
}

/* Colored left edge — at-a-glance health */
.status-edge {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: #34d399;
  opacity: 0.85;
}
.host-row.status-stale   .status-edge { background: #fbbf24; }
.host-row.status-offline .status-edge { background: #f87171; }

/* Meta column (name + tags) */
.host-meta { min-width: 0; }
.host-line {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.host-name {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.98rem;
  letter-spacing: 0.005em;
  color: #111827;
}
body[data-theme="dark"] .host-name { color: #f8fafc; }

.host-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.16rem 0.55rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #047857;
  text-transform: uppercase;
}
body[data-theme="dark"] .host-pill { color: #34d399; }
.host-pill.status-stale   { background: rgba(251, 191, 36, 0.1);  border-color: rgba(251, 191, 36, 0.32); color: #b45309; }
body[data-theme="dark"] .host-pill.status-stale   { color: #fbbf24; }
.host-pill.status-offline { background: rgba(244, 63, 94, 0.1);   border-color: rgba(244, 63, 94, 0.32);  color: #b91c1c; }
body[data-theme="dark"] .host-pill.status-offline { color: #f87171; }
.pill-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}
.host-pill.status-live .pill-dot {
  animation: live-pulse 1.4s ease-in-out infinite;
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .host-pill.status-live .pill-dot { animation: none; }
}

.host-seen {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  color: #6b7280;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
body[data-theme="dark"] .host-seen { color: #94a3b8; }

.host-tags {
  margin-top: 0.32rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.32rem;
}
.host-tag {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  letter-spacing: 0.06em;
  padding: 0.08rem 0.45rem;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
  border: 1px solid rgba(148, 163, 184, 0.18);
}
body[data-theme="dark"] .host-tag {
  background: rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.16);
}

/* Metrics column (CPU + mem) */
.host-metrics {
  display: grid;
  grid-template-columns: repeat(2, 92px);
  gap: 0.7rem;
  flex-shrink: 0;
}
@media (max-width: 575.98px) {
  .host-row { grid-template-columns: 1fr; gap: 0.6rem; }
  .host-metrics { grid-template-columns: repeat(2, 1fr); }
  .host-chevron { display: none; }
}
.metric {
  min-width: 0;
}
.metric-label {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: #94a3b8;
  font-weight: 600;
}
.metric-value {
  font-family: "Montserrat", "IBM Plex Mono", monospace;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.005em;
  color: #111827;
  line-height: 1.1;
  margin-top: 1px;
}
body[data-theme="dark"] .metric-value { color: #f1f5f9; }

.metric-bar {
  margin-top: 0.35rem;
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}
body[data-theme="dark"] .metric-bar { background: rgba(148, 163, 184, 0.14); }
.metric-bar > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #22d3ee);
  border-radius: inherit;
  transition: width 380ms cubic-bezier(.2,.8,.2,1);
}
.metric.tone-warn .metric-bar > span {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.metric.tone-warn .metric-value { color: #b45309; }
body[data-theme="dark"] .metric.tone-warn .metric-value { color: #fbbf24; }
.metric.tone-crit .metric-bar > span {
  background: linear-gradient(90deg, #f43f5e, #fb7185);
}
.metric.tone-crit .metric-value { color: #b91c1c; }
body[data-theme="dark"] .metric.tone-crit .metric-value { color: #f87171; }
.metric.tone-none .metric-value { color: #9ca3af; font-weight: 400; }
body[data-theme="dark"] .metric.tone-none .metric-value { color: #6b7280; }

.host-chevron {
  color: #9ca3af;
  font-size: 0.78rem;
  opacity: 0.5;
  transition: transform 200ms ease, opacity 200ms ease;
}
.host-row:hover .host-chevron {
  opacity: 1;
  transform: translateX(2px);
  color: #60a5fa;
}
</style>
