<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useHubStore } from "@/stores/hub";
import { useLoadingStore } from "@/stores/loading";
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { config } from "@/config";

useDocumentTitle("Fleet Overview");
import HostList from "@/components/hub/HostList.vue";
import AlertList from "@/components/hub/AlertList.vue";
import FleetSummary from "@/components/hub/FleetSummary.vue";
import HubTokenSetup from "@/components/hub/HubTokenSetup.vue";
import PageHeader from "@/components/PageHeader.vue";

const hub = useHubStore();

// Re-render the "last refresh: Ns ago" pill once a second without
// touching the store. Cheap.
const tick = ref(Date.now());
let tickInterval: number | null = null;

const hubOrigin = computed(() => {
  try { return new URL(config.hub.url).host; }
  catch { return config.hub.url || "—"; }
});

const lastRefreshLabel = computed(() => {
  if (!hub.lastRefresh) return "—";
  const ageS = Math.max(0, Math.floor((tick.value - hub.lastRefresh) / 1000));
  if (ageS < 5)    return "just now";
  if (ageS < 60)   return `${ageS}s ago`;
  if (ageS < 3600) return `${Math.floor(ageS / 60)}m ago`;
  return `${Math.floor(ageS / 3600)}h ago`;
});

// Recent alert events fired in the last 24 h — surfaces "fleet has been
// chatty today" without needing to open the alert list.
const eventsLast24h = computed(() => {
  const cutoff = Math.floor(Date.now() / 1000) - 24 * 3600;
  return hub.alertEvents.filter((e) => e.ts >= cutoff).length;
});

// Most recent event — drives the "Recent activity" panel.
const latestEvent = computed(() => hub.alertEvents[0] ?? null);

function eventRelTime(unixS: number): string {
  const ageS = Math.max(0, Math.floor(tick.value / 1000) - unixS);
  if (ageS < 60)    return `${ageS}s ago`;
  if (ageS < 3600)  return `${Math.floor(ageS / 60)}m ago`;
  if (ageS < 86400) return `${Math.floor(ageS / 3600)}h ago`;
  return `${Math.floor(ageS / 86400)}d ago`;
}

// Ops command quick-reference modal — Esc / backdrop click to close.
const opsOpen = ref(false);
function onOpsKey(e: KeyboardEvent) {
  if (e.key === "Escape" && opsOpen.value) opsOpen.value = false;
}

