<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useHubStore } from "@/stores/hub";
import { useLoadingStore } from "@/stores/loading";
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { config } from "@/config";
import { hubApi, HubApiError } from "@/api/hub";
import type { Channel } from "@/interfaces/Hub";
import PageHeader from "@/components/PageHeader.vue";
import HubChannelForm from "@/components/hub/HubChannelForm.vue";

useDocumentTitle("Channels Section");

const hub = useHubStore();
const loader = useLoadingStore();

const channels = ref<Channel[]>([]);
const error = ref("");
const fetching = ref(false);

// channel_id → confirm/loading state for the delete control on that row.
const confirmingId = ref<number | null>(null);
const deletingId = ref<number | null>(null);

// ── New-channel / edit-channel form ──────────────────────────────────
// Same shape as HubRulesView: parent owns form-open state and which row
// is being edited; HubChannelForm handles fields and validation.
const formOpen = ref(false);
const editingId = ref<number | null>(null);    // null = create mode; id = edit mode
const submitting = ref(false);
const formError = ref("");

const editingChannel = computed<Channel | null>(() =>
  editingId.value === null
    ? null
    : channels.value.find((c) => c.id === editingId.value) ?? null,
);

function openForm(): void {
  editingId.value = null;
  formOpen.value = true;
  formError.value = "";
}

function openEdit(channel: Channel): void {
  editingId.value = channel.id;
  formOpen.value = true;
  formError.value = "";
}

function closeForm(): void {
  formOpen.value = false;
  editingId.value = null;
  formError.value = "";
}

interface ChannelFormPayload {
  name: string;
  type: "slack" | "discord" | "webhook";
  config: Record<string, unknown>;
}

async function onSubmit(payload: ChannelFormPayload): Promise<void> {
  if (!hub.token || !config.hub.url || submitting.value) return;
  submitting.value = true;
  formError.value = "";
  const o = { baseUrl: config.hub.url, token: hub.token };
  try {
    if (editingId.value !== null) {
      await hubApi.patchChannel(o, editingId.value, payload);
    } else {
      await hubApi.createChannel(o, payload);
    }
    closeForm();
    await refresh();
  } catch (e) {
    formError.value = e instanceof HubApiError
      ? `Hub error ${e.status}: ${e.message}`
      : (e as Error).message;
  } finally {
    submitting.value = false;
  }
}

async function refresh(): Promise<void> {
  if (!hub.token || !config.hub.url) return;
  fetching.value = true;
  error.value = "";
  const o = { baseUrl: config.hub.url, token: hub.token };
  try {
    channels.value = await hubApi.listChannels(o);
  } catch (e) {
    error.value = e instanceof HubApiError
      ? `Hub error ${e.status}: ${e.message}`
      : (e as Error).message;
  } finally {
    fetching.value = false;
  }
}

async function onDelete(channel: Channel): Promise<void> {
  if (!hub.token || !config.hub.url || deletingId.value !== null) return;
  deletingId.value = channel.id;
  try {
    await hubApi.deleteChannel(
      { baseUrl: config.hub.url, token: hub.token },
      channel.id,
    );
    channels.value = channels.value.filter((c) => c.id !== channel.id);
    confirmingId.value = null;
  } catch (e) {
    // Surface the 409 (channel still referenced) at the row level so the
    // user sees which channel can't be deleted, instead of in the page
    // banner that's far from the action.
    error.value = e instanceof HubApiError
      ? `Hub error ${e.status}: ${e.message}`
      : (e as Error).message;
  } finally {
    deletingId.value = null;
  }
}

// Pull a useful value out of the per-type config blob without leaking
// the whole secret into the row. Slack/Discord webhooks contain a shared
// secret in the path; show enough to identify it without printing it.
function fmtTarget(channel: Channel): string {
  const cfg = channel.config || {};
  const raw =
    typeof cfg.webhook_url === "string"
      ? (cfg.webhook_url as string)
      : typeof cfg.url === "string"
      ? (cfg.url as string)
      : "";
  if (!raw) return "—";
  // Show scheme + host + a hint of the path. The host alone disambiguates
  // Slack from Discord from generic webhook in practice.
  try {
    const u = new URL(raw);
    const tail = u.pathname.length > 12 ? `${u.pathname.slice(0, 12)}…` : u.pathname;
    return `${u.protocol}//${u.host}${tail}`;
  } catch {
    return raw.length > 48 ? `${raw.slice(0, 48)}…` : raw;
  }
}

onMounted(async () => {
  loader.toggle(true);
  if (hub.isConfigured && hub.token && !hub.ready) await hub.connect();
  await refresh();
});
</script>

