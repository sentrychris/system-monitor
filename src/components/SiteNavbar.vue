<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { config } from "@/config";
import { useThemeStore } from "@/stores/theme";
import { useSystemStore } from "@/stores/system";
import { useHubStore } from "@/stores/hub";
import PageHeader from "@/components/PageHeader.vue";
import SiteLogo from "@/components/SiteLogo.vue";

const theme = useThemeStore();
const system = useSystemStore();
const hub = useHubStore();
const route = useRoute();
const isHubRoute = computed(() => route.path.startsWith("/hub"));

const node = computed(() => {
  const region = config.app.deployment.region;
  const instance = config.app.deployment.instance;
  if (!region && !instance) return null;
  return [region, instance].filter(Boolean).join(" · ").toUpperCase();
});
</script>

<template>
  <nav class="navbar navbar-expand-lg site-navbar shadow-lg">
    <div class="container-fluid py-2 nav-container">
      <a class="navbar-brand d-flex align-items-center gap-3" href="#">
        <SiteLogo />
        <PageHeader
          :decor-title="config.app.name"
          :title="config.app.title"
          compact
        />
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <div v-if="hub.isConfigured" class="nav-segments" role="tablist" aria-label="View mode">
          <RouterLink
            to="/"
            class="seg"
            active-class="is-active"
            exact-active-class="is-active"
          >Local</RouterLink>
          <span class="seg-divider" aria-hidden="true"></span>
          <RouterLink
            to="/hub"
            class="seg seg--hub"
            active-class="is-active"
          >
            Hub
            <span class="seg-pro" aria-label="Vigil Pro">Pro</span>
            <span v-if="hub.firingAlerts.length" class="route-badge">
              {{ hub.firingAlerts.length }}
            </span>
          </RouterLink>
        </div>
        <ul class="navbar-nav me-auto mb-0"></ul>

        <div class="nav-controls">
          <!-- Status indicator (collector mode) -->
          <span
            v-if="!isHubRoute"
            class="status-chip"
            :class="`status-${system.connectionType}`"
          >
            <span class="status-dot"></span>
            <span class="status-text">{{
              system.connectionType === "websocket" ? "LIVE" : "STATIC"
            }}</span>
          </span>

          <!-- Hub status chip -->
          <span
            v-else-if="hub.ready"
            class="status-chip status-websocket"
            :title="`Hub: ${config.hub.url}`"
          >
            <span class="status-dot"></span>
            <span class="status-text">HUB · {{ hub.hosts.length }}</span>
          </span>
          <span v-else-if="hub.isConfigured" class="status-chip status-http">
            <span class="status-dot"></span>
            <span class="status-text">NO TOKEN</span>
          </span>

          <!-- Node identifier -->
          <span v-if="node" class="node-chip" :title="node">
            <font-awesome-icon icon="fa-solid fa-server" class="node-icon" />
            <span class="node-text">{{ node }}</span>
          </span>

          <!-- Hub disconnect (only in hub mode + connected) -->
          <button
            v-if="isHubRoute && hub.ready"
            class="hub-disconnect"
            type="button"
            title="Disconnect from hub"
            aria-label="Disconnect from hub"
            @click="hub.disconnect()"
          >
            <font-awesome-icon icon="fa-solid fa-power-off" />
          </button>

          <span class="control-divider" aria-hidden="true"></span>

          <!-- Theme toggle -->
          <label
            class="nav-toggle"
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            <input
              type="checkbox"
              @change="theme.toggle"
              :checked="theme.active === 'dark'"
            />
            <span class="nav-toggle-track">
              <font-awesome-icon
                icon="fa-solid fa-sun"
                class="track-icon track-icon-left"
              />
              <font-awesome-icon
                icon="fa-solid fa-moon"
                class="track-icon track-icon-right"
              />
              <span class="nav-toggle-thumb"></span>
            </span>
          </label>

          <!-- Connection mode toggle (collector view only) -->
          <label
            v-if="!isHubRoute"
            class="nav-toggle"
            title="Toggle live websocket"
            aria-label="Toggle live websocket"
          >
            <input
              type="checkbox"
              @change="system.toggle"
              :checked="system.connectionType === 'websocket'"
            />
            <span class="nav-toggle-track">
              <font-awesome-icon
                icon="fa-solid fa-bolt"
                class="track-icon track-icon-left"
              />
              <font-awesome-icon
                icon="fa-solid fa-pause"
                class="track-icon track-icon-right"
              />
              <span class="nav-toggle-thumb"></span>
            </span>
          </label>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.site-navbar {
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  color: #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 1030;
  overflow: hidden;
  border-bottom: 1px solid rgba(96, 165, 250, 0.22);
}
.site-navbar::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
  opacity: 0.6;
}
.site-navbar::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(700px circle at 0% 0%, rgba(59, 130, 246, 0.16), transparent 50%),
    radial-gradient(500px circle at 100% 100%, rgba(34, 211, 238, 0.1), transparent 50%);
  pointer-events: none;
}
.nav-container { position: relative; z-index: 1; }

.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.15);
  padding: 0.35rem 0.55rem;
}
.navbar-toggler-icon {
  filter: invert(1);
  opacity: 0.8;
}

