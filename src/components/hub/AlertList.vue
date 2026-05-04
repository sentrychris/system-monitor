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
  const ageS = Math.floor(Date.now() / 1000) - unixS;
  if (ageS < 60)    return `${ageS}s ago`;
  if (ageS < 3600)  return `${Math.floor(ageS / 60)}m ago`;
  if (ageS < 86400) return `${Math.floor(ageS / 3600)}h ago`;
  return `${Math.floor(ageS / 86400)}d ago`;
}
</script>

<template>
  <div class="card panel-card border-0 shadow-lg">
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
      <!-- Firing first — biggest signal -->
      <div v-if="sortedFiring.length" class="alert-group">
        <div class="alert-group-eyebrow firing">FIRING</div>
        <div
          v-for="a in sortedFiring"
          :key="`f-${a.rule_id}-${a.host_id}`"
          class="alert-row firing"
        >
          <span class="alert-dot"></span>
          <div class="alert-meta">
            <div class="alert-name">{{ a.rule_name }}</div>
            <div class="alert-sub">
              <code>{{ a.host_name }}</code>
              <span class="alert-cond">
                {{ a.last_value?.toFixed(2) ?? "—" }}
                <span class="op">{{ a.op }}</span>
                {{ a.threshold }}
              </span>
            </div>
          </div>
          <div class="alert-when">
            <span v-if="a.fired_at">fired {{ relTime(a.fired_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Breaching but not yet fired -->
      <div v-if="sortedBreaching.length" class="alert-group">
        <div class="alert-group-eyebrow breaching">BREACHING</div>
        <div
          v-for="a in sortedBreaching"
          :key="`b-${a.rule_id}-${a.host_id}`"
          class="alert-row breaching"
        >
          <span class="alert-dot"></span>
          <div class="alert-meta">
            <div class="alert-name">{{ a.rule_name }}</div>
            <div class="alert-sub">
              <code>{{ a.host_name }}</code>
              <span class="alert-cond">
                {{ a.last_value?.toFixed(2) ?? "—" }}
                <span class="op">{{ a.op }}</span>
                {{ a.threshold }}
              </span>
            </div>
          </div>
          <div class="alert-when">
            <span v-if="a.breach_started_at">since {{ relTime(a.breach_started_at) }}</span>
          </div>
        </div>
      </div>

      <div v-if="!sortedFiring.length && !sortedBreaching.length" class="alert-empty">
        Everything's quiet.
      </div>

      <!-- Recent history -->
      <div v-if="recentEvents.length" class="alert-group history">
        <div class="alert-group-eyebrow history">RECENT</div>
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
          <span class="event-text">
            <code>{{ e.host_name }}</code>
            <span class="event-rule">{{ e.rule_name }}</span>
          </span>
          <span class="event-when">{{ relTime(e.ts) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}
.header-sub {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--fs-micro);
  color: #9ca3af;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.alert-body { padding: 0.5rem 0 0.5rem; }
.alert-group { padding: 0.6rem 1rem 0.5rem; }
.alert-group + .alert-group { border-top: 1px solid rgba(148, 163, 184, 0.1); }

.alert-group-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  margin-bottom: 0.5rem;
}
.alert-group-eyebrow.firing    { color: #f87171; }
.alert-group-eyebrow.breaching { color: #fbbf24; }
.alert-group-eyebrow.history   { color: #6b7280; }

.alert-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.5rem 0.2rem;
  border-radius: 6px;
}
.alert-row + .alert-row { border-top: 1px dashed rgba(148, 163, 184, 0.12); }

.alert-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 10px currentColor;
}
.alert-row.firing    .alert-dot { background: #f87171; color: #f87171; animation: live-pulse 1.4s ease-in-out infinite; }
.alert-row.breaching .alert-dot { background: #fbbf24; color: #fbbf24; }
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .alert-row.firing .alert-dot { animation: none; }
}

.alert-meta { min-width: 0; flex: 1; }
.alert-name {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
}
.alert-sub {
  margin-top: 0.2rem;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.78rem;
  color: var(--bs-secondary, #6b7280);
}
.alert-sub code {
  font-family: ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  color: #2563eb;
}
body[data-theme="dark"] .alert-sub code { color: #67e8f9; }

.alert-cond {
  font-family: ui-monospace, monospace;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
.alert-cond .op { color: #f87171; padding: 0 0.15rem; }

.alert-when {
  font-family: ui-monospace, monospace;
  font-size: 0.7rem;
  color: var(--bs-secondary, #6b7280);
  flex-shrink: 0;
}
.alert-empty {
  padding: 1.4rem 1rem;
  font-size: 0.88rem;
  color: var(--bs-secondary, #6b7280);
  text-align: center;
}

.event-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.2rem;
  font-size: 0.82rem;
}
.event-row + .event-row { border-top: 1px dashed rgba(148, 163, 184, 0.08); }
.event-icon { font-size: 0.7rem; flex-shrink: 0; }
.event-row.event-fired .event-icon    { color: #f87171; }
.event-row.event-resolved .event-icon { color: #34d399; }

.event-text {
  flex: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}
.event-text code {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  color: inherit;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
  padding: 0.05rem 0.35rem;
}
.event-rule {
  color: var(--bs-secondary, #6b7280);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-when {
  font-family: ui-monospace, monospace;
  color: var(--bs-secondary, #6b7280);
  font-size: 0.72rem;
  flex-shrink: 0;
}
</style>