<template>
  <div class="container-fluid py-3 chan-page">
    <div class="back-link">
      <RouterLink to="/hub" class="back">
        <font-awesome-icon icon="fa-solid fa-arrow-left" />
        <span>Back to hub</span>
      </RouterLink>
    </div>

    <div class="chan-head">
      <PageHeader decor-title="Vigil Pro Hub" title="Channels" />
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
      Where alerts get sent. Each
      <RouterLink to="/hub/rules" class="lede-link">alert rule</RouterLink>
      points at exactly one channel — Slack, Discord, or a generic
      JSON webhook. Use <em>+ New channel</em> below to add one.
    </p>

    <div v-if="error" class="chan-error">
      <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
      <span>{{ error }}</span>
    </div>

    <section class="chan-card">
      <header class="chan-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-bell" /></span>
        <div class="header-text">
          <div class="header-title">Configured channels</div>
          <div class="header-sub">{{ channels.length }} TOTAL</div>
        </div>
        <button
          v-if="!formOpen"
          type="button"
          class="new-chan-btn"
          :disabled="!hub.ready"
          title="Create a new channel"
          @click="openForm"
        >
          <font-awesome-icon icon="fa-solid fa-bolt" />
          <span>New channel</span>
        </button>
      </header>

      <!-- Create-mode form sits at the top; edit-mode form renders inline
           below the row being edited. Same pattern as HubRulesView. -->
      <Transition name="chan-slide">
        <HubChannelForm
          v-if="formOpen && editingId === null"
          class="chan-form-host top"
          :channel="null"
          :submitting="submitting"
          :server-error="formError"
          @submit="onSubmit"
          @cancel="closeForm"
        />
      </Transition>

      <div v-if="!channels.length && !fetching && !formOpen" class="empty">
        <font-awesome-icon icon="fa-solid fa-circle-question" class="empty-icon" />
        <div class="empty-title">No channels configured</div>
        <div class="empty-sub">
          Hit <em>+ New channel</em> above. You'll need at least one
          before you can create an alert rule.
        </div>
      </div>

      <ul v-else class="chan-list">
        <li
          v-for="channel in channels"
          :key="channel.id"
          class="chan-li"
          :class="{ 'is-editing-row': editingId === channel.id }"
        >
          <div class="chan-row">
            <div class="chan-main">
              <div class="chan-line">
                <span class="chan-name">{{ channel.name }}</span>
                <span class="chan-id mono">#{{ channel.id }}</span>
                <span class="chan-type-pill" :class="`type-${channel.type}`">
                  {{ channel.type }}
                </span>
              </div>
              <div class="chan-meta mono">
                <span class="meta-label">→</span>
                <span class="meta-target" :title="
                  (channel.config?.webhook_url as string)
                  || (channel.config?.url as string)
                  || ''
                ">{{ fmtTarget(channel) }}</span>
              </div>
            </div>

            <div class="chan-actions">
              <template v-if="confirmingId !== channel.id">
                <button
                  type="button"
                  class="chan-edit"
                  :class="{ 'is-active': editingId === channel.id }"
                  :title="editingId === channel.id ? 'Editing this channel' : 'Edit channel'"
                  :aria-pressed="editingId === channel.id"
                  :disabled="deletingId !== null || (formOpen && editingId !== channel.id)"
                  @click="openEdit(channel)"
                >
                  <font-awesome-icon icon="fa-solid fa-pen" />
                </button>
                <button
                  type="button"
                  class="chan-delete"
                  title="Delete channel"
                  :disabled="deletingId !== null || formOpen"
                  @click="confirmingId = channel.id"
                >
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </template>
              <div v-else class="confirm-strip" role="alertdialog">
                <span class="confirm-text">Delete channel?</span>
                <button
                  class="confirm-yes"
                  type="button"
                  :disabled="deletingId === channel.id"
                  @click="onDelete(channel)"
                >{{ deletingId === channel.id ? "Deleting…" : "Delete" }}</button>
                <button
                  class="confirm-no"
                  type="button"
                  :disabled="deletingId === channel.id"
                  @click="confirmingId = null"
                >Cancel</button>
              </div>
            </div>
          </div>

          <Transition name="chan-slide">
            <HubChannelForm
              v-if="formOpen && editingId === channel.id && editingChannel"
              class="chan-form-host inline"
              :channel="editingChannel"
              :submitting="submitting"
              :server-error="formError"
              @submit="onSubmit"
              @cancel="closeForm"
            />
          </Transition>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* Page chrome borrowed almost verbatim from HubRulesView — same panel-card
   recipe, same back-link, same refresh button. The two pages should look
   like siblings, since the user toggles between them frequently while
   wiring up alerts. */
.chan-page {
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

.chan-head {
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
}
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

.chan-error {
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
body[data-theme="dark"] .chan-error { color: #fda4af; }

.chan-card {
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
body[data-theme="dark"] .chan-card {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.14);
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.05) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.55),
    0 28px 56px -18px rgba(0, 0, 0, 0.6);
}

.chan-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(96, 165, 250, 0.22);
  position: relative;
  overflow: hidden;
}
.chan-header::before {
  content: ""; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.04) 1px, transparent 1px);
  background-size: 32px 32px; opacity: 0.55; pointer-events: none;
}
.chan-header::after {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(700px circle at 0% 0%,    rgba(59, 130, 246, 0.14), transparent 50%),
    radial-gradient(500px circle at 100% 100%, rgba(34, 211, 238, 0.08), transparent 50%);
  pointer-events: none;
}
.chan-header > * { position: relative; z-index: 1; }
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

