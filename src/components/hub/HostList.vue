<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useHubStore } from "@/stores/hub";
import HostStatusPill from "./HostStatusPill.vue";

const hub = useHubStore();
const sorted = computed(() =>
  [...hub.hosts].sort((a, b) => a.name.localeCompare(b.name)),
);

function relTime(unixS: number): string {
  const ageS = Math.floor(Date.now() / 1000) - unixS;
  if (ageS < 60)        return `${ageS}s ago`;
  if (ageS < 3600)      return `${Math.floor(ageS / 60)}m ago`;
  if (ageS < 86400)     return `${Math.floor(ageS / 3600)}h ago`;
  return `${Math.floor(ageS / 86400)}d ago`;
}
</script>

<template>
  <div class="card panel-card border-0 shadow-lg">
    <div class="section-header">
      <div class="d-flex align-items-center gap-3">
        <div class="header-icon">
          <font-awesome-icon icon="fa-solid fa-server" />
        </div>
        <div>
          <div class="header-title">Hosts</div>
          <div class="header-sub">{{ hub.hosts.length }} REGISTERED</div>
        </div>
      </div>
    </div>

    <div v-if="!sorted.length" class="empty">
      No hosts yet. Run a Collector with
      <code>--hub</code> + <code>--hub_key</code> to register one.
    </div>

    <div v-else class="host-list">
      <RouterLink
        v-for="h in sorted"
        :key="h.id"
        :to="`/hub/hosts/${h.id}`"
        class="host-row"
      >
        <div class="host-meta">
          <div class="host-name">{{ h.name }}</div>
          <div class="host-sub">
            <span v-if="h.os" class="host-tag">{{ h.os }}</span>
            <span v-if="h.arch" class="host-tag">{{ h.arch }}</span>
            <span v-for="tag in h.tags" :key="tag" class="host-tag">{{ tag }}</span>
          </div>
        </div>
        <div class="host-right">
          <span class="host-seen">{{ relTime(h.last_seen) }}</span>
          <HostStatusPill :status="hub.hostStatus(h)" />
          <font-awesome-icon
            icon="fa-solid fa-chevron-right"
            class="host-chevron"
          />
        </div>
      </RouterLink>
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
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.25);
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

.empty {
  padding: 1.5rem 1rem;
  font-size: 0.9rem;
  color: var(--bs-secondary, #6b7280);
  text-align: center;
}
.empty code {
  font-family: ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.35rem;
  color: #2563eb;
}

.host-list { display: flex; flex-direction: column; }
.host-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  text-decoration: none;
  color: inherit;
  transition: background 160ms ease;
}
.host-row:last-child { border-bottom: 0; }
.host-row:hover { background: rgba(96, 165, 250, 0.05); }

.host-meta { min-width: 0; flex: 1; }
.host-name {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}
.host-sub {
  margin-top: 0.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.host-tag {
  display: inline-flex;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  background: rgba(148, 163, 184, 0.1);
  color: var(--bs-secondary, #6b7280);
}

.host-right {
  display: flex; align-items: center;
  gap: 0.8rem;
  flex-shrink: 0;
}
.host-seen {
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  color: var(--bs-secondary, #6b7280);
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
}
.host-chevron {
  color: var(--bs-secondary, #6b7280);
  font-size: 0.75rem;
  opacity: 0.6;
}
</style>
