<script setup lang="ts">
/**
 * Fleet summary hero — four stat tiles that sit above the host list
 * on the /hub view. Drives off the same hub store the host list does;
 * no extra polling.
 */
import { computed } from "vue";
import { useHubStore } from "@/stores/hub";

const hub = useHubStore();

const counts = computed(() => hub.hostCounts);
const avg    = computed(() => hub.fleetAvg);
const peak   = computed(() => hub.fleetPeak);

const firing    = computed(() => hub.firingAlerts.length);
const breaching = computed(() => hub.breachingAlerts.length);

function pct(v: number | null): string {
  return v === null ? "—" : `${v.toFixed(0)}%`;
}

/** Width of each segment in the stacked bar — sums to 100 unless empty. */
const bar = computed(() => {
  const t = counts.value.total || 1;
  return {
    live:    (counts.value.live    / t) * 100,
    stale:   (counts.value.stale   / t) * 100,
    offline: (counts.value.offline / t) * 100,
  };
});

function tone(v: number | null): "ok" | "warn" | "crit" | "none" {
  if (v === null) return "none";
  if (v >= 90) return "crit";
  if (v >= 75) return "warn";
  return "ok";
}
</script>

<template>
  <div class="fleet-summary">
    <!-- ─── Hosts ─── -->
    <div class="tile tone-cyan">
      <div class="tile-eyebrow">
        <span class="dash"></span> HOSTS
      </div>
      <div class="tile-value metric-num">
        {{ counts.total }}
        <span v-if="counts.total" class="tile-suffix">total</span>
      </div>
      <div class="health-bar" :title="`${counts.live} live · ${counts.stale} stale · ${counts.offline} offline`">
        <span class="seg seg-live"    :style="{ width: bar.live    + '%' }"></span>
        <span class="seg seg-stale"   :style="{ width: bar.stale   + '%' }"></span>
        <span class="seg seg-offline" :style="{ width: bar.offline + '%' }"></span>
      </div>
      <div class="tile-sub">
        <span v-if="counts.live"    class="sub-pip pip-live">{{ counts.live }} live</span>
        <span v-if="counts.stale"   class="sub-pip pip-stale">{{ counts.stale }} stale</span>
        <span v-if="counts.offline" class="sub-pip pip-offline">{{ counts.offline }} off</span>
        <span v-if="!counts.total"  class="sub-pip pip-none">—</span>
      </div>
    </div>

    <!-- ─── Alerts ─── -->
    <div class="tile" :class="firing ? 'tone-rose' : 'tone-emerald'">
      <div class="tile-eyebrow">
        <span class="dash"></span> ALERTS
      </div>
      <div v-if="firing" class="tile-value metric-num">
        <span class="alarm-dot"></span>
        {{ firing }}
        <span class="tile-suffix">firing</span>
      </div>
      <div v-else class="tile-value metric-num clear">
        <font-awesome-icon icon="fa-solid fa-circle-check" class="clear-icon" />
        Clear
      </div>
      <div class="tile-sub">
        <span v-if="breaching" class="sub-pip pip-breaching">{{ breaching }} breaching</span>
        <span v-else-if="firing"    class="sub-pip pip-mute">no breach</span>
        <span v-else                class="sub-pip pip-mute">no breach</span>
      </div>
    </div>

    <!-- ─── Avg CPU ─── -->
    <div class="tile" :class="`tone-${tone(avg.cpu)}-c`">
      <div class="tile-eyebrow">
        <span class="dash"></span> AVG CPU
      </div>
      <div class="tile-value metric-num">
        {{ pct(avg.cpu) }}
      </div>
      <div class="tile-sub">
        <span v-if="peak.cpu" class="sub-pip pip-peak">
          peak <b class="metric-num">{{ peak.cpu.value.toFixed(0) }}%</b> on
          <code>{{ peak.cpu.name }}</code>
        </span>
        <span v-else class="sub-pip pip-mute">no live data</span>
      </div>
    </div>

    <!-- ─── Avg Mem ─── -->
    <div class="tile" :class="`tone-${tone(avg.mem)}-m`">
      <div class="tile-eyebrow">
        <span class="dash"></span> AVG MEM
      </div>
      <div class="tile-value metric-num">
        {{ pct(avg.mem) }}
      </div>
      <div class="tile-sub">
        <span v-if="peak.mem" class="sub-pip pip-peak">
          peak <b class="metric-num">{{ peak.mem.value.toFixed(0) }}%</b> on
          <code>{{ peak.mem.name }}</code>
        </span>
        <span v-else class="sub-pip pip-mute">no live data</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fleet-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.2rem;
}

/* ── Tile shell ───────────────────────────────────────────────────────── */
.tile {
  position: relative;
  padding: 0.95rem 1.1rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 22px -10px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  overflow: hidden;
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
}
body[data-theme="dark"] .tile {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.14);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(96, 165, 250, 0.05);
}
.tile:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 165, 250, 0.32);
}

