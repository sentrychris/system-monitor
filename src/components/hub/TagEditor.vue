<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useHubStore } from "@/stores/hub";

// Inline tag editor — chip cluster + add-input. Mirrors the PinButton
// pattern: takes :host-id + :tags, calls hub.patchHost() directly,
// no events bubbled. Optimistic local-state updates are handled by
// the store on success.
//
// Validation rules:
//   - trimmed + lowercased on submit
//   - must match /^[a-z0-9_-]+$/ (alert scope syntax uses `tag:<value>`,
//     so colons and whitespace would break rule matching)
//   - 1–32 chars
//   - duplicates silently no-op
//
// The autocomplete datalist surfaces tags already in use elsewhere on
// the fleet, minus tags already on this host.
const props = defineProps<{
  hostId: number;
  tags: string[];
}>();

const hub = useHubStore();

const draft = ref("");
const editing = ref(false);
const submitting = ref(false);
const error = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

// Build a unique datalist id per host so multiple TagEditors on the
// same page (unlikely today, but possible in a future bulk view) don't
// collide on the <datalist id="...">.
const datalistId = computed(() => `tag-suggest-${props.hostId}`);

// Suggestions: every tag known to the hub, minus those already on
// this host. Recomputed on store changes.
const suggestions = computed(() => {
  const seen = new Set<string>();
  for (const h of hub.hosts) {
    for (const t of h.tags || []) seen.add(t);
  }
  for (const t of props.tags) seen.delete(t);
  return Array.from(seen).sort();
});

const TAG_RE = /^[a-z0-9_-]+$/;

function normalize(raw: string): string {
  return raw.trim().toLowerCase();
}

function validate(value: string): string | null {
  if (!value) return null;        // empty is "do nothing", not an error
  if (value.length > 32) return "Tags must be 32 characters or fewer.";
  if (!TAG_RE.test(value)) {
    return "Tags can only contain lowercase letters, numbers, dashes, and underscores.";
  }
  return null;
}

function startAdd(): void {
  if (submitting.value) return;
  editing.value = true;
  error.value = "";
  // nextTick so the input is in the DOM before we focus it.
  nextTick(() => inputRef.value?.focus());
}

function cancelAdd(): void {
  editing.value = false;
  draft.value = "";
  error.value = "";
}

async function commitAdd(): Promise<void> {
  if (submitting.value) return;
  const value = normalize(draft.value);

  // Empty submit (Enter on a blank field) just closes the input.
  if (!value) {
    cancelAdd();
    return;
  }

  const validationError = validate(value);
  if (validationError) {
    error.value = validationError;
    return;
  }

  // Silent no-op on duplicate — no need to error, the user's intent
  // is already satisfied by the existing tag.
  if (props.tags.includes(value)) {
    cancelAdd();
    return;
  }

  await patch([...props.tags, value]);
  if (!error.value) cancelAdd();
}

async function removeTag(tag: string): Promise<void> {
  if (submitting.value) return;
  await patch(props.tags.filter((t) => t !== tag));
}

async function patch(nextTags: string[]): Promise<void> {
  submitting.value = true;
  error.value = "";
  const ok = await hub.patchHost(props.hostId, { tags: nextTags });
  submitting.value = false;
  if (!ok) {
    // hub.error carries the server message; surface it locally so the
    // editor's own error region is the source of truth for this UX.
    error.value = hub.error || "Failed to save tags.";
  }
}

// Clear errors when the user starts typing again — they've moved on
// from the previous mistake.
watch(draft, () => {
  if (error.value) error.value = "";
});

// Cancel on Escape; commit on Enter.
function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    e.preventDefault();
    cancelAdd();
  } else if (e.key === "Enter") {
    e.preventDefault();
    commitAdd();
  }
}

// Blur cancels the input UNLESS we're submitting (the click on the
// add-button or the input losing focus mid-PATCH would otherwise
// reset state we still need). We also defer slightly so a click on
// a datalist suggestion completes before the field is torn down.
function onBlur(): void {
  setTimeout(() => {
    if (!submitting.value) cancelAdd();
  }, 120);
}
</script>