/* ---------- Right-side controls ---------- */
.nav-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.control-divider {
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 0.1rem;
}

/* ---------- Status chip ---------- */
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.32rem 0.7rem;
  border-radius: 6px;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--fs-micro);
  font-weight: 700;
  letter-spacing: 0.16em;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}
.status-websocket { color: #34d399; }
.status-http      { color: #fbbf24; }
.status-websocket .status-dot {
  animation: live-pulse 1.4s ease-in-out infinite;
}

/* ---------- Node identifier chip ---------- */
.node-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.32rem 0.7rem;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--fs-micro);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  max-width: 220px;
  overflow: hidden;
}
.node-icon { font-size: var(--fs-caption); color: #60a5fa; flex-shrink: 0; }
.node-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ---------- Toggle switches ---------- */
.nav-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
}
.nav-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.nav-toggle-track {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 50px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease, border-color 0.2s ease;
}
.nav-toggle:hover .nav-toggle-track {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
}

.track-icon {
  font-size: var(--fs-micro);
  z-index: 1;
  transition: color 0.2s ease;
}
.track-icon-left  { color: #fbbf24; }
.track-icon-right { color: #94a3b8; }

.nav-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #f9fafb;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-toggle input:checked ~ .nav-toggle-track .nav-toggle-thumb {
  transform: translateX(26px);
}
.nav-toggle input:checked ~ .nav-toggle-track .track-icon-left  { color: #6b7280; }
.nav-toggle input:checked ~ .nav-toggle-track .track-icon-right { color: #c084fc; }

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* ---------- Nav route links (Local / Hub) ---------- */
.navbar-nav { display: inline-flex; align-items: center; gap: 0.4rem; padding-left: 0.6rem; }
.nav-item   { list-style: none; }
/* Primary view-mode switcher — segmented control (instrument-cluster
   mode-switch feel, BRANDING §1 SOC/NOC sensibility). Both routes live
   in a single bordered shell; the active segment fills with cyan and
   gets a thin top accent line. */
.nav-segments {
  display: inline-flex;
  align-items: stretch;
  padding: 3px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  margin-right: auto;
}
.seg {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.36rem 0.95rem;
  border-radius: 6px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #94a3b8;
  text-decoration: none;
  transition: color 160ms ease, background 160ms ease, box-shadow 200ms ease;
}
.seg:hover { color: #f1f5f9; }
.seg:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 2px;
}
.seg-divider {
  width: 1px;
  margin: 4px 0;
  background: rgba(148, 163, 184, 0.18);
  transition: opacity 160ms ease;
}
.seg.is-active {
  color: #67e8f9;
  background: rgba(34, 211, 238, 0.12);
  box-shadow:
    inset 0 0 0 1px rgba(34, 211, 238, 0.28),
    0 0 14px -4px rgba(34, 211, 238, 0.5);
}
/* Hairline cyan accent at the top of the active segment — reinforces
   "selected mode" without making the segment look painted. */
.seg.is-active::before {
  content: "";
  position: absolute;
  left: 0.6rem;
  right: 0.6rem;
  top: 1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #22d3ee 50%, transparent);
  opacity: 0.55;
}
/* Hide the divider when one of the segments is active — the active
   segment's box already provides separation. */
.nav-segments:has(.is-active) .seg-divider { opacity: 0; }

/* "PRO" chip on the Hub segment — gold gradient (amber primary + secondary
   from BRANDING §3.5) for an unmistakable premium-tier signal without
   expanding the palette. Tiny, mono caps, dark text on gold for AA
   contrast. */
.seg-pro {
  display: inline-flex;
  align-items: center;
  padding: 0.08rem 0.4rem 0.1rem;
  border-radius: 4px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%);
  color: #422006;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1;
  box-shadow:
    0 0 10px -2px rgba(251, 191, 36, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.22);
  /* Slight upward translate to optically center against caps text. */
  transform: translateY(-0.5px);
}
/* Brighten the chip subtly when its segment is active or hovered — keeps
   the gold from looking dim against the cyan-tinted active background. */
.seg.is-active .seg-pro,
.seg:hover .seg-pro {
  box-shadow:
    0 0 14px -2px rgba(251, 191, 36, 0.6),
    inset 0 0 0 1px rgba(255, 255, 255, 0.32);
}
.route-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: rgba(244, 63, 94, 0.18);
  color: #f87171;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  box-shadow: inset 0 0 0 1px rgba(244, 63, 94, 0.32);
  animation: live-pulse 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .route-badge { animation: none; }
}

.hub-disconnect {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 26px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease;
}
.hub-disconnect:hover {
  color: #f87171;
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.32);
}

/* ---------- Mobile ---------- */
@media (max-width: 991.98px) {
  .navbar-collapse { padding-top: 0.75rem; }
  .nav-controls {
    justify-content: flex-start;
    gap: 0.5rem;
  }
  .control-divider { display: none; }
  .node-chip { max-width: 100%; }
}

@media (max-width: 575.98px) {
  .nav-container { padding: 0.5rem !important; }
  .navbar-brand { gap: 0 !important; }
  .status-chip,
  .node-chip {
    padding: 0.28rem 0.55rem;
    letter-spacing: 0.1em;
  }
}
</style>
