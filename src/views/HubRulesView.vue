<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useHubStore } from "@/stores/hub";
import { useLoadingStore } from "@/stores/loading";
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { config } from "@/config";
import { hubApi, HubApiError } from "@/api/hub";
import type { AlertRule, Channel } from "@/interfaces/Hub";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Alert Rules Section");

const hub = useHubStore();
const loader = useLoadingStore();

const rules = ref<AlertRule[]>([]);
const channels = ref<Channel[]>([]);
const error = ref("");
const fetching = ref(false);

// rule_id → confirm/loading state for the delete control on that row.
const confirmingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);

const channelById = computed(() => {
  const m = new Map<number, Channel>();
  for (const c of channels.value) m.set(c.id, c);
  return m;
});

async function refresh(): Promise<void> {
  if (!hub.token || !config.hub.url) return;
  fetching.value = true;
  error.value = "";
  const o = { baseUrl: config.hub.url, token: hub.token };
  try {
    const [r, c] = await Promise.all([
      hubApi.listAlertRules(o),
      hubApi.listChannels(o),
    ]);
    rules.value = r;
    channels.value = c;
  } catch (e) {
    error.value = e instanceof HubApiError
      ? `Hub error ${e.status}: ${e.message}`
      : (e as Error).message;
  } finally {
    fetching.value = false;
  }
}

async function onDelete(rule: AlertRule): Promise<void> {
  if (!hub.token || !config.hub.url || deletingId.value !== null) return;
  deletingId.value = rule.id;
  try {
    await hubApi.deleteAlertRule(
      { baseUrl: config.hub.url, token: hub.token },
      rule.id,
    );
    rules.value = rules.value.filter((r) => r.id !== rule.id);
    confirmingId.value = null;
  } catch (e) {
    error.value = e instanceof HubApiError
      ? `Hub error ${e.status}: ${e.message}`
      : (e as Error).message;
  } finally {
    deletingId.value = null;
  }
}

function fmtCondition(r: AlertRule): string {
  const m = r.dim ? `${r.metric}|${r.dim}` : r.metric;
  return `${m} ${r.op} ${r.threshold}`;
}
function fmtFor(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}
function fmtDate(unixS: number): string {
  return new Date(unixS * 1000).toLocaleString("en-GB", {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
    hour12: false,
  }).replace(",", " ·") + " UTC";
}

onMounted(async () => {
  loader.toggle(true);
  if (hub.isConfigured && hub.token && !hub.ready) await hub.connect();
  await refresh();
});
</script>

