<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useHubStore } from "@/stores/hub";
import { useLoadingStore } from "@/stores/loading";
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { config } from "@/config";
import HubMetricSpark from "@/components/hub/HubMetricSpark.vue";
import PageHeader from "@/components/PageHeader.vue";

const hub = useHubStore();
const route = useRoute();
const router = useRouter();
const hostId = computed(() => Number(route.params.id));

const host = computed(() => hub.hosts.find((h) => h.id === hostId.value));
const status = computed(() => host.value?.status ?? "offline");

useDocumentTitle(() => host.value?.name ?? `Host #${hostId.value}`);

// Active alerts for this host. Sorted firing-first, then breaching.
const hostAlerts = computed(() =>
  hub.alertState
    .filter((a) => a.host_id === hostId.value && a.state !== "ok")
    .slice()
    .sort((a, b) => (a.state === b.state ? 0 : a.state === "firing" ? -1 : 1)),
);
const firingCount    = computed(() => hostAlerts.value.filter((a) => a.state === "firing").length);
const breachingCount = computed(() => hostAlerts.value.filter((a) => a.state === "breaching").length);

// "May 04, 2026 · 09:18 UTC" — concise data-sheet stamp.
function formatStamp(unixS: number): string {
  const d = new Date(unixS * 1000);
  return d.toLocaleString("en-GB", {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
    hour12: false,
  }).replace(",", " ·") + " UTC";
}

// Hub origin shown in the footer source line.
const hubOrigin = computed(() => {
  try { return new URL(config.hub.url).host; }
  catch { return config.hub.url || "—"; }
});

const confirmingDelete = ref(false);
const deleting = ref(false);

async function onDelete(): Promise<void> {
  if (!host.value || deleting.value) return;
  deleting.value = true;
  const ok = await hub.deleteHost(host.value.id);
  deleting.value = false;
  if (ok) router.push("/hub");
  else    confirmingDelete.value = false;
}

const editingUrl = ref(false);
const urlDraft = ref("");
const savingUrl = ref(false);

function startEditUrl(): void {
  urlDraft.value = host.value?.collector_url ?? "";
  editingUrl.value = true;
}

