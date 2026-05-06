<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import type { Channel } from "@/interfaces/Hub";

// Mirrors the validation in vigil-pro/api.py::create_channel and ::update_channel.
// Server is the authority — surface its 400s verbatim if anything slips
// past these client-side checks.
type ChannelType = "slack" | "discord" | "webhook";
const TYPES: { value: ChannelType; label: string; hint: string }[] = [
  { value: "slack",   label: "Slack",            hint: "Slack incoming webhook URL" },
  { value: "discord", label: "Discord",          hint: "Discord webhook URL with /slack suffix" },
  { value: "webhook", label: "Webhook (generic)", hint: "Receives a JSON POST with the full alert payload" },
];

interface FormState {
  name: string;
  type: ChannelType;
  // Per-type config — kept as separate refs so switching type doesn't
  // wipe what the user typed. Only the keys for the selected type are
  // sent on submit.
  webhookUrl: string;   // slack / discord
  url: string;          // webhook
}

const props = defineProps<{
  /** null = create mode; populated = edit mode. */
  channel: Channel | null;
  submitting: boolean;
  /** Surfaced from the parent's last submit attempt — typically a server 400 / 409. */
  serverError?: string;
}>();

interface SubmitPayload {
  name: string;
  type: ChannelType;
  config: Record<string, unknown>;
}

const emit = defineEmits<{
  (e: "submit", payload: SubmitPayload): void;
  (e: "cancel"): void;
}>();

const isEditing = computed(() => props.channel !== null);

const blankForm = (): FormState => ({
  name: "",
  type: "slack",
  webhookUrl: "",
  url: "",
});

const fromChannel = (c: Channel): FormState => {
  const cfg = c.config || {};
  return {
    name: c.name,
    type: c.type,
    webhookUrl: typeof cfg.webhook_url === "string" ? (cfg.webhook_url as string) : "",
    url: typeof cfg.url === "string" ? (cfg.url as string) : "",
  };
};

const form = reactive<FormState>(props.channel ? fromChannel(props.channel) : blankForm());
const localError = ref("");
const nameInputRef = ref<HTMLInputElement | null>(null);

// Reinitialize when the parent swaps which channel we're editing.
watch(
  () => props.channel,
  (c) => {
    Object.assign(form, c ? fromChannel(c) : blankForm());
    localError.value = "";
    nextTick(() => nameInputRef.value?.focus());
  },
);

onMounted(() => {
  nextTick(() => nameInputRef.value?.focus());
});

const typeHint = computed(
  () => TYPES.find((t) => t.value === form.type)?.hint ?? "",
);

function validate(): string | null {
  if (!form.name.trim()) return "Name is required.";

  if (form.type === "slack" || form.type === "discord") {
    const u = form.webhookUrl.trim();
    if (!u) return "Webhook URL is required.";
    if (!/^https?:\/\//i.test(u)) {
      return "Webhook URL must start with http:// or https://";
    }
  } else if (form.type === "webhook") {
    const u = form.url.trim();
    if (!u) return "URL is required.";
    if (!/^https?:\/\//i.test(u)) {
      return "URL must start with http:// or https://";
    }
  }
  return null;
}

function buildConfig(): Record<string, unknown> {
  if (form.type === "slack" || form.type === "discord") {
    return { webhook_url: form.webhookUrl.trim() };
  }
  return { url: form.url.trim() };
}

function onSubmit(): void {
  if (props.submitting) return;
  const v = validate();
  if (v) {
    localError.value = v;
    return;
  }
  localError.value = "";
  emit("submit", {
    name: form.name.trim(),
    type: form.type,
    config: buildConfig(),
  });
}

const visibleError = computed(() => localError.value || props.serverError || "");
</script>