<template>
  <div class="container-fluid py-3 rules-page">
    <div class="back-link">
      <RouterLink to="/hub" class="back">
        <font-awesome-icon icon="fa-solid fa-arrow-left" />
        <span>Back to hub</span>
      </RouterLink>
    </div>

    <div class="rules-head">
      <PageHeader decor-title="Vigil Pro Hub" title="Alert rules" />
      <button
        type="button"
        class="refresh-btn"
        :disabled="fetching"
        title="Refresh from hub"
        @click="refresh"
      >
        <font-awesome-icon
          icon="fa-solid fa-arrow-rotate-right"
          :class="{ 'fa-spin': fetching }"
        />
        <span>Refresh</span>
      </button>
    </div>

    <p class="lede">
      Operator-defined thresholds the hub evaluates against every Collector's
      incoming samples. See
      <RouterLink to="/hub/help" class="lede-link">/hub/help</RouterLink>
      for the firing/breaching state machine. Rules are created via the admin
      API today; <code>cat ALERTS.md</code> on the hub host for the curl
      quickstart.
    </p>

    <div v-if="error" class="rules-error">
      <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
      <span>{{ error }}</span>
    </div>

    <section class="rules-card">
      <header class="rules-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-list-ul" /></span>
        <div class="header-text">
          <div class="header-title">Configured rules</div>
          <div class="header-sub">{{ rules.length }} TOTAL</div>
        </div>
      </header>

      <div v-if="!rules.length && !fetching" class="empty">
        <font-awesome-icon icon="fa-solid fa-circle-question" class="empty-icon" />
        <div class="empty-title">No rules configured</div>
        <div class="empty-sub">
          Create one with <code>POST /api/alert_rules</code>.
          See <code>ALERTS.md</code> for the quickstart.
        </div>
      </div>

      <ul v-else class="rule-list">
        <li
          v-for="rule in rules"
          :key="rule.id"
          class="rule-row"
          :class="{ 'is-disabled': !rule.enabled }"
        >
          <div class="rule-main">
            <div class="rule-line">
              <span class="rule-name">{{ rule.name }}</span>
              <span class="rule-id mono">#{{ rule.id }}</span>
              <span v-if="!rule.enabled" class="rule-pill is-disabled">DISABLED</span>
            </div>
            <div class="rule-meta mono">
              <span class="meta-label">when</span>
              <span class="meta-cond">{{ fmtCondition(rule) }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-label">for</span>
              <span class="meta-val">{{ fmtFor(rule.for_seconds) }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-label">scope</span>
              <span class="meta-val">{{ rule.scope }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-label">→</span>
              <span class="meta-val">
                {{ channelById.get(rule.channel_id)?.name ?? `channel#${rule.channel_id}` }}
                <span v-if="channelById.get(rule.channel_id)" class="chan-type">
                  ({{ channelById.get(rule.channel_id)!.type }})
                </span>
              </span>
            </div>
            <div class="rule-stamp mono">created {{ fmtDate(rule.created_at) }}</div>
          </div>

          <div class="rule-actions">
            <template v-if="confirmingId !== rule.id">
              <button
                type="button"
                class="rule-delete"
                title="Delete rule"
                :disabled="deletingId !== null"
                @click="confirmingId = rule.id"
              >
                <font-awesome-icon icon="fa-solid fa-trash" />
              </button>
            </template>
            <div v-else class="confirm-strip" role="alertdialog">
              <span class="confirm-text">Delete rule and its history?</span>
              <button
                class="confirm-yes"
                type="button"
                :disabled="deletingId === rule.id"
                @click="onDelete(rule)"
              >{{ deletingId === rule.id ? "Deleting…" : "Delete" }}</button>
              <button
                class="confirm-no"
                type="button"
                :disabled="deletingId === rule.id"
                @click="confirmingId = null"
              >Cancel</button>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.rules-page {
  padding-bottom: 3rem;
  max-width: 1100px;
  margin: 0 auto;
}

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

.rules-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.85rem;
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
.refresh-btn:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.16);
  border-color: rgba(34, 211, 238, 0.55);
}
.refresh-btn:disabled { opacity: 0.6; cursor: progress; }
body[data-theme="dark"] .refresh-btn { color: #67e8f9; }

.lede {
  margin: 1rem 0 1.4rem;
  max-width: 72ch;
  padding: 0.9rem 1.15rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(96, 165, 250, 0.18);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 24px -10px rgba(15, 23, 42, 0.14);
  font-family: "Lato", "Montserrat", system-ui, sans-serif;
  font-size: 0.94rem;
  line-height: 1.6;
  color: #475569;
}
body[data-theme="dark"] .lede {
  background: rgba(15, 23, 42, 0.42);
  border-color: rgba(96, 165, 250, 0.16);
  color: #cbd5e1;
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.05) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.45);
}
.lede code,
.empty code {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  font-size: 0.82em;
  color: #2563eb;
}
body[data-theme="dark"] .lede code,
body[data-theme="dark"] .empty code { color: #67e8f9; }
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

.rules-error {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  margin-bottom: 1rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.32);
  color: #b91c1c;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.82rem;
}
body[data-theme="dark"] .rules-error { color: #fda4af; }

/* ── Rules card — panel-card recipe (BRANDING §8.2) ──────────────── */
.rules-card {
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
}
body[data-theme="dark"] .rules-card {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.14);
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.05) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.55),
    0 28px 56px -18px rgba(0, 0, 0, 0.6);
}