async function saveUrl(): Promise<void> {
  if (!host.value || savingUrl.value) return;
  const trimmed = urlDraft.value.trim();
  // Empty input clears the URL; non-empty must be http(s).
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    hub.error = "URL must start with http:// or https://";
    return;
  }
  savingUrl.value = true;
  const ok = await hub.patchHost(host.value.id, {
    collector_url: trimmed || null,
  });
  savingUrl.value = false;
  if (ok) editingUrl.value = false;
}

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
          <template v-if="!editingUrl">
            <a
              v-if="host.collector_url"
              :href="host.collector_url"
              target="_blank"
              rel="noopener noreferrer"
              class="collector-link"
              title="Open this host's collector dashboard in a new tab"
            >
              <font-awesome-icon icon="fa-solid fa-up-right-from-square" />
              <span>Open dashboard</span>
            </a>
            <button
              class="collector-edit"
              type="button"
              :title="host.collector_url ? 'Edit collector URL' : 'Set collector URL'"
              :aria-label="host.collector_url ? 'Edit collector URL' : 'Set collector URL'"
              @click="startEditUrl"
            >
              <font-awesome-icon
                :icon="host.collector_url ? 'fa-solid fa-pen' : 'fa-solid fa-link'"
              />
            </button>
          </template>
          <div v-else class="url-edit" role="dialog" aria-label="Set collector URL">
            <input
              v-model="urlDraft"
              type="url"
              class="url-input"
              placeholder="https://collector.example/"
              :disabled="savingUrl"
              @keyup.enter="saveUrl"
              @keyup.escape="editingUrl = false"
            />
            <button
              class="url-save"
              type="button"
              :disabled="savingUrl"
              @click="saveUrl"
            >{{ savingUrl ? "Saving…" : "Save" }}</button>
            <button
              class="url-cancel"
              type="button"
              :disabled="savingUrl"
              @click="editingUrl = false"
            >Cancel</button>
          </div>
          <!-- TODO(demo): re-enable the delete-host control after the
               demo. Drop the wrapping `<template v-if="false">` below;
               onDelete and its reactive state are still wired up. -->
          <template v-if="false">
            <button
              v-if="!confirmingDelete"
              class="host-delete"
              type="button"
              title="Delete host"
              aria-label="Delete host"
              @click="confirmingDelete = true"
            >
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
            <div v-else class="confirm-strip" role="alertdialog">
              <span class="confirm-text">Delete host and all its data?</span>
              <button
                class="confirm-yes"
                type="button"
                :disabled="deleting"
                @click="onDelete"
              >{{ deleting ? "Deleting…" : "Delete" }}</button>
              <button
                class="confirm-no"
                type="button"
                :disabled="deleting"
                @click="confirmingDelete = false"
              >Cancel</button>
            </div>
          </template>
        </div>
      </div>

      <!-- ─── Data sheet — System info + Active alerts ─── -->
      <div class="row g-3 data-sheet">
        <div class="col-12 col-lg-7 d-flex">
          <section class="ds-card flex-fill">
            <header class="ds-header">
              <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-server" /></span>
              <div class="ds-header-text">
                <div class="ds-title">System</div>
                <div class="ds-sub">PLATFORM IDENTITY · DATA SHEET</div>
              </div>
            </header>
            <dl class="ds-list">
              <dt>Host ID</dt>
              <dd class="mono">#{{ host.id }}</dd>
              <dt>Hostname</dt>
              <dd class="mono">{{ host.hostname || "—" }}</dd>
              <dt>Operating system</dt>
              <dd class="mono">{{ host.os || "—" }}</dd>
              <dt>Architecture</dt>
              <dd class="mono">{{ host.arch || "—" }}</dd>
              <dt>Logical cores</dt>
              <dd class="mono">
                <template v-if="host.cpu_cores">{{ host.cpu_cores }}</template>
                <span v-else class="dim">—</span>
              </dd>
              <dt>Agent version</dt>
              <dd class="mono">{{ host.agent_version ? `v${host.agent_version}` : "—" }}</dd>
              <dt>Registered</dt>
              <dd class="mono">{{ formatStamp(host.first_seen) }}</dd>
              <dt>Last seen</dt>
              <dd class="mono">{{ formatStamp(host.last_seen) }} <span class="dim">· {{ relTime(host.last_seen) }}</span></dd>
              <dt>Collector URL</dt>
              <dd class="mono">
                <a v-if="host.collector_url"
                   :href="host.collector_url" target="_blank" rel="noopener noreferrer"
                   class="ds-link">{{ host.collector_url }}</a>
                <span v-else class="dim">not set</span>
              </dd>
            </dl>
          </section>
        </div>
        <div class="col-12 col-lg-5 d-flex">
          <section class="ds-card flex-fill">
            <header class="ds-header">
              <span class="icon-tile" :class="firingCount ? 'tone-rose' : (breachingCount ? 'tone-amber' : 'tone-emerald')">
                <font-awesome-icon icon="fa-solid fa-heart-pulse" />
              </span>
              <div class="ds-header-text">
                <div class="ds-title">Health</div>
                <div class="ds-sub">ACTIVE ALERTS · LIVE STATE</div>
              </div>
              <div v-if="hostAlerts.length" class="alert-counts">
                <span
                  v-if="firingCount"
                  class="count-pill is-firing"
                  title="Threshold sustained ≥ for_seconds — channel was dispatched."
                >
                  {{ firingCount }} <span class="count-label">firing</span>
                </span>
                <span
                  v-if="breachingCount"
                  class="count-pill is-breaching"
                  title="Threshold just tripped — hub is timing it. Recovers silently if it ends before for_seconds."
                >
                  {{ breachingCount }} <span class="count-label">breach{{ breachingCount === 1 ? '' : 'es' }}</span>
                </span>
              </div>
              <RouterLink
                to="/hub/help"
                class="ds-help"
                title="What do firing and breaching mean?"
                aria-label="Open alerts help"
              >
                <font-awesome-icon icon="fa-solid fa-circle-question" />
              </RouterLink>
            </header>
            <div class="ds-body">
              <div v-if="!hostAlerts.length" class="all-clear">
                <span class="ac-dot"></span>
                <span class="ac-title">All clear</span>
                <span class="ac-sub">No rules are breaching or firing on this host.</span>
              </div>
              <ul v-else class="alert-list">
                <li v-for="a in hostAlerts" :key="`${a.rule_id}:${a.host_id}`"
                    class="alert-row" :class="`is-${a.state}`">
                  <span class="ar-dot"></span>
                  <div class="ar-main">
                    <div class="ar-title">{{ a.rule_name }}</div>
                    <div class="ar-meta mono">
                      {{ a.metric }}<span v-if="a.dim">|{{ a.dim }}</span>
                      <span class="ar-op"> {{ a.op }} {{ a.threshold }}</span>
                      <span v-if="a.last_value !== null" class="ar-val"> · last {{ a.last_value.toFixed(2) }}</span>
                    </div>
                  </div>
                  <span class="ar-state mono">{{ a.state.toUpperCase() }}</span>
                </li>
              </ul>

              <!-- State legend — always visible, hover for details. -->
              <div class="state-legend" aria-label="Alert state legend">
                <span class="sl-eyebrow" aria-hidden="true">STATES</span>
                <span class="sl-pill is-ok"
                      title="OK — threshold not violated. Nothing to do.">
                  <span class="sl-dot"></span>OK
                </span>
                <span class="sl-pill is-breaching"
                      title="BREACHING — threshold just tripped. Hub is timing it; recovers silently if it ends before for_seconds.">
                  <span class="sl-dot"></span>BREACHING
                </span>
                <span class="sl-pill is-firing"
                      title="FIRING — threshold sustained ≥ for_seconds. Channel was dispatched.">
                  <span class="sl-dot"></span>FIRING
                </span>
                <RouterLink to="/hub/help" class="sl-more">Learn more →</RouterLink>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- ─── Compute ─── -->
      <div class="group">
        <div class="group-eyebrow">
          <span class="icon-tile sm tone-cyan"><font-awesome-icon icon="fa-solid fa-microchip" /></span>
          <span class="ge-text">COMPUTE</span>
          <span class="ge-rule" aria-hidden="true"></span>
        </div>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-xl-3 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="cpu.usage"
                tone="cyan" label="CPU usage" unit="%" :decimals="1"
                :reference=80
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-xl-3 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="cpu.load_1m"
                tone="cyan"
                :label="host.cpu_cores ? `Load 1m · ${host.cpu_cores} cores` : 'Load 1m'"
                :decimals="2"
                :reference="host.cpu_cores ?? undefined"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-xl-3 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="cpu.load_5m"
                tone="cyan"
                :label="host.cpu_cores ? `Load 5m · ${host.cpu_cores} cores` : 'Load 5m'"
                :decimals="2"
                :reference="host.cpu_cores ?? undefined"
              />
            </div>
          </div>
          <div class="col-12 col-md-6 col-xl-3 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="cpu.load_15m"
                tone="cyan"
                :label="host.cpu_cores ? `Load 15m · ${host.cpu_cores} cores` : 'Load 15m'"
                :decimals="2"
                :reference="host.cpu_cores ?? undefined"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Memory ─── -->
      <div class="group">
        <div class="group-eyebrow">
          <span class="icon-tile sm tone-purple"><font-awesome-icon icon="fa-solid fa-memory" /></span>
          <span class="ge-text">MEMORY</span>
          <span class="ge-rule" aria-hidden="true"></span>
        </div>
        <div class="row g-3">
          <div class="col-12 col-md-6 col-xl-4 d-flex">
            <div class="metric-card">
              <HubMetricSpark
                :host-id="host.id" metric="mem.percent"
                tone="purple" label="Memory used" unit="%" :decimals="1"
                :reference="80"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Network ─── -->
      <div class="group">
        <div class="group-eyebrow">
          <span class="icon-tile sm tone-emerald"><font-awesome-icon icon="fa-solid fa-tower-broadcast" /></span>
          <span class="ge-text">NETWORK</span>
          <span class="ge-rule" aria-hidden="true"></span>
        </div>
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
        <div class="group-eyebrow">
          <span class="icon-tile sm tone-amber"><font-awesome-icon icon="fa-solid fa-hard-drive" /></span>
          <span class="ge-text">DISK</span>
          <span class="ge-rule" aria-hidden="true"></span>
        </div>
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

      <!-- ─── Source footnote ─── -->
      <footer class="page-foot">
        <span class="pf-eyebrow">DATA SOURCE</span>
        <span class="pf-text">
          Series streamed via
          <span class="mono accent">vigil-collector</span> →
          <span class="mono accent">{{ hubOrigin }}</span>.
          Tier auto-selected from window length: raw 1 Hz under 6 h,
          downsampled 1 m / 5 m / 1 h beyond.
        </span>
      </footer>
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

