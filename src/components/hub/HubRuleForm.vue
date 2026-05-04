<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import type { AlertRule, Channel } from "@/interfaces/Hub";

// Mirrors the validation in vigil-pro/api.py::create_rule and ::update_rule.
// Server is the authority — surface its 400s verbatim if anything slips
// past these client-side checks.
type Op = ">" | ">=" | "<" | "<=";
type ScopeKind = "all" | "host" | "tag";
const OPS: Op[] = [">", ">=", "<", "<="];

// Metrics that carry a non-empty `dim` on the wire today. The Collector
// only emits dim on disk.* mount metrics — net.* aggregates server-wide
// for now (see hub_client.py::_flatten). When per-interface net lands,
// add the two net.* metric ids here and supply an interface-name datalist
// instead of mount paths.
const DIMENSIONED_METRICS = new Set([
  "disk.percent",
  "disk.used_bytes",
  "disk.total_bytes",
]);

// Common Linux/macOS mount points — non-exhaustive, just enough to
// autocomplete the obvious ones. Users can still type any path.
const COMMON_MOUNTS = ["/", "/home", "/var", "/boot", "/tmp", "/opt"];

interface FormState {
  name: string;
  metric: string;
  dim: string;
  op: Op;
  // <input type="number"> with v-model returns a number once the user
  // types — but the empty state is still "". So both fields are
  // string-or-number in flight, and we coerce on submit.
  threshold: string | number;
  for_seconds: string | number;
  scopeKind: ScopeKind;
  scopeValue: string;
  channel_id: number | null;
  enabled: boolean;
}

const props = defineProps<{
  /** null = create mode; populated = edit mode (metric/dim become readonly). */
  rule: AlertRule | null;
  channels: Channel[];
  submitting: boolean;
  /** Surfaced from the parent's last submit attempt — typically a server 400. */
  serverError?: string;
}>();

interface SubmitPayload {
  name: string;
  metric: string;
  dim: string;
  scope: string;
  op: Op;
  threshold: number;
  for_seconds: number;
  channel_id: number;
  enabled: boolean;
}

const emit = defineEmits<{
  (e: "submit", payload: SubmitPayload): void;
  (e: "cancel"): void;
}>();

const isEditing = computed(() => props.rule !== null);

const blankForm = (): FormState => ({
  name: "",
  metric: "",
  dim: "",
  op: ">",
  threshold: "",
  for_seconds: "60",
  scopeKind: "all",
  scopeValue: "",
  channel_id: null,
  enabled: true,
});

const fromRule = (r: AlertRule): FormState => {
  let kind: ScopeKind = "all";
  let value = "";
  if (r.scope.startsWith("host:")) {
    kind = "host";
    value = r.scope.slice("host:".length);
  } else if (r.scope.startsWith("tag:")) {
    kind = "tag";
    value = r.scope.slice("tag:".length);
  }
  return {
    name: r.name,
    metric: r.metric,
    dim: r.dim,
    op: r.op as Op,
    threshold: r.threshold,
    for_seconds: r.for_seconds,
    scopeKind: kind,
    scopeValue: value,
    channel_id: r.channel_id,
    enabled: Boolean(r.enabled),
  };
};

const form = reactive<FormState>(props.rule ? fromRule(props.rule) : blankForm());
const localError = ref("");
const nameInputRef = ref<HTMLInputElement | null>(null);

// If the parent reassigns the `rule` prop (e.g. switching which row is
// being edited without un-mounting the form), reinitialize from it. Same
// for null → resets to a blank form. Watch on `props.rule` not the
// destructured value so reactivity tracks correctly.
watch(
  () => props.rule,
  (r) => {
    Object.assign(form, r ? fromRule(r) : blankForm());
    localError.value = "";
    nextTick(() => nameInputRef.value?.focus());
  },
);

// Default the channel pick to the first available — the server requires
// a valid channel_id, and most users have only one or two channels.
onMounted(() => {
  if (form.channel_id === null && props.channels.length) {
    form.channel_id = props.channels[0].id;
  }
  nextTick(() => nameInputRef.value?.focus());
});

const formScope = computed(() => {
  if (form.scopeKind === "all") return "all";
  return `${form.scopeKind}:${form.scopeValue.trim()}`;
});

const dimSupported = computed(() =>
  DIMENSIONED_METRICS.has(form.metric.trim()),
);

