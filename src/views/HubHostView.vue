<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useHubStore } from "@/stores/hub";
import { useLoadingStore } from "@/stores/loading";
import HubMetricSpark from "@/components/hub/HubMetricSpark.vue";
import PageHeader from "@/components/PageHeader.vue";

const hub = useHubStore();
const route = useRoute();
const hostId = computed(() => Number(route.params.id));

const host = computed(() => hub.hosts.find((h) => h.id === hostId.value));
const status = computed(() => host.value?.status ?? "offline");

function relTime(unixS: number): string {
  const ageS = Math.max(0, Math.floor(Date.now() / 1000) - unixS);
  if (ageS < 60)    return `${ageS}s ago`;
  if (ageS < 3600)  return `${Math.floor(ageS / 60)}m ago`;
  if (ageS < 86400) return `${Math.floor(ageS / 3600)}h ago`;
  return `${Math.floor(ageS / 86400)}d ago`;
}

onMounted(async () => {
  useLoadingStore().toggle(true);
  if (hub.isConfigured && hub.token && !hub.ready) await hub.connect();
  if (hub.ready) hub.startPolling();
});
onUnmounted(() => { hub.stopPolling(); });
</script>

<template>
  <div class="container-fluid py-3">
    <div class="back-link">
      <RouterLink to="/hub" class="back">
        <font-awesome-icon icon="fa-solid fa-arrow-left" />
        <span>Fleet</span>
      </RouterLink>
    </div>

    <div v-if="!host" class="placeholder">
      <span class="eyebrow">Host not found</span>
      <p>Host id <code>{{ hostId }}</code> isn't in the hub's roster yet.</p>
    </div>

    <template v-else>
      <div class="hero">
        <div class="hero-left">
          <PageHeader :decor-title="`Host #${host.id}`" :title="host.name" />
          <div class="meta">
            <span v-if="host.os"            class="meta-tag">{{ host.os }}</span>
            <span v-if="host.arch"          class="meta-tag">{{ host.arch }}</span>
            <span v-if="host.agent_version" class="meta-tag">v{{ host.agent_version }}</span>
            <span v-for="t in host.tags" :key="t" class="meta-tag">{{ t }}</span>
          </div>
        </div>
        <div class="hero-right">
          <span class="big-pill" :class="`status-${status}`">
            <span class="pill-dot"></span>
            {{ status.toUpperCase() }}
          </span>
          <div class="last-seen">
            <span class="ls-label">last seen</span>
            <span class="ls-value">{{ relTime(host.last_seen) }}</span>
          </div>
        </div>
      </div>

      <!-- ─── Compute ─── -->
      <div class="group">
        <div class="group-eyebrow"><span class="dash"></span>COMPUTE</div>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="cpu.usage"
                tone="cyan" label="CPU usage" unit="%" :decimals="1"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="cpu.load_1m"
                tone="cyan" label="Load 1m" :decimals="2"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Memory ─── -->
      <div class="group">
        <div class="group-eyebrow"><span class="dash"></span>MEMORY</div>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="mem.percent"
                tone="purple" label="Memory used" unit="%" :decimals="1"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Network ─── -->
      <div class="group">
        <div class="group-eyebrow"><span class="dash"></span>NETWORK</div>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="net.rx_bytes_per_s"
                tone="emerald" label="Net rx" unit=" B/s" :decimals="0"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="net.tx_bytes_per_s"
                tone="emerald" label="Net tx" unit=" B/s" :decimals="0"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Disk ─── -->
      <div class="group">
        <div class="group-eyebrow"><span class="dash"></span>DISK</div>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="disk.io.read_bytes_per_s"
                tone="amber" label="Read throughput" unit=" B/s" :decimals="0"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="disk.io.write_bytes_per_s"
                tone="amber" label="Write throughput" unit=" B/s" :decimals="0"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="disk.percent" dim="/"
                tone="blue" label="Disk usage /" unit="%" :decimals="1"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Back / breadcrumb ────────────────────────────────────────────────── */
.back-link { margin-bottom: 0.6rem; }
.back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #6b7280;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color 160ms ease;
}
body[data-theme="dark"] .back { color: #94a3b8; }
.back:hover { color: #22d3ee; }

/* ── Hero (host header) ──────────────────────────────────────────────── */
.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.2rem;
  flex-wrap: wrap;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  margin-bottom: 1.6rem;
}
.hero-left { min-width: 0; }
.hero-right {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-shrink: 0;
}

.meta {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.meta-tag {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  padding: 0.16rem 0.55rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
  border: 1px solid rgba(148, 163, 184, 0.18);
}
body[data-theme="dark"] .meta-tag {
  background: rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.16);
}

.big-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.32);
  color: #047857;
}
body[data-theme="dark"] .big-pill { color: #34d399; }
.big-pill.status-stale {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.32);
  color: #b45309;
}
body[data-theme="dark"] .big-pill.status-stale { color: #fbbf24; }
.big-pill.status-offline {
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.32);
  color: #b91c1c;
}
body[data-theme="dark"] .big-pill.status-offline { color: #f87171; }
.pill-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}
.big-pill.status-live .pill-dot {
  animation: live-pulse 1.4s ease-in-out infinite;
}
@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .big-pill.status-live .pill-dot { animation: none; }
}

.last-seen {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.05rem;
}
.ls-label {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #94a3b8;
}
.ls-value {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.84rem;
  color: #475569;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
body[data-theme="dark"] .ls-value { color: #cbd5e1; }

/* ── Section groups ─────────────────────────────────────────────────── */
.group {
  margin-bottom: 1.6rem;
}
.group:last-child { margin-bottom: 0; }
.group-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: #6b7280;
  margin-bottom: 0.6rem;
}
body[data-theme="dark"] .group-eyebrow { color: #94a3b8; }
.group-eyebrow .dash {
  width: 22px; height: 1px;
  background: rgba(96, 165, 250, 0.4);
}

/* ── Metric cards ───────────────────────────────────────────────────── */
.metric-card {
  flex: 1 1 auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 24px -8px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  overflow: hidden;
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
}
body[data-theme="dark"] .metric-card {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.14);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(96, 165, 250, 0.05);
}
.metric-card:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 165, 250, 0.32);
}

/* ── Placeholder ─────────────────────────────────────────────────────── */
.placeholder {
  margin-top: 1.5rem;
  padding: 1.5rem 1.4rem;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.28);
  max-width: 600px;
}
.placeholder .eyebrow {
  color: #b45309;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
body[data-theme="dark"] .placeholder .eyebrow { color: #fbbf24; }
.placeholder p {
  margin: 0.6rem 0 0;
  color: #475569;
  font-size: 0.92rem;
}
body[data-theme="dark"] .placeholder p { color: #cbd5e1; }
.placeholder code {
  font-family: ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  color: #2563eb;
}
body[data-theme="dark"] .placeholder code { color: #67e8f9; }
</style>
