<script setup lang="ts">
type Tone = "blue" | "cyan" | "emerald" | "amber" | "purple" | "rose" | "neutral";
type Dir = "right" | "left";

withDefaults(
  defineProps<{
    /** Frame name shown on the message pill — e.g. `hello`, `samples`. */
    label: string;
    /** Optional second line under the arrow — frame contents in shorthand. */
    sub?: string;
    /** Direction of the message arrow. `right` → toward the right actor. */
    dir?: Dir;
    tone?: Tone;
    /**
     * Optional cadence header rendered in the right gutter, outside the
     * right lifeline. Used to group consecutive frames into a phase
     * (e.g. "stream — every 1 s").
     */
    phase?: string;
    phaseSub?: string;
    /** Disables the data-flow pulse for cases where it'd be misleading. */
    static?: boolean;
  }>(),
  { dir: "right", tone: "blue", static: false },
);
</script>

<template>
  <div
    class="arch-seq-frame"
    :class="[`tone-${tone}`, `dir-${dir}`, { 'is-static': static }]"
  >
    <!-- Message column: pill, line, sub. Spans the gap between lifelines. -->
    <div class="seq-frame-message">
      <div class="seq-frame-pill">{{ label }}</div>
      <div class="seq-frame-line" role="presentation">
        <span v-if="dir === 'left'" class="seq-frame-head head-left" aria-hidden="true" />
        <span class="seq-frame-track">
          <span v-if="!static" class="seq-frame-pulse" />
        </span>
        <span v-if="dir === 'right'" class="seq-frame-head head-right" aria-hidden="true" />
      </div>
      <div v-if="sub" class="seq-frame-sub">{{ sub }}</div>
    </div>

    <!-- Optional phase annotation in the right gutter. -->
    <div v-if="phase" class="seq-frame-phase" aria-hidden="false">
      <strong>{{ phase }}</strong>
      <span v-if="phaseSub">{{ phaseSub }}</span>
    </div>
  </div>
</template>

<style scoped>
.arch-seq-frame {
  --tone-fg: #94a3b8;
  --tone-bg: rgba(148, 163, 184, 0.12);
  --tone-bd: rgba(148, 163, 184, 0.35);
  position: relative;
  padding: 0.7rem 0;
}

/* ── Message column ────────────────────────────────────────────────────
   Spans 22% → 78% of the frame, exactly between the two lifelines drawn
   by the parent ArchSequence. width = 56%, margin-left = 22%. */
.seq-frame-message {
  width: 56%;
  margin-left: 22%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
}

/* The protocol-name pill — small and tone-coloured, sits above the line. */
.seq-frame-pill {
  align-self: center;
  padding: 0.18rem 0.65rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--tone-fg);
  background: var(--tone-bg);
  border: 1px solid var(--tone-bd);
  white-space: nowrap;
}

/* ── Arrow line ─────────────────────────────────────────────────────────
   A 2px gradient track flanked by an optional CSS-triangle arrow head
   on the directional end. An animated pulse slides along the track
   to suggest data flow — direction-aware via dir-{right,left} class. */
.seq-frame-line {
  position: relative;
  display: flex;
  align-items: center;
  height: 2px;
  width: 100%;
}
.seq-frame-track {
  position: relative;
  flex: 1 1 auto;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0,
    var(--tone-fg) 14%,
    var(--tone-fg) 86%,
    transparent 100%
  );
  overflow: hidden;
}
.seq-frame-pulse {
  position: absolute;
  top: 50%;
  left: 0;
  width: 8px;
  height: 8px;
  margin-top: -4px;
  border-radius: 50%;
  background: var(--tone-fg);
  filter: drop-shadow(0 0 4px var(--tone-fg));
  opacity: 0.85;
  animation: seq-flow 2.6s linear infinite;
}
.dir-left .seq-frame-pulse { animation-name: seq-flow-rev; }
.is-static .seq-frame-pulse { display: none; }
@media (prefers-reduced-motion: reduce) {
  .seq-frame-pulse { display: none; }
}