/* Collector deep-link + edit affordances. Match the hero pill height
   (38px) so they line up across the row. */
.collector-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 38px;
  padding: 0 0.85rem;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.32);
  color: #2563eb;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}
.collector-link:hover {
  background: rgba(96, 165, 250, 0.18);
  border-color: rgba(96, 165, 250, 0.55);
}
body[data-theme="dark"] .collector-link { color: #67e8f9; }

.collector-edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(148, 163, 184, 0.06);
  color: #6b7280;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}
.collector-edit:hover {
  color: #2563eb;
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(96, 165, 250, 0.08);
}
body[data-theme="dark"] .collector-edit {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(148, 163, 184, 0.04);
}
body[data-theme="dark"] .collector-edit:hover { color: #67e8f9; }

.url-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.45rem;
  height: 38px;
  border-radius: 8px;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.32);
}
.url-input {
  width: 18rem;
  max-width: 40vw;
  height: 28px;
  padding: 0 0.55rem;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  background: rgba(255, 255, 255, 0.7);
  color: #0f172a;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.78rem;
}
.url-input:focus { outline: 2px solid rgba(96, 165, 250, 0.5); outline-offset: 1px; }
body[data-theme="dark"] .url-input {
  background: rgba(15, 23, 42, 0.65);
  color: #e2e8f0;
  border-color: rgba(148, 163, 184, 0.22);
}
.url-save,
.url-cancel {
  border-radius: 6px;
  padding: 0.25rem 0.55rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}
