<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useHubStore } from "@/stores/hub";
import { useLoadingStore } from "@/stores/loading";
import HostList from "@/components/hub/HostList.vue";
import AlertList from "@/components/hub/AlertList.vue";
import FleetSummary from "@/components/hub/FleetSummary.vue";
import HubTokenSetup from "@/components/hub/HubTokenSetup.vue";
import PageHeader from "@/components/PageHeader.vue";

const hub = useHubStore();

onMounted(async () => {
  useLoadingStore().toggle(true);
  if (hub.isConfigured && hub.token && !hub.ready) {
    await hub.connect();
  }
  if (hub.ready) hub.startPolling();
});
onUnmounted(() => { hub.stopPolling(); });
</script>

<template>
  <div class="container-fluid py-3">
    <PageHeader
      decor-title="Vigil Pro Hub"
      title="Fleet overview"
    />

    <div v-if="!hub.isConfigured" class="not-configured">
      <span class="eyebrow">Hub mode disabled</span>
      <p>
        This build wasn't configured with a Hub URL. Set
        <code>VITE_HUB_URL</code> in <code>.env</code> and rebuild to enable
        the multi-host views.
      </p>
    </div>

    <div v-else-if="!hub.ready" class="setup-wrap">
      <HubTokenSetup />
    </div>

    <template v-else>
      <FleetSummary />

      <div class="row g-3">
        <div class="col-12 col-lg-7 d-flex">
          <HostList class="flex-fill" />
        </div>
        <div class="col-12 col-lg-5 d-flex">
          <AlertList class="flex-fill" />
        </div>
      </div>
    </template>

    <div v-if="hub.ready && hub.error" class="hub-error">
      {{ hub.error }}
    </div>
  </div>
</template>

<style scoped>
.setup-wrap {
  margin-top: 1.5rem;
  max-width: 640px;
}
.not-configured {
  margin-top: 1.5rem;
  padding: 1.5rem 1.4rem;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.28);
  max-width: 720px;
}
.not-configured .eyebrow {
  color: #fbbf24;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.not-configured p {
  margin: 0.6rem 0 0;
  color: var(--bs-secondary, #6b7280);
  font-size: 0.92rem;
}
.not-configured code {
  font-family: ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  color: #2563eb;
}

.hub-error {
  margin-top: 1.2rem;
  padding: 0.65rem 0.9rem;
  border-radius: 6px;
  background: rgba(244, 63, 94, 0.08);
  border-left: 3px solid #f43f5e;
  color: var(--bs-secondary, #6b7280);
  font-family: ui-monospace, monospace;
  font-size: 0.82rem;
}

/* Force the cards in each row to fill the column for matched height. */
.row > .col-12 { display: flex; }
</style>
