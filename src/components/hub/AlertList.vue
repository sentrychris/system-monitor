<script setup lang="ts">
import { computed } from "vue";
import { useHubStore } from "@/stores/hub";

const hub = useHubStore();

const sortedFiring = computed(() =>
  [...hub.firingAlerts].sort(
    (a, b) => (b.fired_at ?? 0) - (a.fired_at ?? 0),
  ),
);

const sortedBreaching = computed(() =>
  [...hub.breachingAlerts].sort(
    (a, b) => (b.breach_started_at ?? 0) - (a.breach_started_at ?? 0),
  ),
);

const recentEvents = computed(() => hub.alertEvents.slice(0, 8));

function relTime(unixS: number): string {
  const ageS = Math.max(0, Math.floor(Date.now() / 1000) - unixS);
  if (ageS < 60)    return `${ageS}s ago`;
  if (ageS < 3600)  return `${Math.floor(ageS / 60)}m ago`;
  if (ageS < 86400) return `${Math.floor(ageS / 3600)}h ago`;
  return `${Math.floor(ageS / 86400)}d ago`;
}
</script>

<template>
  <div class="card panel-card border-0 shadow-lg flex-fill">
    <div class="section-header">
      <div class="d-flex align-items-center gap-3">
        <div class="header-icon" :class="{ 'is-firing': sortedFiring.length }">
          <font-awesome-icon icon="fa-solid fa-bell" />
        </div>
        <div>
          <div class="header-title">Alerts</div>
          <div class="header-sub">
            <template v-if="sortedFiring.length">
              {{ sortedFiring.length }} FIRING
            </template>
            <template v-else-if="sortedBreaching.length">
              {{ sortedBreaching.length }} BREACHING
            </template>
            <template v-else>ALL CLEAR</template>
          </div>
        </div>
      </div>
    </div>

    <div class="alert-body">
      <!-- Active alerts ────────────────────────────────────────── -->
      <div v-if="sortedFiring.length" class="alert-group group-firing">
        <div class="alert-group-eyebrow firing">
          <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
          FIRING <span class="count">{{ sortedFiring.length }}</span>
        </div>
        <div
          v-for="a in sortedFiring"
          :key="`f-${a.rule_id}-${a.host_id}`"
          class="alert-row firing"
        >
          <span class="alert-dot"></span>
          <div class="alert-meta">
            <div class="alert-name">{{ a.rule_name }}</div>
            <div class="alert-sub">
              <code class="host-code">{{ a.host_name }}</code>
              <span class="alert-cond">
                <span class="cond-value">{{ a.last_value?.toFixed(2) ?? "—" }}</span>
                <span class="cond-op">{{ a.op }}</span>
                <span class="cond-threshold">{{ a.threshold }}</span>
              </span>
            </div>
          </div>
          <div v-if="a.fired_at" class="alert-when">
            <span class="when-label">fired</span>
            <span class="when-value">{{ relTime(a.fired_at) }}</span>
          </div>
        </div>
      </div>

      <div v-if="sortedBreaching.length" class="alert-group">
        <div class="alert-group-eyebrow breaching">
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
          BREACHING <span class="count">{{ sortedBreaching.length }}</span>
        </div>
        <div
          v-for="a in sortedBreaching"
          :key="`b-${a.rule_id}-${a.host_id}`"
          class="alert-row breaching"
        >
          <span class="alert-dot"></span>
          <div class="alert-meta">
            <div class="alert-name">{{ a.rule_name }}</div>
            <div class="alert-sub">
              <code class="host-code">{{ a.host_name }}</code>
              <span class="alert-cond">
                <span class="cond-value">{{ a.last_value?.toFixed(2) ?? "—" }}</span>
                <span class="cond-op">{{ a.op }}</span>
                <span class="cond-threshold">{{ a.threshold }}</span>
              </span>
            </div>
          </div>
          <div v-if="a.breach_started_at" class="alert-when">
            <span class="when-label">since</span>
            <span class="when-value">{{ relTime(a.breach_started_at) }}</span>
          </div>
        </div>
      </div>

      <!-- All-clear empty state ───────────────────────────────── -->
      <div v-if="!sortedFiring.length && !sortedBreaching.length" class="alert-empty">
        <div class="empty-disc">
          <font-awesome-icon icon="fa-solid fa-circle-check" />
        </div>
        <div class="empty-title">Everything's quiet</div>
        <div class="empty-sub">No active alerts across the fleet.</div>
      </div>

      <!-- Recent history ──────────────────────────────────────── -->
      <div v-if="recentEvents.length" class="alert-group history">
        <div class="alert-group-eyebrow history">
          <font-awesome-icon icon="fa-solid fa-clock-rotate-left" />
          RECENT
        </div>
        <div
          v-for="e in recentEvents"
          :key="e.id"
          class="event-row"
          :class="`event-${e.event}`"
        >
          <span class="event-icon">
            <font-awesome-icon
              :icon="e.event === 'fired'
                ? 'fa-solid fa-circle-exclamation'
                : 'fa-solid fa-circle-check'"
            />
          </span>
          <span class="event-host">{{ e.host_name }}</span>
          <span class="event-rule">{{ e.rule_name }}</span>
          <span class="event-when">{{ relTime(e.ts) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Header chrome ────────────────────────────────────────────────────── */
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

.header-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--fs-body);
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
  transition: background 200ms ease, color 200ms ease, box-shadow 200ms ease;
}
.header-icon.is-firing {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.25);
  animation: bell-pulse 1.4s ease-in-out infinite;
}
@keyframes bell-pulse {
  0%, 100% { box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.25); }
  50%      { box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.5),
                         0 0 0 4px rgba(239, 68, 68, 0.12); }
}
@media (prefers-reduced-motion: reduce) {
  .header-icon.is-firing { animation: none; }
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
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: var(--fs-micro);
  color: #9ca3af;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

/* ── Body ─────────────────────────────────────────────────────────────── */
.alert-body {
  display: flex;
  flex-direction: column;
}
.alert-group { padding: 0.85rem 1rem 0.7rem; }
.alert-group + .alert-group {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.alert-group-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  margin-bottom: 0.6rem;
}
.alert-group-eyebrow .count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  padding: 0 0.35rem;
  border-radius: 999px;
  font-size: 0.58rem;
  letter-spacing: 0.04em;
  background: currentColor;
  color: #fff !important;
}
.alert-group-eyebrow.firing    { color: #b91c1c; }
body[data-theme="dark"] .alert-group-eyebrow.firing    { color: #f87171; }
.alert-group-eyebrow.breaching { color: #b45309; }
body[data-theme="dark"] .alert-group-eyebrow.breaching { color: #fbbf24; }
.alert-group-eyebrow.history   { color: #6b7280; }
body[data-theme="dark"] .alert-group-eyebrow.history   { color: #94a3b8; }

/* Firing group — accent the whole block */
.group-firing {
  background:
    radial-gradient(180px circle at 0% 50%, rgba(244, 63, 94, 0.06), transparent 70%);
}

/* Alert rows */
.alert-row {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  padding: 0.5rem 0.2rem;
  border-radius: 6px;
}
.alert-row + .alert-row {
  border-top: 1px dashed rgba(148, 163, 184, 0.12);
}

.alert-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 10px currentColor;
}
.alert-row.firing    .alert-dot {
  background: #f87171; color: #f87171;
  animation: live-pulse 1.4s ease-in-out infinite;
}
.alert-row.breaching .alert-dot { background: #fbbf24; color: #fbbf24; }
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .alert-row.firing .alert-dot { animation: none; }
}

.alert-meta { min-width: 0; }
.alert-name {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.92rem;
  color: #111827;
  letter-spacing: 0.005em;
}
body[data-theme="dark"] .alert-name { color: #f8fafc; }

.alert-sub {
  margin-top: 0.25rem;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.55rem;
  font-size: 0.78rem;
}

.host-code {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 4px;
  padding: 0.05rem 0.45rem;
  color: #2563eb;
}
body[data-theme="dark"] .host-code {
  background: rgba(34, 211, 238, 0.08);
  border-color: rgba(34, 211, 238, 0.22);
  color: #67e8f9;
}

.alert-cond {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-size: 0.78rem;
  display: inline-flex;
  gap: 0.35rem;
  align-items: baseline;
}
.cond-value {
  color: #111827; font-weight: 600;
}
body[data-theme="dark"] .cond-value { color: #f8fafc; }
.cond-op { color: #f87171; padding: 0 0.05rem; font-weight: 700; }
.cond-threshold { color: #6b7280; }
body[data-theme="dark"] .cond-threshold { color: #94a3b8; }

.alert-when {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.05rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  flex-shrink: 0;
}
.when-label {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #94a3b8;
}
.when-value {
  color: #475569;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
body[data-theme="dark"] .when-value { color: #cbd5e1; }

/* ── Empty / all-clear ────────────────────────────────────────────────── */
.alert-empty {
  padding: 2rem 1rem 2.2rem;
  text-align: center;
}
.empty-disc {
  width: 56px; height: 56px;
  margin: 0 auto 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.12);
  color: #10b981;
  font-size: 1.5rem;
  box-shadow:
    inset 0 0 0 1px rgba(52, 211, 153, 0.22),
    0 0 32px -10px rgba(52, 211, 153, 0.4);
}
body[data-theme="dark"] .empty-disc { color: #34d399; }
.empty-title {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  margin-bottom: 0.3rem;
}
body[data-theme="dark"] .empty-title { color: #f8fafc; }
.empty-sub {
  font-size: 0.85rem;
  color: #6b7280;
}
body[data-theme="dark"] .empty-sub { color: #94a3b8; }

/* ── Recent history ───────────────────────────────────────────────────── */
.event-row {
  display: grid;
  grid-template-columns: 14px auto minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 0.55rem;
  padding: 0.4rem 0.2rem;
  font-size: 0.82rem;
}
.event-row + .event-row {
  border-top: 1px dashed rgba(148, 163, 184, 0.08);
}
.event-icon { font-size: 0.72rem; flex-shrink: 0; line-height: 1; }
.event-row.event-fired .event-icon    { color: #f87171; }
.event-row.event-resolved .event-icon { color: #34d399; }

.event-host {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  color: #2563eb;
}
body[data-theme="dark"] .event-host {
  background: rgba(34, 211, 238, 0.06);
  border-color: rgba(34, 211, 238, 0.18);
  color: #67e8f9;
}

.event-rule {
  color: #475569;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
body[data-theme="dark"] .event-rule { color: #cbd5e1; }

.event-when {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  color: #94a3b8;
  font-size: 0.7rem;
  flex-shrink: 0;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
body[data-theme="dark"] .event-when { color: #94a3b8; }
</style>