<template>
  <div class="tag-editor" :class="{ 'is-submitting': submitting }">
    <span
      v-for="tag in tags"
      :key="tag"
      class="user-tag"
    >
      <span class="user-tag-text">{{ tag }}</span>
      <button
        type="button"
        class="user-tag-remove"
        :title="`Remove ${tag}`"
        :aria-label="`Remove ${tag}`"
        :disabled="submitting"
        @click="removeTag(tag)"
      >×</button>
    </span>

    <button
      v-if="!editing"
      type="button"
      class="tag-add-trigger"
      :disabled="submitting"
      title="Add tag"
      aria-label="Add tag"
      @click="startAdd"
    >
      <font-awesome-icon icon="fa-solid fa-plus" />
      <span>tag</span>
    </button>

    <span v-else class="tag-add-form">
      <input
        ref="inputRef"
        v-model="draft"
        type="text"
        class="tag-add-input"
        :list="datalistId"
        :disabled="submitting"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        placeholder="e.g. edge"
        maxlength="32"
        @keydown="onKeydown"
        @blur="onBlur"
      />
      <datalist :id="datalistId">
        <option v-for="t in suggestions" :key="t" :value="t" />
      </datalist>
    </span>

    <span v-if="error" class="tag-error" role="alert">{{ error }}</span>
  </div>
</template>

<style scoped>
/* Single inline-flex cluster: chips, +tag trigger / inline input, and
   the validation error all sit on the same row, wrapping together
   when the row gets tight. The host view's .meta parent uses
   align-items: flex-start, so even if the editor wraps to multiple
   lines internally, the static os/arch/version siblings keep their
   natural height. */
.tag-editor {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  /* Submitting state dims everything subtly — visible feedback that a
     PATCH is in flight without blocking interaction tracks. */
  transition: opacity 140ms ease;
}
.tag-editor.is-submitting { opacity: 0.7; }

/* User tag chip — same chrome as .meta-tag but with an inline ×.
   The × is opacity-revealed on hover/focus so the row stays visually
   calm at rest. */
.user-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.16rem 0.3rem 0.16rem 0.55rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
  border: 1px solid rgba(148, 163, 184, 0.18);
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  transition: background 140ms ease, border-color 140ms ease;
}
.user-tag:hover { background: rgba(148, 163, 184, 0.18); }
body[data-theme="dark"] .user-tag {
  background: rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.16);
}
body[data-theme="dark"] .user-tag:hover { background: rgba(148, 163, 184, 0.14); }

.user-tag-text { line-height: 1.1; }

.user-tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.55;
  transition: color 140ms ease, background 140ms ease, opacity 140ms ease;
}
.user-tag:hover .user-tag-remove,
.user-tag-remove:focus-visible { opacity: 1; }
.user-tag-remove:hover {
  color: #b91c1c;
  background: rgba(244, 63, 94, 0.12);
}
.user-tag-remove:disabled { opacity: 0.4; cursor: not-allowed; }
body[data-theme="dark"] .user-tag-remove:hover { color: #fda4af; }

/* Add trigger — quieter than the chips so it reads as an affordance,
   not as another tag. Cyan accent on hover to signal interactivity. */
.tag-add-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.16rem 0.55rem;
  border-radius: 999px;
  background: transparent;
  border: 1px dashed rgba(148, 163, 184, 0.4);
  color: #94a3b8;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: color 140ms ease, border-color 140ms ease, background 140ms ease;
}
.tag-add-trigger:hover:not(:disabled) {
  color: #67e8f9;
  border-color: rgba(34, 211, 238, 0.5);
  background: rgba(34, 211, 238, 0.06);
  border-style: solid;
}
.tag-add-trigger:focus-visible {
  outline: 2px solid #22d3ee;
  outline-offset: 2px;
}
.tag-add-trigger:disabled { opacity: 0.5; cursor: not-allowed; }

/* The inline input is sized to mimic the chip metric — same height
   and pill shape so swapping between trigger and input doesn't shift
   the row. */
.tag-add-form {
  display: inline-flex;
  align-items: center;
}
.tag-add-input {
  width: 9rem;
  padding: 0.16rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(34, 211, 238, 0.4);
  color: #0f172a;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  outline: none;
  transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
}
.tag-add-input:focus {
  border-color: rgba(34, 211, 238, 0.7);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.18);
}
body[data-theme="dark"] .tag-add-input {
  background: rgba(15, 23, 42, 0.55);
  color: #e2e8f0;
  border-color: rgba(34, 211, 238, 0.4);
}

/* Validation error — sits inline next to the input. Wraps to a
   following line via the parent's flex-wrap when the row is tight.
   No width: 100% trick this time; the error is just another flex
   item, sized by its content. */
.tag-error {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  letter-spacing: 0.04em;
  color: #b91c1c;
  /* Soft pill so the error reads as a peer of the chips visually,
     not a stray bit of body copy. */
  padding: 0.16rem 0.55rem;
  border-radius: 999px;
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.32);
}
body[data-theme="dark"] .tag-error { color: #fda4af; }
</style>
