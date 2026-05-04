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
  <div class="token-card">
    <!-- Section header — header gradient + grid + corner glows (BRANDING §6.3, §8.1). -->
    <div class="section-header">
      <div class="header-left">
        <div class="header-icon">
          <font-awesome-icon icon="fa-solid fa-key" />
        </div>
        <div class="header-text">
          <div class="header-title">Hub access</div>
          <div class="header-sub">PASTE ADMIN BEARER TOKEN</div>
        </div>
      </div>
      <span class="auth-chip" aria-hidden="true">
        <span class="auth-dot"></span>
        AUTH REQUIRED
      </span>
    </div>

    <div class="setup-body">
      <p class="lede">
        <strong class="product">Vigil Pro Hub</strong> at
        <span class="hub-url">{{ config.hub.url || "—" }}</span>
        requires admin authentication. Paste the bearer token defined as
        <code>VIGIL_PRO_ADMIN_TOKEN</code> on the hub host.
      </p>

      <form @submit.prevent="submit" class="setup-form">
        <label class="visually-hidden" for="hub-token">Admin bearer token</label>
        <input
          id="hub-token"
          v-model="token"
          type="password"
          autocomplete="off"
          spellcheck="false"
          autocapitalize="off"
          autocorrect="off"
          placeholder="vp_admin_xxxxx…"
          class="token-input"
          :disabled="submitting"
        />
        <button
          type="submit"
          class="btn-primary"
          :disabled="submitting || !token.trim()"
        >
          <font-awesome-icon
            :icon="submitting ? 'fa-solid fa-circle-notch' : 'fa-solid fa-plug'"
            :class="{ 'fa-spin': submitting }"
          />
          {{ submitting ? "Verifying…" : "Connect" }}
        </button>
      </form>

      <div v-if="hub.error" class="setup-error" role="alert">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
        <span>{{ hub.error }}</span>
      </div>

      <div class="setup-hint">
        <div class="hint-eyebrow">— WHERE TO FIND IT</div>
        <pre class="hint-cmd"><span class="prompt">$</span> sudo grep VIGIL_PRO_ADMIN_TOKEN /etc/vigil-pro/hub.env</pre>
      </div>

      <div class="setup-help">
        <font-awesome-icon icon="fa-solid fa-shield-halved" />
        <span>
          Token is never sent anywhere except the hub. Disconnect any time from the navbar.
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Outer card — panel-card recipe (BRANDING §8.2) ────────────────── */
.token-card {
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
body[data-theme="dark"] .token-card {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.14);
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.05) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.55),
    0 28px 56px -18px rgba(0, 0, 0, 0.6);
}

/* ── Section header — gradient + grid + corner glows ──────────────── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
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
    radial-gradient(700px circle at 0% 0%,    rgba(59, 130, 246, 0.14), transparent 50%),
    radial-gradient(500px circle at 100% 100%, rgba(34, 211, 238, 0.08), transparent 50%);
  pointer-events: none;
}
.section-header > * { position: relative; z-index: 1; }

.header-left {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}
.header-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--fs-body, 14px);
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.28);
}
.header-text { min-width: 0; }
.header-title {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: var(--fs-body, 14px);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.15;
  color: #f1f5f9;
}
.header-sub {
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;
  font-size: var(--fs-micro, 10px);
  color: #94a3b8;
  letter-spacing: 0.18em;
  margin-top: 2px;
  text-transform: uppercase;
}

/* Auth-required status chip (BRANDING §8.4). */
.auth-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.7rem;
  border-radius: 999px;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.32);
  color: #fbbf24;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  flex-shrink: 0;
}
.auth-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}

/* ── Body ──────────────────────────────────────────────────────────── */
.setup-body {
  padding: 1.4rem 1.4rem 1.5rem;
  position: relative;
}

.lede {
  color: #475569;
  font-family: "Lato", "Montserrat", system-ui, sans-serif;
  font-size: 0.93rem;
  line-height: 1.55;
  margin: 0 0 1.1rem;
}
body[data-theme="dark"] .lede { color: #cbd5e1; }

.product {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: 0.005em;
  color: #0f172a;
}
body[data-theme="dark"] .product { color: #f1f5f9; }

.hub-url {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  color: #0e7490;
  font-weight: 500;
}
body[data-theme="dark"] .hub-url { color: #67e8f9; }

.lede code,
.setup-help code {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  font-size: 0.82em;
  color: #2563eb;
}
body[data-theme="dark"] .lede code,
body[data-theme="dark"] .setup-help code { color: #67e8f9; }

/* Form: input + button inline on wide screens, stacked under 480px. */
.setup-form {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: stretch;
}

.token-input {
  flex: 1 1 280px;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(96, 165, 250, 0.22);
  color: #0f172a;                               /* explicit; was `inherit` */
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
}
.token-input::placeholder { color: #94a3b8; }
.token-input:focus {
  border-color: rgba(96, 165, 250, 0.6);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
}
.token-input:disabled { opacity: 0.7; cursor: progress; }

body[data-theme="dark"] .token-input {
  background: rgba(15, 23, 42, 0.65);
  border-color: rgba(148, 163, 184, 0.22);
  color: #e2e8f0;                               /* fixes the bug */
}
body[data-theme="dark"] .token-input::placeholder { color: #64748b; }
body[data-theme="dark"] .token-input:focus {
  border-color: rgba(34, 211, 238, 0.6);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.22);
}

/* Primary button (BRANDING §8.7). */
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
.btn-primary:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

/* Error block — rose accent (BRANDING §3.5). */
.setup-error {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  margin-top: 0.85rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.32);
  color: #b91c1c;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.82rem;
  line-height: 1.4;
}
body[data-theme="dark"] .setup-error { color: #fda4af; }

/* "Where to find it" hint — eyebrow + terminal-block lite. */
.setup-hint { margin-top: 1.1rem; }
.hint-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.4rem;
}
body[data-theme="dark"] .hint-eyebrow { color: #94a3b8; }
.hint-cmd {
  margin: 0;
  padding: 0.55rem 0.8rem;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;
  font-size: 0.78rem;
  color: #334155;
  white-space: pre-wrap;
  overflow-x: auto;
}
body[data-theme="dark"] .hint-cmd {
  background: rgba(10, 14, 23, 0.6);
  border-color: rgba(148, 163, 184, 0.16);
  color: #e2e8f0;
}
.hint-cmd .prompt {
  color: #22d3ee;
  margin-right: 0.5rem;
  user-select: none;
}

/* Trust footer — small, mono, with a shield icon. */
.setup-help {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  margin-top: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #64748b;
}
.setup-help svg {
  margin-top: 0.18rem;
  color: #34d399;
  flex-shrink: 0;
}
body[data-theme="dark"] .setup-help { color: #94a3b8; }

.visually-hidden {
  position: absolute !important;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 480px) {
  .setup-body { padding: 1.2rem 1.1rem 1.3rem; }
  .auth-chip { display: none; }
  .btn-primary { width: 100%; justify-content: center; }
}
</style>