// Clear any stray dim if the user switches to a non-dimensioned metric.
// The server would just store "" anyway, but blanking it client-side
// keeps the form's value coherent with what's actually visible.
watch(dimSupported, (supported) => {
  if (!supported) form.dim = "";
});

function validate(): string | null {
  if (!form.name.trim()) return "Name is required.";
  if (!form.metric.trim()) return "Metric is required.";

  // String() handles both branches of `string | number` from the number
  // inputs — empty string for blank fields, "42" for numeric values.
  const tStr = String(form.threshold).trim();
  if (tStr === "") return "Threshold is required.";
  const t = Number(tStr);
  if (Number.isNaN(t)) return "Threshold must be a number.";

  const fsStr = String(form.for_seconds).trim();
  if (fsStr === "") return "For-seconds is required.";
  const fs = Number(fsStr);
  if (!Number.isInteger(fs) || fs < 0) {
    return "For-seconds must be a non-negative integer.";
  }

  if (form.scopeKind !== "all" && !form.scopeValue.trim()) {
    return form.scopeKind === "host"
      ? "Pick or enter a host name for the scope."
      : "Enter a tag for the scope.";
  }
  if (form.channel_id === null) {
    return props.channels.length
      ? "Pick a channel to dispatch to."
      : "No channels configured — create one before adding a rule.";
  }
  return null;
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
    metric: form.metric.trim(),
    dim: form.dim.trim(),
    scope: formScope.value,
    op: form.op,
    threshold: Number(form.threshold),
    for_seconds: Number(form.for_seconds),
    channel_id: form.channel_id!,
    enabled: form.enabled,
  });
}

const visibleError = computed(() => localError.value || props.serverError || "");
</script>

