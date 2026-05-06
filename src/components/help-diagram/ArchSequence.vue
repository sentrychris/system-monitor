<script setup lang="ts">
type Tone = "blue" | "cyan" | "emerald" | "amber" | "purple" | "rose" | "neutral";

withDefaults(
  defineProps<{
    caption?: string;
    leftActor: string;
    rightActor: string;
    leftSub?: string;
    rightSub?: string;
    leftIcon?: string;
    rightIcon?: string;
    leftTone?: Tone;
    rightTone?: Tone;
  }>(),
  { leftTone: "blue", rightTone: "amber" },
);
</script>

<template>
  <figure
    class="arch-sequence"
    :role="caption ? 'group' : undefined"
    :aria-label="caption"
  >
    <!-- Actors row: two cards at the heads of their lifelines. -->
    <div class="seq-actors">
      <div class="seq-actor seq-actor-left" :class="`tone-${leftTone}`">
        <span v-if="leftIcon" class="seq-actor-icon" aria-hidden="true">
          <font-awesome-icon :icon="`fa-solid ${leftIcon}`" />
        </span>
        <span class="seq-actor-body">
          <span class="seq-actor-title">{{ leftActor }}</span>
          <span v-if="leftSub" class="seq-actor-sub">{{ leftSub }}</span>
        </span>
      </div>
      <div class="seq-actor seq-actor-right" :class="`tone-${rightTone}`">
        <span v-if="rightIcon" class="seq-actor-icon" aria-hidden="true">
          <font-awesome-icon :icon="`fa-solid ${rightIcon}`" />
        </span>
        <span class="seq-actor-body">
          <span class="seq-actor-title">{{ rightActor }}</span>
          <span v-if="rightSub" class="seq-actor-sub">{{ rightSub }}</span>
        </span>
      </div>
    </div>

    <!-- Track: holds the frame rows, lifelines drawn via ::before/::after.
         Two vertical pseudo-elements descend through the entire track at the
         same x positions the actor cards are anchored to. -->
    <div class="seq-track">
      <slot />
    </div>

    <figcaption v-if="caption" class="seq-caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.arch-sequence {
  margin: 1rem;
  padding: 1.4rem 1.15rem 1.5rem;
  background:
    radial-gradient(circle at 18% 8%, rgba(56, 189, 248, 0.07), transparent 55%),
    radial-gradient(circle at 84% 90%, rgba(167, 139, 250, 0.06), transparent 60%),
    rgba(15, 23, 42, 0.025);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow-x: auto;
}
body[data-theme="dark"] .arch-sequence {
  background:
    radial-gradient(circle at 18% 8%, rgba(56, 189, 248, 0.10), transparent 55%),
    radial-gradient(circle at 84% 90%, rgba(167, 139, 250, 0.10), transparent 60%),
    rgba(10, 14, 23, 0.55);
  border-color: rgba(148, 163, 184, 0.18);
}

/* ── Actors row ─────────────────────────────────────────────────────────
   The two actor cards anchor over the two lifelines. Absolute positioning
   with translateX(-50%) centers each card on its lifeline regardless of
   card width, so changing the title text doesn't break alignment. */
.seq-actors {
  position: relative;
  height: 3.2rem;
  margin-bottom: 0.5rem;
}
.seq-actor {
  --tone-fg: #475569;
  --tone-bg: rgba(148, 163, 184, 0.10);
  --tone-bd: rgba(148, 163, 184, 0.35);
  position: absolute;
  top: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.8rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.6));
  border: 1px solid var(--tone-bd);
  border-bottom: 3px solid var(--tone-fg);
  border-radius: 9px;
  white-space: nowrap;
  z-index: 2;
}
body[data-theme="dark"] .seq-actor {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.8));
}
.seq-actor-left  { left: 22%;  transform: translateX(-50%); }
.seq-actor-right { left: 78%;  transform: translateX(-50%); }