.url-save {
  background: #2563eb;
  border: 1px solid #2563eb;
  color: #fff;
}
.url-save:hover:not(:disabled) { background: #1d4ed8; border-color: #1d4ed8; }
.url-save:disabled { opacity: 0.6; cursor: progress; }
.url-cancel {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.32);
  color: #475569;
}
.url-cancel:hover:not(:disabled) { border-color: rgba(148, 163, 184, 0.55); }
body[data-theme="dark"] .url-cancel { color: #cbd5e1; }

/* Delete host control — quiet by default, danger-tinted on hover. */
.host-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(148, 163, 184, 0.06);
  color: #6b7280;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}
.host-delete:hover {
  color: #b91c1c;
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(244, 63, 94, 0.08);
}
body[data-theme="dark"] .host-delete {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(148, 163, 184, 0.04);
}
body[data-theme="dark"] .host-delete:hover {
  color: #fda4af;
  border-color: rgba(244, 63, 94, 0.38);
  background: rgba(244, 63, 94, 0.1);
}

.confirm-strip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.55rem;
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.32);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
}
.confirm-text { color: #b91c1c; letter-spacing: 0.04em; }
body[data-theme="dark"] .confirm-text { color: #fda4af; }

.confirm-yes,
.confirm-no {
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  font-family: inherit;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}
.confirm-yes {
  background: #b91c1c;
  border: 1px solid #b91c1c;
  color: #fff;
}
.confirm-yes:hover:not(:disabled) { background: #991b1b; border-color: #991b1b; }
.confirm-yes:disabled { opacity: 0.6; cursor: progress; }

.confirm-no {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.32);
  color: #475569;
}
.confirm-no:hover:not(:disabled) { border-color: rgba(148, 163, 184, 0.55); }
body[data-theme="dark"] .confirm-no { color: #cbd5e1; }
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

/* ── Data sheet — System info + Active alerts ───────────────────────── */
.data-sheet { margin-bottom: 1.8rem; }

.ds-card {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 24px -8px rgba(15, 23, 42, 0.18),
    0 24px 48px -16px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
}
body[data-theme="dark"] .ds-card {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.14);
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.05) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.55),
    0 28px 56px -18px rgba(0, 0, 0, 0.6);
}