.chan-list { list-style: none; margin: 0; padding: 0; }

.chan-li {
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  transition: background 180ms ease;
}
body[data-theme="dark"] .chan-li { border-bottom-color: rgba(148, 163, 184, 0.1); }
.chan-li:last-child { border-bottom: 0; }

.chan-li.is-editing-row {
  background: rgba(34, 211, 238, 0.04);
  box-shadow: inset 3px 0 0 rgba(34, 211, 238, 0.55);
}
body[data-theme="dark"] .chan-li.is-editing-row {
  background: rgba(34, 211, 238, 0.06);
}

.chan-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
}

.chan-main { flex: 1 1 auto; min-width: 0; }
.chan-line {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.chan-name {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.96rem;
  color: #0f172a;
}
body[data-theme="dark"] .chan-name { color: #f1f5f9; }
.chan-id {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  color: #94a3b8;
  letter-spacing: 0.04em;
  font-feature-settings: "tnum";
}

/* Per-type pill — same chip recipe across types, color shifts so the eye
   spots the type at a glance. Slack/Discord both blue-ish since they
   share the webhook_url shape; webhook (generic) gets purple to flag
   the more open contract. */
.chan-type-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.chan-type-pill.type-slack {
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.34);
  color: #1d4ed8;
}
.chan-type-pill.type-discord {
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.34);
  color: #6d28d9;
}
.chan-type-pill.type-webhook {
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.34);
  color: #047857;
}
body[data-theme="dark"] .chan-type-pill.type-slack   { color: #93c5fd; }
body[data-theme="dark"] .chan-type-pill.type-discord { color: #c4b5fd; }
body[data-theme="dark"] .chan-type-pill.type-webhook { color: #6ee7b7; }

.chan-meta {
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
body[data-theme="dark"] .chan-meta { color: #cbd5e1; }
.meta-label { color: #94a3b8; }
.meta-target {
  color: #2563eb;
  font-weight: 500;
  /* URLs can be long; let them wrap rather than push the action buttons
     off-screen on narrow viewports. */
  word-break: break-all;
}
body[data-theme="dark"] .meta-target { color: #67e8f9; }

.chan-actions {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.chan-edit,
.chan-delete {
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
.chan-edit:hover:not(:disabled) {
  color: #0e7490;
  border-color: rgba(34, 211, 238, 0.4);
  background: rgba(34, 211, 238, 0.08);
}
.chan-edit.is-active,
.chan-edit.is-active:hover {
  color: #0e7490;
  border-color: rgba(34, 211, 238, 0.6);
  background: rgba(34, 211, 238, 0.12);
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.25);
  cursor: default;
}
.chan-edit:disabled,
.chan-delete:disabled { opacity: 0.5; cursor: not-allowed; }
.chan-edit.is-active:disabled { opacity: 1; }
.chan-delete:hover:not(:disabled) {
  color: #b91c1c;
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(244, 63, 94, 0.08);
}
body[data-theme="dark"] .chan-edit,
body[data-theme="dark"] .chan-delete {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(148, 163, 184, 0.04);
}
body[data-theme="dark"] .chan-edit:hover:not(:disabled) { color: #67e8f9; }
body[data-theme="dark"] .chan-edit.is-active,
body[data-theme="dark"] .chan-edit.is-active:hover {
  color: #67e8f9;
  border-color: rgba(34, 211, 238, 0.55);
  background: rgba(34, 211, 238, 0.10);
}
body[data-theme="dark"] .chan-delete:hover:not(:disabled) { color: #fda4af; }

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
  .chan-row { flex-wrap: wrap; }
  .chan-actions { margin-left: auto; }
}

/* New-channel trigger — green pill, matches the rules-page recipe. */
.new-chan-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.32rem 0.85rem;
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #047857;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.new-chan-btn:hover:not(:disabled) {
  background: rgba(52, 211, 153, 0.2);
  border-color: rgba(52, 211, 153, 0.6);
}
.new-chan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
body[data-theme="dark"] .new-chan-btn { color: #34d399; }

.chan-form-host {
  overflow: hidden;
}
.chan-form-host.top {
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}
body[data-theme="dark"] .chan-form-host.top {
  border-bottom-color: rgba(148, 163, 184, 0.10);
}

.chan-slide-enter-active,
.chan-slide-leave-active {
  transition:
    max-height 220ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity   180ms ease;
}
.chan-slide-enter-from,
.chan-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.chan-slide-enter-to,
.chan-slide-leave-from {
  max-height: 1200px;
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .chan-slide-enter-active,
  .chan-slide-leave-active {
    transition: none;
  }
}
</style>