.rules-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(96, 165, 250, 0.22);
  position: relative;
  overflow: hidden;
}
.rules-header::before {
  content: ""; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.04) 1px, transparent 1px);
  background-size: 32px 32px; opacity: 0.55; pointer-events: none;
}
.rules-header::after {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(700px circle at 0% 0%,    rgba(59, 130, 246, 0.14), transparent 50%),
    radial-gradient(500px circle at 100% 100%, rgba(34, 211, 238, 0.08), transparent 50%);
  pointer-events: none;
}
.rules-header > * { position: relative; z-index: 1; }
.icon-tile {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.icon-tile.tone-cyan {
  background: rgba(34, 211, 238, 0.13);
  color: #22d3ee;
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.28);
}
.header-title {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: var(--fs-body, 14px);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f1f5f9;
  line-height: 1.15;
}
.header-sub {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: var(--fs-micro, 10px);
  color: #94a3b8;
  letter-spacing: 0.18em;
  margin-top: 2px;
  text-transform: uppercase;
}

.empty {
  padding: 2.4rem 1.2rem;
  text-align: center;
  color: #6b7280;
}
.empty-icon { font-size: 1.8rem; color: #94a3b8; opacity: 0.5; margin-bottom: 0.8rem; }
.empty-title {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  margin-bottom: 0.3rem;
}
body[data-theme="dark"] .empty-title { color: #f1f5f9; }
.empty-sub { font-size: 0.85rem; line-height: 1.55; }
body[data-theme="dark"] .empty { color: #94a3b8; }

.rule-list { list-style: none; margin: 0; padding: 0; }
.rule-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}
body[data-theme="dark"] .rule-row {
  border-bottom-color: rgba(148, 163, 184, 0.1);
}
.rule-row:last-child { border-bottom: 0; }
.rule-row.is-disabled { opacity: 0.55; }

.rule-main { flex: 1 1 auto; min-width: 0; }
.rule-line {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.rule-name {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.96rem;
  color: #0f172a;
  letter-spacing: 0.005em;
}
body[data-theme="dark"] .rule-name { color: #f1f5f9; }
.rule-id {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  color: #94a3b8;
  letter-spacing: 0.04em;
  font-feature-settings: "tnum";
}
.rule-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}
.rule-pill.is-disabled {
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.32);
  color: #6b7280;
}
body[data-theme="dark"] .rule-pill.is-disabled { color: #94a3b8; }

.rule-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
  margin-top: 0.32rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.78rem;
  color: #475569;
  font-feature-settings: "tnum";
}
body[data-theme="dark"] .rule-meta { color: #cbd5e1; }
.meta-label { color: #94a3b8; }
.meta-sep   { color: #94a3b8; padding: 0 0.05rem; }
.meta-cond  { color: #2563eb; font-weight: 500; }
body[data-theme="dark"] .meta-cond { color: #67e8f9; }
.meta-val   { color: inherit; font-weight: 500; }
.chan-type  { color: #94a3b8; font-weight: 400; }

.rule-stamp {
  margin-top: 0.32rem;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.rule-actions { flex-shrink: 0; }
.rule-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(148, 163, 184, 0.06);
  color: #6b7280;
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}
.rule-delete:hover:not(:disabled) {
  color: #b91c1c;
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(244, 63, 94, 0.08);
}
.rule-delete:disabled { opacity: 0.5; cursor: not-allowed; }
body[data-theme="dark"] .rule-delete {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(148, 163, 184, 0.04);
}
body[data-theme="dark"] .rule-delete:hover:not(:disabled) { color: #fda4af; }

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

@media (max-width: 720px) {
  .rule-row { flex-wrap: wrap; }
  .rule-actions { margin-left: auto; }
}
</style>