.ds-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(96, 165, 250, 0.22);
  position: relative;
  overflow: hidden;
}
.ds-header::before {
  content: ""; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.04) 1px, transparent 1px);
  background-size: 32px 32px; opacity: 0.55; pointer-events: none;
}
.ds-header::after {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(700px circle at 0% 0%,    rgba(59, 130, 246, 0.14), transparent 50%),
    radial-gradient(500px circle at 100% 100%, rgba(34, 211, 238, 0.08), transparent 50%);
  pointer-events: none;
}
.ds-header > * { position: relative; z-index: 1; }
.ds-header-text { min-width: 0; flex: 1 1 auto; }
.ds-title {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: var(--fs-body, 14px);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f1f5f9;
  line-height: 1.15;
}
.ds-sub {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: var(--fs-micro, 10px);
  color: #94a3b8;
  letter-spacing: 0.18em;
  margin-top: 2px;
  text-transform: uppercase;
}

/* Tone tile — BRANDING §7. Used in section headers and group eyebrows. */
.icon-tile {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.icon-tile.sm { width: 26px; height: 26px; border-radius: 7px; font-size: 11px; }
.icon-tile.tone-blue    { background: rgba(59, 130, 246, 0.13);  color: #60a5fa; box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.28); }
.icon-tile.tone-cyan    { background: rgba(34, 211, 238, 0.13);  color: #22d3ee; box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.28); }
.icon-tile.tone-purple  { background: rgba(167, 139, 250, 0.13); color: #a78bfa; box-shadow: inset 0 0 0 1px rgba(167, 139, 250, 0.28); }
.icon-tile.tone-emerald { background: rgba(52, 211, 153, 0.13);  color: #34d399; box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.28); }
.icon-tile.tone-amber   { background: rgba(251, 191, 36, 0.13);  color: #fbbf24; box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.28); }
.icon-tile.tone-rose    { background: rgba(244, 63, 94, 0.13);   color: #f43f5e; box-shadow: inset 0 0 0 1px rgba(244, 63, 94, 0.28); }

/* System data sheet — dl with mono dd values. */
.ds-list {
  margin: 0;
  padding: 0.85rem 1rem 1rem;
  display: grid;
  grid-template-columns: minmax(110px, max-content) 1fr;
  column-gap: 1.2rem;
  row-gap: 0.5rem;
  align-items: baseline;
}
.ds-list dt {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 600;
}
body[data-theme="dark"] .ds-list dt { color: #94a3b8; }
.ds-list dd {
  margin: 0;
  font-size: 0.86rem;
  color: #0f172a;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  word-break: break-word;
}
body[data-theme="dark"] .ds-list dd { color: #e2e8f0; }
.ds-list .mono {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  letter-spacing: 0.01em;
}
.ds-list .dim { color: #94a3b8; font-weight: 500; }
.ds-link {
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px dashed rgba(96, 165, 250, 0.5);
}
.ds-link:hover { color: #1d4ed8; border-bottom-style: solid; }
body[data-theme="dark"] .ds-link { color: #67e8f9; border-bottom-color: rgba(34, 211, 238, 0.5); }

/* Health card — alert list / all-clear state. */
.ds-body { padding: 0.85rem 1rem 1rem; flex: 1 1 auto; }

.alert-counts {
  display: inline-flex;
  gap: 0.4rem;
  margin-left: auto;
  flex-shrink: 0;
}

/* "?" link in the Health card header → /hub/help. */
.ds-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  margin-left: 0.4rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.18);
  font-size: 0.78rem;
  text-decoration: none;
  transition: color 140ms ease, border-color 140ms ease, background 140ms ease;
  flex-shrink: 0;
}
.ds-help:hover {
  color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.4);
  background: rgba(34, 211, 238, 0.08);
}
.alert-counts + .ds-help { margin-left: 0.4rem; }
.count-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  font-weight: 700;
  font-feature-settings: "tnum";
}
.count-pill.is-firing {
  background: rgba(244, 63, 94, 0.14);
  border: 1px solid rgba(244, 63, 94, 0.42);
  color: #f87171;
}
.count-pill.is-breaching {
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.38);
  color: #fbbf24;
}
.count-label {
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.66rem;
  opacity: 0.85;
}

.all-clear {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 0.7rem;
  row-gap: 0.15rem;
  align-items: center;
  padding: 0.4rem 0;
}
.ac-dot {
  grid-row: 1 / 3;
  width: 11px; height: 11px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 12px #34d399;
  animation: ac-pulse 1.6s ease-in-out infinite;
}
@keyframes ac-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }
@media (prefers-reduced-motion: reduce) { .ac-dot { animation: none; } }
.ac-title {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  color: #0f172a;
}
body[data-theme="dark"] .ac-title { color: #f1f5f9; }
.ac-sub {
  grid-column: 2;
  font-family: "Lato", system-ui, sans-serif;
  font-size: 0.82rem;
  color: #6b7280;
}
body[data-theme="dark"] .ac-sub { color: #94a3b8; }

.alert-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.alert-row {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(148, 163, 184, 0.04);
}
.alert-row.is-firing {
  background: rgba(244, 63, 94, 0.06);
  border-color: rgba(244, 63, 94, 0.32);
}
.alert-row.is-breaching {
  background: rgba(251, 191, 36, 0.06);
  border-color: rgba(251, 191, 36, 0.32);
}
.ar-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 8px #94a3b8;
  flex-shrink: 0;
}
.alert-row.is-firing    .ar-dot { background: #f43f5e; box-shadow: 0 0 10px #f43f5e; animation: ac-pulse 1.4s ease-in-out infinite; }
.alert-row.is-breaching .ar-dot { background: #fbbf24; box-shadow: 0 0 10px #fbbf24; }
.ar-main { flex: 1 1 auto; min-width: 0; }
.ar-title {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.86rem;
  color: #0f172a;
  letter-spacing: 0.01em;
}
body[data-theme="dark"] .ar-title { color: #f1f5f9; }
.ar-meta {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 2px;
  font-feature-settings: "tnum";
}
body[data-theme="dark"] .ar-meta { color: #94a3b8; }
.ar-state {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  font-weight: 700;
  flex-shrink: 0;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid currentColor;
  color: #94a3b8;
}
.alert-row.is-firing    .ar-state { color: #f87171; }
.alert-row.is-breaching .ar-state { color: #fbbf24; }

/* State legend — always visible at the bottom of the Health card so the
   colour vocabulary is on-screen even when nothing is firing. Hover any
   pill for the one-line definition; click "Learn more →" for the docs. */
.state-legend {
  margin-top: 0.95rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.sl-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-right: 0.2rem;
  user-select: none;
}
.sl-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.16rem 0.5rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  cursor: help;
  border: 1px solid currentColor;
}
.sl-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
}
.sl-pill.is-ok        { color: #047857; background: rgba(52, 211, 153, 0.08);  border-color: rgba(52, 211, 153, 0.32); }
.sl-pill.is-breaching { color: #b45309; background: rgba(251, 191, 36, 0.08);  border-color: rgba(251, 191, 36, 0.32); }
.sl-pill.is-firing    { color: #b91c1c; background: rgba(244, 63, 94, 0.08);   border-color: rgba(244, 63, 94, 0.32); }
body[data-theme="dark"] .sl-pill.is-ok        { color: #34d399; }
body[data-theme="dark"] .sl-pill.is-breaching { color: #fbbf24; }
body[data-theme="dark"] .sl-pill.is-firing    { color: #f87171; }

.sl-more {
  margin-left: auto;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6b7280;
  text-decoration: none;
  transition: color 140ms ease;
}
.sl-more:hover { color: #22d3ee; }
body[data-theme="dark"] .sl-more { color: #94a3b8; }

/* ── Section groups ─────────────────────────────────────────────────── */
.group {
  margin-bottom: 1.6rem;
}
.group:last-child { margin-bottom: 0; }
.group-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #475569;
  margin-bottom: 0.7rem;
  text-transform: uppercase;
}
body[data-theme="dark"] .group-eyebrow { color: #cbd5e1; }
.group-eyebrow .ge-text { line-height: 1; }
.group-eyebrow .ge-rule {
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(90deg,
    rgba(96, 165, 250, 0.32),
    rgba(96, 165, 250, 0)
  );
}

/* Footer source-line — small, mono, dim. */
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
