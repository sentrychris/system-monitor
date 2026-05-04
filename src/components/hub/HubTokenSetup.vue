<script setup lang="ts">
import { ref } from "vue";
import { useHubStore } from "@/stores/hub";
import { config } from "@/config";

const hub = useHubStore();
const token = ref("");
const submitting = ref(false);

async function submit() {
  if (!token.value.trim()) return;
  submitting.value = true;
  try {
    await hub.connect(token.value.trim());
  } finally {
    submitting.value = false;
    if (hub.ready) token.value = "";
  }
}
</script>

<template>
  <div class="card panel-card border-0 shadow-lg">
    <div class="section-header">
      <div class="d-flex align-items-center gap-3">
        <div class="header-icon">
          <font-awesome-icon icon="fa-solid fa-key" />
        </div>
        <div>
          <div class="header-title">Hub access</div>
          <div class="header-sub">PASTE ADMIN BEARER TOKEN</div>
        </div>
      </div>
    </div>
    <div class="setup-body">
      <p class="lede">
        This dashboard talks to <span class="hub-url">{{ config.hub.url || "—" }}</span>
        on your behalf. Paste the admin bearer token from
        <code>VIGIL_PRO_ADMIN_TOKEN</code> on the hub host.
      </p>
      <form @submit.prevent="submit" class="setup-form">
        <input
          v-model="token"
          type="password"
          autocomplete="off"
          spellcheck="false"
          placeholder="vp_admin_xxxxx…"
          class="token-input"
        />
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="submitting || !token.trim()"
        >
          <font-awesome-icon
            :icon="submitting ? 'fa-solid fa-circle-notch' : 'fa-solid fa-plug'"
            :class="{ 'fa-spin': submitting }"
          />
          {{ submitting ? "Verifying…" : "Connect" }}
        </button>
      </form>
      <div v-if="hub.error" class="setup-error">{{ hub.error }}</div>
      <div class="setup-help">
        Token is stored locally in <code>localStorage</code>, never sent to
        any server other than the hub. Disconnect any time from the navbar.
      </div>
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
    radial-gradient(700px circle at 0% 0%,   rgba(59, 130, 246, 0.14), transparent 50%),
    radial-gradient(500px circle at 100% 100%, rgba(34, 211, 238, 0.08), transparent 50%);
  pointer-events: none;
}
.section-header > * { position: relative; z-index: 1; }

.header-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--fs-body);
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.25);
}
.header-title {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: var(--fs-body);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.15;
}
.header-sub {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--fs-micro);
  color: #9ca3af;
  letter-spacing: 0.08em;
  margin-top: 2px;
  text-transform: uppercase;
}

.setup-body { padding: 1.4rem 1.4rem 1.5rem; }
.lede {
  color: var(--bs-secondary, #6b7280);
  font-size: 0.93rem;
  line-height: 1.55;
  margin: 0 0 1rem;
}
.hub-url {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: #22d3ee;
  font-weight: 500;
}
.lede code, .setup-help code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  font-size: 0.85em;
  color: #2563eb;
}
body[data-theme="dark"] .lede code, body[data-theme="dark"] .setup-help code {
  color: #67e8f9;
}

.setup-form {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: stretch;
}
.token-input {
  flex: 1 1 280px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(96, 165, 250, 0.22);
  color: inherit;
  outline: none;
  transition: border-color 160ms ease;
}
.token-input:focus { border-color: rgba(96, 165, 250, 0.6); }
body[data-theme="dark"] .token-input { background: rgba(255, 255, 255, 0.04); }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  border: 0;
  background: linear-gradient(135deg, #60a5fa, #22d3ee);
  color: #0b1220;
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow:
    0 12px 30px -12px rgba(34, 211, 238, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 16px 40px -12px rgba(34, 211, 238, 0.7),
    inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.setup-error {
  margin-top: 0.8rem;
  padding: 0.55rem 0.8rem;
  border-radius: 6px;
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.32);
  color: #f87171;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.82rem;
}
.setup-help {
  margin-top: 1rem;
  font-size: 0.82rem;
  color: var(--bs-secondary, #6b7280);
  line-height: 1.6;
}
</style>
