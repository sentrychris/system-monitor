<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useHubStore } from "@/stores/hub";
import HubMetricSpark from "@/components/hub/HubMetricSpark.vue";
import HostStatusPill from "@/components/hub/HostStatusPill.vue";
import PageHeader from "@/components/PageHeader.vue";

const hub = useHubStore();
const route = useRoute();
const hostId = computed(() => Number(route.params.id));

const host = computed(() =>
  hub.hosts.find((h) => h.id === hostId.value),
);
const status = computed(() => host.value ? hub.hostStatus(host.value) : "offline");

const dimsByMount = computed<string[]>(() => {
  // We don't expose dimensions yet — the few we know about live in the
  // protocol contract. Show /, /var, /home if the metric exists.
  // For v0 this is hard-coded to "/", which every Linux box has.
  return ["/"];
});

onMounted(async () => {
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
      <div class="header-row">
        <PageHeader
          :decor-title="`Host #${host.id}`"
          :title="host.name"
        />
        <HostStatusPill :status="status" />
      </div>

      <div class="meta">
        <span v-if="host.os"            class="meta-tag">{{ host.os }}</span>
        <span v-if="host.arch"          class="meta-tag">{{ host.arch }}</span>
        <span v-if="host.agent_version" class="meta-tag">v{{ host.agent_version }}</span>
        <span v-for="t in host.tags" :key="t" class="meta-tag">{{ t }}</span>
      </div>

      <div class="row g-3 mt-1">
        <div class="col-12 col-md-6 col-xl-4 d-flex">
          <div class="card panel-card border-0 shadow-lg flex-fill">
            <HubMetricSpark
              :host-id="host.id" metric="cpu.usage"
              tone="cyan" label="CPU usage" unit="%" :decimals="1"
            />
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-4 d-flex">
          <div class="card panel-card border-0 shadow-lg flex-fill">
            <HubMetricSpark
              :host-id="host.id" metric="mem.percent"
              tone="purple" label="Memory" unit="%" :decimals="1"
            />
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-4 d-flex">
          <div class="card panel-card border-0 shadow-lg flex-fill">
            <HubMetricSpark
              :host-id="host.id" metric="net.rx_bytes_per_s"
              tone="emerald" label="Net rx" unit=" B/s" :decimals="0"
            />
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-4 d-flex">
          <div class="card panel-card border-0 shadow-lg flex-fill">
            <HubMetricSpark
              :host-id="host.id" metric="net.tx_bytes_per_s"
              tone="emerald" label="Net tx" unit=" B/s" :decimals="0"
            />
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-4 d-flex">
          <div class="card panel-card border-0 shadow-lg flex-fill">
            <HubMetricSpark
              :host-id="host.id" metric="disk.io.read_bytes_per_s"
              tone="amber" label="Disk read" unit=" B/s" :decimals="0"
            />
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-4 d-flex">
          <div class="card panel-card border-0 shadow-lg flex-fill">
            <HubMetricSpark
              :host-id="host.id" metric="disk.io.write_bytes_per_s"
              tone="amber" label="Disk write" unit=" B/s" :decimals="0"
            />
          </div>
        </div>
        <div
          v-for="mount in dimsByMount"
          :key="mount"
          class="col-12 col-md-6 col-xl-4 d-flex"
        >
          <div class="card panel-card border-0 shadow-lg flex-fill">
            <HubMetricSpark
              :host-id="host.id" metric="disk.percent" :dim="mount"
              tone="blue" :label="`Disk ${mount}`" unit="%" :decimals="1"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.back-link { margin-bottom: 0.6rem; }
.back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--bs-secondary, #6b7280);
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
}
.back:hover { color: #22d3ee; }

.header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta {
  margin-top: 0.4rem;
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}
.meta-tag {
  display: inline-flex;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(96, 165, 250, 0.2);
  color: var(--bs-secondary, #6b7280);
}

.placeholder {
  margin-top: 1.5rem;
  padding: 1.5rem 1.4rem;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.28);
  max-width: 600px;
}
.placeholder .eyebrow {
  color: #fbbf24;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.placeholder p {
  margin: 0.6rem 0 0;
  color: var(--bs-secondary, #6b7280);
  font-size: 0.92rem;
}
.placeholder code {
  font-family: ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  color: #2563eb;
}
</style>