/* Tone accent — top edge stripe */
.tile::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--tone-edge, linear-gradient(90deg, #60a5fa, #22d3ee));
  opacity: 0.85;
}
.tile.tone-cyan      { --tone-edge: linear-gradient(90deg, #60a5fa, #22d3ee); }
.tile.tone-emerald   { --tone-edge: linear-gradient(90deg, #10b981, #34d399); }
.tile.tone-rose      { --tone-edge: linear-gradient(90deg, #f43f5e, #fb7185); }
.tile.tone-ok-c      { --tone-edge: linear-gradient(90deg, #60a5fa, #22d3ee); }
.tile.tone-warn-c    { --tone-edge: linear-gradient(90deg, #f59e0b, #fbbf24); }
.tile.tone-crit-c    { --tone-edge: linear-gradient(90deg, #f43f5e, #fb7185); }
.tile.tone-none-c    { --tone-edge: linear-gradient(90deg, #94a3b8, #cbd5e1); }
.tile.tone-ok-m      { --tone-edge: linear-gradient(90deg, #a78bfa, #c4b5fd); }
.tile.tone-warn-m    { --tone-edge: linear-gradient(90deg, #f59e0b, #fbbf24); }
.tile.tone-crit-m    { --tone-edge: linear-gradient(90deg, #f43f5e, #fb7185); }
.tile.tone-none-m    { --tone-edge: linear-gradient(90deg, #94a3b8, #cbd5e1); }

/* ── Eyebrow ──────────────────────────────────────────────────────────── */
.tile-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: #6b7280;
}
body[data-theme="dark"] .tile-eyebrow { color: #94a3b8; }
.tile-eyebrow .dash {
  width: 16px; height: 1px;
  background: rgba(96, 165, 250, 0.4);
}

/* ── Headline value ───────────────────────────────────────────────────── */
.tile-value {
  margin-top: 0.55rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-family: "Montserrat", "IBM Plex Mono", monospace;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-size: 2rem;
  font-weight: 300;
  line-height: 1;
  color: #111827;
  letter-spacing: -0.01em;
}
body[data-theme="dark"] .tile-value { color: #f8fafc; }
.tile-suffix {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #94a3b8;
}
.tile-value.clear {
  font-size: 1.5rem;
  color: #047857;
  font-weight: 400;
}
body[data-theme="dark"] .tile-value.clear { color: #34d399; }
.clear-icon { font-size: 1.4rem; }

/* Alarm dot — sits next to firing count */
.alarm-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #f43f5e;
  box-shadow: 0 0 14px #f43f5e;
  animation: alarm-pulse 1.4s ease-in-out infinite;
  margin-right: 0.05rem;
  align-self: center;
}
@keyframes alarm-pulse {
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.9); }
}
@media (prefers-reduced-motion: reduce) {
  .alarm-dot { animation: none; }
}

/* ── Health bar (HOSTS tile) ──────────────────────────────────────────── */
.health-bar {
  margin-top: 0.7rem;
  height: 5px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
  display: flex;
}
body[data-theme="dark"] .health-bar { background: rgba(148, 163, 184, 0.12); }
.seg {
  display: block;
  height: 100%;
  transition: width 380ms cubic-bezier(.2,.8,.2,1);
}
.seg-live    { background: linear-gradient(90deg, #10b981, #34d399); }
.seg-stale   { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.seg-offline { background: linear-gradient(90deg, #f43f5e, #fb7185); }

/* ── Subtitle row ─────────────────────────────────────────────────────── */
.tile-sub {
  margin-top: 0.55rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.74rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  letter-spacing: 0.04em;
  min-height: 1.1rem;
}
.sub-pip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0.06rem 0.45rem;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.1);
  color: #6b7280;
  border: 1px solid rgba(148, 163, 184, 0.16);
}
body[data-theme="dark"] .sub-pip { color: #94a3b8; background: rgba(148,163,184,0.06); }

.pip-live      { color: #047857; background: rgba(52, 211, 153, 0.1);  border-color: rgba(52, 211, 153, 0.22); }
body[data-theme="dark"] .pip-live      { color: #34d399; }
.pip-stale     { color: #b45309; background: rgba(251, 191, 36, 0.1);  border-color: rgba(251, 191, 36, 0.22); }
body[data-theme="dark"] .pip-stale     { color: #fbbf24; }
.pip-offline   { color: #b91c1c; background: rgba(244, 63, 94, 0.1);   border-color: rgba(244, 63, 94, 0.22); }
body[data-theme="dark"] .pip-offline   { color: #f87171; }
.pip-breaching { color: #b45309; background: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.22); }
body[data-theme="dark"] .pip-breaching { color: #fbbf24; }
.pip-mute      { color: #94a3b8; background: rgba(148, 163, 184, 0.06); border-color: transparent; }

.pip-peak code {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.18);
  color: #2563eb;
  padding: 0.02rem 0.32rem;
  border-radius: 3px;
  margin-left: 0.15rem;
}
body[data-theme="dark"] .pip-peak code { color: #67e8f9; background: rgba(34, 211, 238, 0.06); }
.pip-peak b {
  color: #111827;
  font-weight: 600;
}
body[data-theme="dark"] .pip-peak b { color: #f8fafc; }
</style>