<template>
  <form class="chan-form" @submit.prevent="onSubmit">
    <div class="form-eyebrow">
      {{ isEditing ? `— EDIT CHANNEL #${channel!.id}` : "— NEW CHANNEL" }}
    </div>

    <div class="form-grid">
      <label class="field f-name">
        <span class="field-label">Name</span>
        <input
          ref="nameInputRef"
          v-model="form.name"
          type="text"
          class="field-input"
          placeholder="e.g. ops-alerts"
          spellcheck="false"
          autocomplete="off"
          :disabled="submitting"
        />
      </label>

      <label class="field f-type">
        <span class="field-label">
          Type
          <span class="field-hint">{{ typeHint }}</span>
        </span>
        <select v-model="form.type" class="field-input mono" :disabled="submitting">
          <option v-for="t in TYPES" :key="t.value" :value="t.value">
            {{ t.label }}
          </option>
        </select>
      </label>

      <!-- Slack / Discord both use a single `webhook_url` config key. -->
      <label v-if="form.type === 'slack' || form.type === 'discord'" class="field f-target">
        <span class="field-label">
          Webhook URL
          <span v-if="form.type === 'discord'" class="field-hint">remember the trailing /slack</span>
        </span>
        <input
          v-model="form.webhookUrl"
          type="url"
          class="field-input mono"
          :placeholder="
            form.type === 'slack'
              ? 'https://hooks.slack.com/services/T0…/B0…/…'
              : 'https://discord.com/api/webhooks/…/…/slack'
          "
          spellcheck="false"
          autocomplete="off"
          :disabled="submitting"
        />
      </label>

      <!-- Generic webhook — JSON POST receiver. -->
      <label v-else-if="form.type === 'webhook'" class="field f-target">
        <span class="field-label">
          URL
          <span class="field-hint">receives JSON with rule, host, op, threshold, value, event</span>
        </span>
        <input
          v-model="form.url"
          type="url"
          class="field-input mono"
          placeholder="https://alerts.example.com/incoming"
          spellcheck="false"
          autocomplete="off"
          :disabled="submitting"
        />
      </label>
    </div>

    <div v-if="visibleError" class="form-error" role="alert">
      <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
      <span>{{ visibleError }}</span>
    </div>

    <div class="form-actions">
      <button
        type="submit"
        class="form-submit"
        :disabled="submitting"
      >{{
        submitting
          ? (isEditing ? "Saving…" : "Creating…")
          : (isEditing ? "Save changes" : "Create channel")
      }}</button>
      <button
        type="button"
        class="form-cancel"
        :disabled="submitting"
        @click="$emit('cancel')"
      >Cancel</button>
    </div>
  </form>
</template>

<style scoped>
/* Form chrome — same recipe as HubRuleForm, kept local so the two can
   evolve independently if the channel form grows per-type fields. */
.chan-form {
  padding: 1rem 1.1rem 1.1rem;
  background: rgba(34, 211, 238, 0.04);
}
body[data-theme="dark"] .chan-form {
  background: rgba(34, 211, 238, 0.03);
}

.form-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.85rem;
}
body[data-theme="dark"] .form-eyebrow { color: #94a3b8; }

/* 12-col grid: name + type share the top row, the per-type target field
   stretches full-width below since URLs are long. */
.form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 0.7rem 0.85rem;
}
.field { display: flex; flex-direction: column; gap: 0.32rem; min-width: 0; }
.f-name   { grid-column: span 6; }
.f-type   { grid-column: span 6; }
.f-target { grid-column: span 12; }

@media (max-width: 720px) {
  .f-name, .f-type, .f-target { grid-column: span 12; }
}

.field-label {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6b7280;
}
body[data-theme="dark"] .field-label { color: #94a3b8; }
.field-hint {
  margin-left: 0.35rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: #94a3b8;
  text-transform: none;
}

.field-input {
  width: 100%;
  height: 34px;
  padding: 0 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  background: rgba(255, 255, 255, 0.7);
  color: #0f172a;
  font-family: "Lato", system-ui, sans-serif;
  font-size: 0.86rem;
  transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
}
.field-input.mono {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.82rem;
  font-feature-settings: "tnum";
}
.field-input:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.55);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
}
.field-input:disabled { opacity: 0.6; cursor: not-allowed; }
body[data-theme="dark"] .field-input {
  background: rgba(15, 23, 42, 0.55);
  color: #e2e8f0;
  border-color: rgba(148, 163, 184, 0.22);
}

select.field-input {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2rem;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='%2394a3b8' d='M4 6l4 4 4-4z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.55rem center;
  background-size: 14px 14px;
}

.form-error {
  margin-top: 0.85rem;
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.32);
  color: #b91c1c;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.78rem;
  line-height: 1.5;
}
body[data-theme="dark"] .form-error { color: #fda4af; }

.form-actions {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  margin-top: 1rem;
}
.form-submit {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.16);
  border: 1px solid rgba(34, 211, 238, 0.5);
  color: #0e7490;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.form-submit:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.26);
  border-color: rgba(34, 211, 238, 0.7);
}
.form-submit:disabled { opacity: 0.6; cursor: progress; }
body[data-theme="dark"] .form-submit { color: #67e8f9; }

.form-cancel {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.32);
  color: #475569;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 140ms ease, color 140ms ease;
}
.form-cancel:hover:not(:disabled) {
  border-color: rgba(148, 163, 184, 0.55);
  color: #0f172a;
}
.form-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
body[data-theme="dark"] .form-cancel { color: #cbd5e1; }
body[data-theme="dark"] .form-cancel:hover:not(:disabled) { color: #f1f5f9; }
</style>