onMounted(async () => {
  useLoadingStore().toggle(true);
  if (hub.isConfigured && hub.token && !hub.ready) {
    await hub.connect();
  }
  if (hub.ready) hub.startPolling();
  tickInterval = window.setInterval(() => { tick.value = Date.now(); }, 1000);
  document.addEventListener("keydown", onOpsKey);
});
onUnmounted(() => {
  hub.stopPolling();
  if (tickInterval !== null) window.clearInterval(tickInterval);
  document.removeEventListener("keydown", onOpsKey);
});
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

    <!-- Top row: lede + recent activity. Equal-height side-by-side on
         lg+, stacks on smaller screens. -->
    <div class="intro-row">
      <div class="intro-card lede-card">
        <p class="lede">
          Live status across every Collector reporting to this hub. Tiles
          below summarise host health, active alerts, and aggregate load;
          the panels drill into individual hosts and recent fires. See
          <RouterLink to="/hub/help" class="lede-link">/hub/help</RouterLink>
          for what each alert state means.
        </p>
      </div>

      <section
        class="intro-card ra-card"
        :class="latestEvent ? `is-${latestEvent.event}` : 'is-empty'"
        aria-label="Recent fleet activity"
      >
        <header class="ra-head">
          <span class="ra-eyebrow">— RECENT ACTIVITY</span>
          <span v-if="latestEvent" class="ra-time mono">{{ eventRelTime(latestEvent.ts) }}</span>
        </header>
        <div v-if="latestEvent" class="ra-body">
          <div class="ra-line">
            <span class="ra-state mono" :class="`state-${latestEvent.event}`">
              <span class="ra-dot"></span>{{ latestEvent.event.toUpperCase() }}
            </span>
            <span class="ra-rule">{{ latestEvent.rule_name }}</span>
          </div>
          <div class="ra-meta mono">
            on <RouterLink :to="`/hub/hosts/${latestEvent.host_id}`" class="ra-host">{{ latestEvent.host_name }}</RouterLink>
            <span v-if="latestEvent.value !== null"> · last {{ latestEvent.value.toFixed(2) }}</span>
          </div>
        </div>
        <div v-else class="ra-empty mono">
          <span class="ra-dot ra-dot-empty"></span>
          No fire/resolve events recorded yet.
        </div>
      </section>
    </div>

    <!-- Mono telemetry pill strip — full-width, with the Ops trigger
         hugging the right edge so it lives "inline with the pills". -->
    <div class="hub-status">
      <span class="hs-eyebrow">HUB</span>
      <span class="hs-pill">
        <span class="hs-dot live"></span>
        <span class="hs-label">Source</span>
        <span class="hs-value">{{ hubOrigin }}</span>
      </span>
      <span
        class="hs-pill"
        :title="hub.lastRefresh ? new Date(hub.lastRefresh).toISOString() : ''"
      >
        <span class="hs-label">Last refresh</span>
        <span class="hs-value">{{ lastRefreshLabel }}</span>
      </span>
      <span class="hs-pill">
        <span class="hs-label">Events · 24 h</span>
        <span class="hs-value">{{ eventsLast24h }}</span>
      </span>
      <button
        type="button"
        class="ops-trigger"
        :aria-expanded="opsOpen"
        title="Open ops command quick-reference"
        @click="opsOpen = true"
      >
        <font-awesome-icon icon="fa-solid fa-terminal" />
        <span>Ops commands</span>
      </button>
      <RouterLink
        to="/hub/help"
        class="docs-trigger"
        title="Open the Vigil Pro Hub docs"
      >
        <font-awesome-icon icon="fa-solid fa-circle-question" />
        <span>Docs</span>
      </RouterLink>
    </div>

    <!-- Ops modal — terminal-block popout. Esc / backdrop click closes. -->
    <Teleport to="body">
      <transition name="ops-fade">
        <div
          v-if="opsOpen"
          class="ops-modal-backdrop"
          role="presentation"
          @click.self="opsOpen = false"
        >
          <section
            class="ops-block ops-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Ops command quick-reference"
          >
            <header class="ops-head">
              <span class="ops-dot dot-rose"></span>
              <span class="ops-dot dot-amber"></span>
              <span class="ops-dot dot-emerald"></span>
              <span class="ops-label mono">vigil-pro · ops</span>
              <button
                type="button"
                class="ops-close"
                aria-label="Close"
                @click="opsOpen = false"
              >×</button>
            </header>
            <pre class="ops-body"><span class="term-comment"># admin bearer token</span>
<span class="term-prompt">$</span> <span class="term-cmd">sudo grep VIGIL_PRO_ADMIN_TOKEN /etc/vigil-pro/hub.env</span>

<span class="term-comment"># health probe</span>
<span class="term-prompt">$</span> <span class="term-cmd">curl -s </span><span class="term-string">{{ config.hub.url }}/healthz</span>

<span class="term-comment"># follow hub logs</span>
<span class="term-prompt">$</span> <span class="term-cmd">journalctl -u vigil-pro -f</span>

<span class="term-comment"># register a host</span>
<span class="term-prompt">$</span> <span class="term-cmd">curl -X POST </span><span class="term-string">{{ config.hub.url }}/api/hosts</span> <span class="term-flag">-H</span> <span class="term-string">"Authorization: Bearer $TOKEN"</span> <span class="term-flag">-d</span> <span class="term-string">'{"name":"web-01"}'</span></pre>
            <footer class="ops-foot mono">Press <kbd>Esc</kbd> or click outside to close.</footer>
          </section>
        </div>
      </transition>
    </Teleport>

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

    <footer class="page-foot">
      <span class="pf-eyebrow">DATA SOURCE</span>
      <span class="pf-text">
        Aggregated from every reporting <span class="mono accent">vigil-collector</span>
        via <span class="mono accent">{{ hubOrigin }}</span>. Polled every
        {{ Math.round(config.hub.pollInterval / 1000) }} s; the hub itself
        evaluates alert rules on a separate cadence.
      </span>
    </footer>
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

/* ── Top intro row: lede + recent activity, equal height side-by-side. */
.intro-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 1rem;
  margin: 0.85rem 0 1.1rem;
  align-items: stretch;
}
@media (max-width: 991.98px) {
  .intro-row { grid-template-columns: 1fr; }
}

/* Shared glass panel-card recipe (BRANDING §8.2) for both top cards. */
.intro-card {
  padding: 0.9rem 1.15rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(96, 165, 250, 0.18);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 24px -10px rgba(15, 23, 42, 0.14);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
body[data-theme="dark"] .intro-card {
  background: rgba(15, 23, 42, 0.42);
  border-color: rgba(96, 165, 250, 0.16);
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.05) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.45);
}