@keyframes seq-flow {
  0%, 8%   { transform: translateX(0%); opacity: 0; }
  18%      { opacity: 0.85; }
  85%      { opacity: 0.85; }
  100%     { transform: translateX(calc(100% - 8px)); opacity: 0; }
}
@keyframes seq-flow-rev {
  0%, 8%   { transform: translateX(calc(100% - 8px)); opacity: 0; }
  18%      { opacity: 0.85; }
  85%      { opacity: 0.85; }
  100%     { transform: translateX(0%); opacity: 0; }
}

/* CSS triangle arrow heads. */
.seq-frame-head {
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  flex-shrink: 0;
}
.head-right {
  border-left: 7px solid var(--tone-fg);
  margin-left: -1px;
}
.head-left {
  border-right: 7px solid var(--tone-fg);
  margin-right: -1px;
}

/* The shorthand line under the arrow — wire field hints, etc. */
.seq-frame-sub {
  align-self: center;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  color: #64748b;
  letter-spacing: 0.01em;
  text-align: center;
  max-width: 90%;
}
body[data-theme="dark"] .seq-frame-sub { color: #94a3b8; }

/* ── Phase annotation (right gutter) ──────────────────────────────────── */
.seq-frame-phase {
  position: absolute;
  top: 50%;
  right: 0.4rem;
  transform: translateY(-50%);
  width: 18%;
  padding-left: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  border-left: 1px dashed rgba(148, 163, 184, 0.32);
}
.seq-frame-phase strong {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #475569;
}
body[data-theme="dark"] .seq-frame-phase strong { color: #cbd5e1; }
.seq-frame-phase span {
  font-size: 0.66rem;
  color: #64748b;
  letter-spacing: 0.02em;
}
body[data-theme="dark"] .seq-frame-phase span { color: #94a3b8; }

/* ── Tone palette — same keys as the rest of help-diagram. ────────────── */
.arch-seq-frame.tone-blue    { --tone-fg: #2563eb; --tone-bg: rgba(96, 165, 250, 0.14);  --tone-bd: rgba(96, 165, 250, 0.40); }
.arch-seq-frame.tone-cyan    { --tone-fg: #0891b2; --tone-bg: rgba(34, 211, 238, 0.14);  --tone-bd: rgba(34, 211, 238, 0.40); }
.arch-seq-frame.tone-emerald { --tone-fg: #059669; --tone-bg: rgba(52, 211, 153, 0.14);  --tone-bd: rgba(52, 211, 153, 0.40); }
.arch-seq-frame.tone-amber   { --tone-fg: #d97706; --tone-bg: rgba(251, 191, 36, 0.16);  --tone-bd: rgba(251, 191, 36, 0.45); }
.arch-seq-frame.tone-purple  { --tone-fg: #7c3aed; --tone-bg: rgba(167, 139, 250, 0.14); --tone-bd: rgba(167, 139, 250, 0.40); }
.arch-seq-frame.tone-rose    { --tone-fg: #e11d48; --tone-bg: rgba(244, 114, 182, 0.14); --tone-bd: rgba(244, 114, 182, 0.40); }
.arch-seq-frame.tone-neutral { --tone-fg: #64748b; --tone-bg: rgba(148, 163, 184, 0.10); --tone-bd: rgba(148, 163, 184, 0.30); }

body[data-theme="dark"] .arch-seq-frame.tone-blue    { --tone-fg: #60a5fa; }
body[data-theme="dark"] .arch-seq-frame.tone-cyan    { --tone-fg: #22d3ee; }
body[data-theme="dark"] .arch-seq-frame.tone-emerald { --tone-fg: #34d399; }
body[data-theme="dark"] .arch-seq-frame.tone-amber   { --tone-fg: #fbbf24; }
body[data-theme="dark"] .arch-seq-frame.tone-purple  { --tone-fg: #a78bfa; }
body[data-theme="dark"] .arch-seq-frame.tone-rose    { --tone-fg: #fb7185; }
body[data-theme="dark"] .arch-seq-frame.tone-neutral { --tone-fg: #94a3b8; }
</style>