<template>
  <form class="rule-form" @submit.prevent="onSubmit">
    <div class="form-eyebrow">
      {{ isEditing ? `— EDIT RULE #${rule!.id}` : "— NEW RULE" }}
    </div>

    <div class="form-grid" :class="{ 'no-dim': !dimSupported }">
      <label class="field f-name">
        <span class="field-label">Name</span>
        <input
          ref="nameInputRef"
          v-model="form.name"
          type="text"
          class="field-input"
          placeholder="e.g. cpu hot"
          spellcheck="false"
          autocomplete="off"
          :disabled="submitting"
        />
      </label>

      <label class="field f-metric">
        <span class="field-label">
          Metric
          <span v-if="isEditing" class="field-hint">locked — delete + recreate to change</span>
        </span>
        <input
          v-model="form.metric"
          type="text"
          class="field-input mono"
          list="rule-metric-suggestions"
          placeholder="cpu.usage"
          spellcheck="false"
          autocomplete="off"
          :disabled="submitting || isEditing"
          :readonly="isEditing"
        />
        <datalist id="rule-metric-suggestions">
          <option value="cpu.usage" />
          <option value="cpu.load_1m" />
          <option value="cpu.load_5m" />
          <option value="cpu.load_15m" />
          <option value="cpu.temp_c" />
          <option value="mem.percent" />
          <option value="mem.used_bytes" />
          <option value="disk.percent" />
          <option value="disk.io.read_bytes_per_s" />
          <option value="disk.io.write_bytes_per_s" />
          <option value="net.rx_bytes_per_s" />
          <option value="net.tx_bytes_per_s" />
        </datalist>
      </label>

      <label v-if="dimSupported" class="field f-dim">
        <span class="field-label">
          Mount
          <span class="field-hint">
            {{ isEditing ? "locked" : "e.g. /, /var, /home" }}
          </span>
        </span>
        <input
          v-model="form.dim"
          type="text"
          class="field-input mono"
          list="rule-mount-suggestions"
          placeholder="/"
          spellcheck="false"
          autocomplete="off"
          :disabled="submitting || isEditing"
          :readonly="isEditing"
        />
        <datalist id="rule-mount-suggestions">
          <option v-for="m in COMMON_MOUNTS" :key="m" :value="m" />
        </datalist>
      </label>

      <label class="field f-op">
        <span class="field-label">Op</span>
        <select v-model="form.op" class="field-input mono" :disabled="submitting">
          <option v-for="op in OPS" :key="op" :value="op">{{ op }}</option>
        </select>
      </label>

      <label class="field f-threshold">
        <span class="field-label">Threshold</span>
        <input
          v-model="form.threshold"
          type="number"
          step="any"
          class="field-input mono"
          placeholder="90"
          :disabled="submitting"
        />
      </label>

      <label class="field f-forsec">
        <span class="field-label">For (seconds)</span>
        <input
          v-model="form.for_seconds"
          type="number"
          min="0"
          step="1"
          class="field-input mono"
          :disabled="submitting"
        />
      </label>

      <div class="field f-scope">
        <span class="field-label">Scope</span>
        <div class="scope-row">
          <select v-model="form.scopeKind" class="field-input mono scope-kind" :disabled="submitting">
            <option value="all">all hosts</option>
            <option value="host">host:</option>
            <option value="tag">tag:</option>
          </select>
          <input
            v-if="form.scopeKind !== 'all'"
            v-model="form.scopeValue"
            type="text"
            class="field-input mono scope-value"
            :placeholder="form.scopeKind === 'host' ? 'web-01.dc1' : 'edge'"
            spellcheck="false"
            autocomplete="off"
            :disabled="submitting"
          />
        </div>
      </div>

      <label class="field f-channel">
        <span class="field-label">Channel</span>
        <select
          v-model="form.channel_id"
          class="field-input mono"
          :disabled="submitting || !channels.length"
        >
          <option v-if="!channels.length" :value="null">No channels configured</option>
          <option
            v-for="c in channels"
            :key="c.id"
            :value="c.id"
          >{{ c.name }} ({{ c.type }})</option>
        </select>
      </label>

      <label class="field f-enabled checkbox-field">
        <input
          v-model="form.enabled"
          type="checkbox"
          :disabled="submitting"
        />
        <span class="field-label">Enabled on creation</span>
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
          : (isEditing ? "Save changes" : "Create rule")
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
.rule-form {
  padding: 1rem 1.1rem 1.1rem;
  background: rgba(34, 211, 238, 0.04);
}
body[data-theme="dark"] .rule-form {
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

/* 12-col grid that collapses sensibly. The condition fields (op /
   threshold / for) sit on one row; name/metric stretch full-width on
   smaller breakpoints. */
.form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 0.7rem 0.85rem;
}
.field { display: flex; flex-direction: column; gap: 0.32rem; min-width: 0; }
.f-name      { grid-column: span 6; }
.f-metric    { grid-column: span 6; }
.f-dim       { grid-column: span 4; }
.f-op        { grid-column: span 2; }
.f-threshold { grid-column: span 3; }
.f-forsec    { grid-column: span 3; }
.f-scope     { grid-column: span 6; }
.f-channel   { grid-column: span 6; }
.f-enabled   { grid-column: span 12; }

/* When the chosen metric has no dim, redistribute that row so op /
   threshold / for stay full-width — otherwise we leave a 4-col gap. */
.form-grid.no-dim .f-op        { grid-column: span 2; }
.form-grid.no-dim .f-threshold { grid-column: span 5; }
.form-grid.no-dim .f-forsec    { grid-column: span 5; }

@media (max-width: 720px) {
  .f-name, .f-metric, .f-dim, .f-op, .f-threshold, .f-forsec,
  .f-scope, .f-channel, .f-enabled { grid-column: span 12; }
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
  font-variant-numeric: tabular-nums;
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
body[data-theme="dark"] .field-input:focus {
  border-color: rgba(96, 165, 250, 0.55);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.22);
}

/* Native select arrow renders dim against dark — colour the chevron via
   a CSS arrow background. Keeps mono/font scaling consistent with text inputs. */
select.field-input {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2rem;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='%2394a3b8' d='M4 6l4 4 4-4z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.55rem center;
  background-size: 14px 14px;
}

.scope-row { display: flex; gap: 0.5rem; }
.scope-kind  { flex: 0 0 9rem; }
.scope-value { flex: 1 1 auto; }
@media (max-width: 480px) {
  .scope-row { flex-direction: column; }
  .scope-kind  { flex: 1 1 auto; }
}

.checkbox-field {
  flex-direction: row;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.15rem;
}
.checkbox-field input[type="checkbox"] {
  width: 16px; height: 16px;
  accent-color: #22d3ee;
  cursor: pointer;
}
.checkbox-field .field-label { letter-spacing: 0.1em; text-transform: none; font-size: 0.8rem; }

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