.seq-actor-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 7px;
  background: var(--tone-bg);
  color: var(--tone-fg);
  font-size: 0.85rem;
}
.seq-actor-body {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}
.seq-actor-title {
  font-weight: 700;
  font-size: 0.88rem;
  color: #0f172a;
  letter-spacing: -0.005em;
}
body[data-theme="dark"] .seq-actor-title { color: #f1f5f9; }
.seq-actor-sub {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  color: #64748b;
}
body[data-theme="dark"] .seq-actor-sub { color: #94a3b8; }

/* ── Tone palette for actors. Same keys as ArchNode/ArchEdge. ─────────── */
.seq-actor.tone-blue    { --tone-fg: #2563eb; --tone-bg: rgba(96, 165, 250, 0.14);  --tone-bd: rgba(96, 165, 250, 0.40); }
.seq-actor.tone-cyan    { --tone-fg: #0891b2; --tone-bg: rgba(34, 211, 238, 0.14);  --tone-bd: rgba(34, 211, 238, 0.40); }
.seq-actor.tone-emerald { --tone-fg: #059669; --tone-bg: rgba(52, 211, 153, 0.14);  --tone-bd: rgba(52, 211, 153, 0.40); }
.seq-actor.tone-amber   { --tone-fg: #d97706; --tone-bg: rgba(251, 191, 36, 0.16);  --tone-bd: rgba(251, 191, 36, 0.45); }
.seq-actor.tone-purple  { --tone-fg: #7c3aed; --tone-bg: rgba(167, 139, 250, 0.14); --tone-bd: rgba(167, 139, 250, 0.40); }
.seq-actor.tone-rose    { --tone-fg: #e11d48; --tone-bg: rgba(244, 114, 182, 0.14); --tone-bd: rgba(244, 114, 182, 0.40); }
.seq-actor.tone-neutral { --tone-fg: #64748b; }
body[data-theme="dark"] .seq-actor.tone-blue    { --tone-fg: #60a5fa; }
body[data-theme="dark"] .seq-actor.tone-cyan    { --tone-fg: #22d3ee; }
body[data-theme="dark"] .seq-actor.tone-emerald { --tone-fg: #34d399; }
body[data-theme="dark"] .seq-actor.tone-amber   { --tone-fg: #fbbf24; }
body[data-theme="dark"] .seq-actor.tone-purple  { --tone-fg: #a78bfa; }
body[data-theme="dark"] .seq-actor.tone-rose    { --tone-fg: #fb7185; }

/* ── Track + lifelines ──────────────────────────────────────────────────
   Two vertical lines descend through the entire frame stack at 22% and
   78% — the same offsets the actor cards are pinned to. The gradient
   fades out near the very top/bottom so the line doesn't jam visually
   into the actor cards or the bottom of the diagram. */
.seq-track {
  position: relative;
  padding: 0.4rem 0 0.7rem;
  min-height: 2rem;
}
.seq-track::before,
.seq-track::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(148, 163, 184, 0.42) 6%,
    rgba(148, 163, 184, 0.42) 94%,
    transparent 100%
  );
  pointer-events: none;
}
.seq-track::before { left: 22%; transform: translateX(-50%); }
.seq-track::after  { left: 78%; transform: translateX(-50%); }
body[data-theme="dark"] .seq-track::before,
body[data-theme="dark"] .seq-track::after {
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(148, 163, 184, 0.32) 6%,
    rgba(148, 163, 184, 0.32) 94%,
    transparent 100%
  );
}

.seq-caption {
  margin: 0.85rem 0 0;
  text-align: center;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #64748b;
}
body[data-theme="dark"] .seq-caption { color: #94a3b8; }

/* Narrow viewports: keep the same layout but allow horizontal scroll.
   A sequence diagram doesn't degrade naturally to a vertical stack —
   the two-actor split is the whole point — so a min-width keeps the
   visual relationships intact while the container scrolls. */
@media (max-width: 720px) {
  .arch-sequence > * { min-width: 32rem; }
}
</style>