.lede-card { justify-content: center; }
.lede {
  margin: 0;
  /*max-width: 72ch;*/
  font-family: "Lato", "Montserrat", system-ui, sans-serif;
  font-size: 0.94rem;
  line-height: 1.6;
  color: #475569;
}
body[data-theme="dark"] .lede { color: #cbd5e1; }
.lede-link {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px dashed rgba(96, 165, 250, 0.5);
}
.lede-link:hover { color: #1d4ed8; border-bottom-style: solid; }
body[data-theme="dark"] .lede-link {
  color: #67e8f9;
  border-bottom-color: rgba(34, 211, 238, 0.5);
}

/* ── Hub-status mono strip — origin / refresh / 24 h events ────────── */
.hub-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem 0.55rem;
  margin: 0;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  letter-spacing: 0.04em;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
.hs-eyebrow {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-right: 0.2rem;
  user-select: none;
}
.hs-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.26rem 0.65rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #475569;
}
body[data-theme="dark"] .hs-pill {
  background: rgba(148, 163, 184, 0.06);
  border-color: rgba(148, 163, 184, 0.16);
  color: #cbd5e1;
}
.hs-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}
.hs-dot.live { animation: hs-pulse 1.6s ease-in-out infinite; }
@keyframes hs-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }
@media (prefers-reduced-motion: reduce) { .hs-dot.live { animation: none; } }
.hs-label {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #94a3b8;
}
.hs-value {
  color: #0f172a;
  font-weight: 500;
}
body[data-theme="dark"] .hs-value { color: #f1f5f9; }

/* ── Recent activity card ──────────────────────────────────────────── */
/* Shares the .intro-card glass surface; tinted-state classes recolor it. */
.ra-card.is-fired {
  border-color: rgba(244, 63, 94, 0.32);
  background: rgba(244, 63, 94, 0.05);
}
.ra-card.is-resolved {
  border-color: rgba(52, 211, 153, 0.32);
  background: rgba(52, 211, 153, 0.05);
}
body[data-theme="dark"] .ra-card.is-fired    { background: rgba(244, 63, 94, 0.07); }
body[data-theme="dark"] .ra-card.is-resolved { background: rgba(52, 211, 153, 0.06); }

.ra-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.ra-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #94a3b8;
}
.ra-time {
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: #94a3b8;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
.ra-body { display: flex; flex-direction: column; gap: 0.3rem; }
.ra-line {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}
.ra-state {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  border: 1px solid currentColor;
}
.ra-state.state-fired {
  color: #b91c1c;
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.32);
}
.ra-state.state-resolved {
  color: #047857;
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.32);
}
body[data-theme="dark"] .ra-state.state-fired    { color: #f87171; }
body[data-theme="dark"] .ra-state.state-resolved { color: #34d399; }
.ra-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  flex-shrink: 0;
}
.ra-rule {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.92rem;
  color: #0f172a;
  letter-spacing: 0.005em;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
body[data-theme="dark"] .ra-rule { color: #f1f5f9; }
.ra-meta {
  font-size: 0.78rem;
  color: #6b7280;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
body[data-theme="dark"] .ra-meta { color: #94a3b8; }
.ra-host {
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px dashed rgba(96, 165, 250, 0.5);
}
.ra-host:hover { color: #1d4ed8; border-bottom-style: solid; }
body[data-theme="dark"] .ra-host { color: #67e8f9; border-bottom-color: rgba(34, 211, 238, 0.5); }

.ra-empty {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.82rem;
  color: #94a3b8;
  letter-spacing: 0.02em;
}
.ra-dot-empty { background: #94a3b8; box-shadow: none; }

/* ── Ops trigger — sits inline at the right of the pill strip ──────── */
.ops-trigger {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.26rem 0.75rem;
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.32);
  color: #0e7490;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.ops-trigger:hover {
  background: rgba(34, 211, 238, 0.16);
  border-color: rgba(34, 211, 238, 0.55);
  color: #0e7490;
}
.ops-trigger:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 2px;
}
body[data-theme="dark"] .ops-trigger {
  color: #67e8f9;
  background: rgba(34, 211, 238, 0.06);
}
body[data-theme="dark"] .ops-trigger:hover {
  color: #a5f3fc;
  background: rgba(34, 211, 238, 0.12);
}
@media (max-width: 575.98px) {
  .ops-trigger { width: 100%; justify-content: center; margin-left: 0; }
}

/* Docs trigger — same pill shape as ops-trigger, blue tone so the two
   read as related-but-different controls. Sits to the right of ops. */
.docs-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.26rem 0.75rem;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.32);
  color: #1d4ed8;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.docs-trigger:hover {
  background: rgba(96, 165, 250, 0.16);
  border-color: rgba(96, 165, 250, 0.55);
  color: #1d4ed8;
}
.docs-trigger:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}
body[data-theme="dark"] .docs-trigger {
  color: #93c5fd;
  background: rgba(96, 165, 250, 0.06);
}
body[data-theme="dark"] .docs-trigger:hover {
  color: #bfdbfe;
  background: rgba(96, 165, 250, 0.14);
}
@media (max-width: 575.98px) {
  .docs-trigger { width: 100%; justify-content: center; }
}

/* ── Ops modal — backdrop, dialog, close, foot hint. ──────────────── */
.ops-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.ops-modal {
  width: min(720px, 100%);
  max-height: calc(100vh - 3rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* Same dark-drama shadow recipe as marketing browser frame
     (BRANDING §5.3) — befitting a popout dialog. */
  box-shadow:
    0 30px 80px -20px rgba(2, 6, 23, 0.7),
    0 0 0 1px rgba(96, 165, 250, 0.06) inset,
    0 0 60px -10px rgba(34, 211, 238, 0.45);
}
.ops-modal .ops-body {
  overflow: auto;
  flex: 1 1 auto;
}
.ops-close {
  margin-left: 0.4rem;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.04);
  color: #cbd5e1;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
}
.ops-close:hover {
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.45);
  color: #fda4af;
}
.ops-close:focus-visible {
  outline: 2px solid #f43f5e;
  outline-offset: 2px;
}
.ops-foot {
  padding: 0.5rem 1rem 0.65rem;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: #94a3b8;
  border-top: 1px solid rgba(96, 165, 250, 0.1);
  background: #0a0e18;
}
.ops-foot kbd {
  font-family: inherit;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 4px;
  padding: 0.05rem 0.35rem;
  font-size: 0.7rem;
  color: #cbd5e1;
}
.ops-fade-enter-active,
.ops-fade-leave-active { transition: opacity 160ms ease; }
.ops-fade-enter-active .ops-modal,
.ops-fade-leave-active .ops-modal { transition: transform 200ms ease, opacity 160ms ease; }
.ops-fade-enter-from,
.ops-fade-leave-to { opacity: 0; }
.ops-fade-enter-from .ops-modal,
.ops-fade-leave-to .ops-modal { transform: translateY(12px); opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .ops-fade-enter-active,
  .ops-fade-leave-active,
  .ops-fade-enter-active .ops-modal,
  .ops-fade-leave-active .ops-modal { transition: none; }
}

/* ── Ops terminal block (BRANDING §8.10) ──────────────────────────── */
.ops-block {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.18);
  background: #0a0e18;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 8px 24px -10px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(96, 165, 250, 0.05) inset;
}
.ops-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.85rem;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(96, 165, 250, 0.18);
}
.ops-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  opacity: 0.5;
}
.ops-dot.dot-rose    { background: #f43f5e; }
.ops-dot.dot-amber   { background: #fbbf24; }
.ops-dot.dot-emerald { background: #34d399; }
.ops-label {
  margin-left: auto;
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #94a3b8;
}
.ops-body {
  margin: 0;
  padding: 0.85rem 1rem 0.95rem;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;
  font-size: 0.78rem;
  line-height: 1.7;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-all;
  user-select: text;
}
.ops-body .term-prompt  { color: #22d3ee; user-select: none; }
.ops-body .term-cmd     { color: #f1f5f9; }
.ops-body .term-flag    { color: #fbbf24; }
.ops-body .term-string  { color: #34d399; }
.ops-body .term-comment { color: #64748b; font-style: italic; }
.ops-body .mono         { font-family: inherit; }
.page-foot {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  font-family: "Lato", system-ui, sans-serif;
  font-size: 0.78rem;
  color: #6b7280;
  display: flex;
  align-items: baseline;
  gap: 0.7rem;
  flex-wrap: wrap;
}
body[data-theme="dark"] .page-foot { color: #94a3b8; }
.pf-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}
.pf-text .mono {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.78rem;
}
.pf-text .accent { color: #2563eb; font-weight: 500; }
body[data-theme="dark"] .pf-text .accent { color: #67e8f9; }

/* Force the cards in each row to fill the column for matched height. */
.row > .col-12 { display: flex; }
</style>
