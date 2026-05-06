<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useLoadingStore } from "@/stores/loading";

interface DocLink {
  to: string;
  title: string;
  /** Three-letter eyebrow shown beneath the title — keeps the rhythm of
   *  the section eyebrows used elsewhere in the app. */
  eyebrow: string;
  icon: string;
  tone: "cyan" | "emerald" | "blue" | "purple" | "amber" | "rose";
}

// One source of truth for the docs nav. Add a new article here and the
// sidebar picks it up automatically — the page itself still needs a
// route + a component.
const links: DocLink[] = [
  {
    to: "/hub/help/overview",
    title: "Overview",
    eyebrow: "30-SECOND TOUR · START HERE",
    icon: "fa-solid fa-compass",
    tone: "cyan",
  },
  {
    to: "/hub/help/fundamentals",
    title: "Fundamentals",
    eyebrow: "WHAT A COLLECTOR IS",
    icon: "fa-solid fa-server",
    tone: "blue",
  },
  {
    to: "/hub/help/ui",
    title: "The Vigil UI",
    eyebrow: "STANDALONE · TWO MODES",
    icon: "fa-solid fa-laptop",
    tone: "purple",
  },
  {
    to: "/hub/help/deployment",
    title: "Deployment",
    eyebrow: "REGISTER · CONFIGURE",
    icon: "fa-solid fa-circle-nodes",
    tone: "emerald",
  },
  {
    to: "/hub/help/metrics",
    title: "Metrics",
    eyebrow: "WHAT COLLECTORS EMIT",
    icon: "fa-solid fa-gauge-high",
    tone: "amber",
  },
  {
    to: "/hub/help/channels",
    title: "Channels",
    eyebrow: "SLACK · DISCORD · WEBHOOK",
    icon: "fa-solid fa-bell",
    tone: "rose",
  },
  {
    to: "/hub/help/rules",
    title: "Alert Rules",
    eyebrow: "METRICS · SCOPE · API",
    icon: "fa-solid fa-list-check",
    tone: "purple",
  },
  {
    to: "/hub/help/alerts",
    title: "Alert States",
    eyebrow: "STATE MACHINE",
    icon: "fa-solid fa-heart-pulse",
    tone: "cyan",
  },
  {
    to: "/hub/help/troubleshooting",
    title: "Troubleshooting",
    eyebrow: "COMMON FAILURES · FIRST CHECKS",
    icon: "fa-solid fa-life-ring",
    tone: "amber",
  }
];

onMounted(() => {
  useLoadingStore().toggle(true);
});
</script>

<template>
  <div class="container-fluid py-3">
    <div class="back-link">
      <RouterLink to="/hub" class="back">
        <font-awesome-icon icon="fa-solid fa-arrow-left" />
        <span>Back to hub</span>
      </RouterLink>
    </div>

    <div class="help-shell">
      <!-- Docs nav. RouterLink's `active-class` paints the active entry; we
           also mark the parent so the cyan accent reaches the eyebrow. -->
      <aside class="help-sidebar" aria-label="Docs navigation">
        <span class="help-sidebar-eyebrow">VIGIL PRO HUB · DOCS</span>
        <ul class="help-nav">
          <li v-for="link in links" :key="link.to">
            <RouterLink :to="link.to" class="help-nav-link" active-class="is-active">
              <span class="help-nav-icon" :class="`tone-${link.tone}`">
                <font-awesome-icon :icon="link.icon" />
              </span>
              <span class="help-nav-text">
                <span class="help-nav-title">{{ link.title }}</span>
                <span class="help-nav-sub">{{ link.eyebrow }}</span>
              </span>
            </RouterLink>
          </li>
        </ul>
      </aside>

      <RouterView />
    </div>
  </div>
</template>

<style scoped>
/* The shell + sidebar styles live in assets/help.scss so article views
   can render the page-specific markup without re-declaring layout CSS.
   This component only owns the back-link chrome above the docs grid. */
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
</style>
