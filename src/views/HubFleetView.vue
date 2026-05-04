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
  <!-- Pre-auth: center the token form, no "Fleet overview" header (the
       fleet doesn't exist yet from the user's perspective). -->
  <div v-if="hub.isConfigured && !hub.ready" class="setup-stage">
    <div class="setup-wrap">
      <HubTokenSetup />
    </div>
  </div>

  <!-- Hub URL not built into this bundle — config error, also centred. -->
  <div v-else-if="!hub.isConfigured" class="setup-stage">
    <div class="not-configured">
      <span class="eyebrow">Hub mode disabled</span>
      <p>
        This build wasn't configured with a Hub URL. Set
        <code>VITE_HUB_URL</code> in <code>.env</code> and rebuild to enable
        the multi-host views.
      </p>
    </div>
  </div>

  <!-- Authenticated: full fleet dashboard. -->
  <div v-else class="container-fluid py-3">
    <PageHeader
      decor-title="Vigil Pro Hub"
      title="Fleet overview"
    />

    <FleetSummary />

    <div class="row g-3">
      <div class="col-12 col-lg-7 d-flex">
        <HostList class="flex-fill" />
      </div>
      <div class="col-12 col-lg-5 d-flex">
        <AlertList class="flex-fill" />
      </div>
    </div>

    <div v-if="hub.error" class="hub-error">
      {{ hub.error }}
    </div>
  </div>
</template>

<style scoped>
/* Pre-auth stage — fills the available viewport height between navbar
   and footer so the form sits visually centred. The wrapper uses flex
   centring + a small top bias so the card lands at roughly the optical
   centre instead of the geometric one (BRANDING §11). */
.setup-stage {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  /* Account for navbar + footer chrome — keeps the card off the edges
     when the page is short, but lets it scroll naturally when the
     viewport is too small to centre cleanly. */
  min-height: calc(100vh - 240px);
}
.setup-wrap {
  width: min(560px, 100%);
}
.not-configured {
  width: min(640px, 100%);
  padding: 1.5rem 1.4rem;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.06);
  border: 1px solid rgba(251, 191, 36, 0.28);
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
