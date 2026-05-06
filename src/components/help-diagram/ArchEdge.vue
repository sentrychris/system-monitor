<script setup lang="ts">
import { computed } from "vue";

type Tone = "blue" | "cyan" | "emerald" | "amber" | "purple" | "rose" | "neutral";
type Dir = "right" | "left" | "both";

const props = withDefaults(
  defineProps<{
    label?: string;
    /** Sub-label rendered below the line — useful for protocol or rate hints. */
    sub?: string;
    /** Arrow direction. `right` (default) → forward, `left` ← reverse, `both` ↔. */
    dir?: Dir;
    tone?: Tone;
    /**
     * Number of stacked arrows. Used when the adjacent stage has multiple
     * nodes and we want one arrow per row (e.g. two collectors → hub).
     */
    count?: number;
    /** Disables the data-flow animation for cases where it'd be misleading. */
    static?: boolean;
  }>(),
  { dir: "right", tone: "blue", count: 1, static: false },
);

const arrows = computed(() => Array.from({ length: Math.max(1, props.count) }));
</script>

<template>
  <div class="arch-edge" :class="[`tone-${tone}`, `dir-${dir}`, { 'is-static': static }]">
    <div class="arch-edge-stack">
      <div
        v-for="(_, idx) in arrows"
        :key="idx"
        class="arch-edge-line"
        :class="[`dir-${dir}`]"
        role="presentation"
      >
        <span v-if="dir !== 'right'" class="arch-edge-head head-left" aria-hidden="true" />
        <span class="arch-edge-track">
          <span v-if="!static" class="arch-edge-pulse" :style="{ animationDelay: `${idx * 0.4}s` }" />
        </span>
        <span v-if="dir !== 'left'" class="arch-edge-head head-right" aria-hidden="true" />
      </div>
    </div>
    <div v-if="label || sub" class="arch-edge-label">
      <span v-if="label" class="arch-edge-label-main">{{ label }}</span>
      <span v-if="sub" class="arch-edge-label-sub">{{ sub }}</span>
    </div>
  </div>
</template>

<style scoped>
.arch-edge {
  --edge-fg: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 5.5rem;
  min-width: 5.5rem;
  padding: 0 0.4rem;
  position: relative;
}

.arch-edge-stack {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: 100%;
  /* Mirror ArchStage's `space-around` so a two-arrow edge lines up
     vertically with the two nodes in an adjacent stage. */
  justify-content: space-around;
}

.arch-edge-line {
  position: relative;
  display: flex;
  align-items: center;
  height: 2px;
  width: 100%;
}

.arch-edge-track {
  position: relative;
  flex: 1 1 auto;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0,
    var(--edge-fg) 14%,
    var(--edge-fg) 86%,
    transparent 100%
  );
  overflow: hidden;
}

/* Animated pulse — a small dot sliding along the track to suggest flow. */
.arch-edge-pulse {
  position: absolute;
  top: 50%;
  left: 0;
  width: 8px;
  height: 8px;
  margin-top: -4px;
  border-radius: 50%;
  background: var(--edge-fg);
  filter: drop-shadow(0 0 4px var(--edge-fg));
  animation: arch-edge-flow 2.6s linear infinite;
  opacity: 0.85;
}
.dir-left .arch-edge-pulse { animation-name: arch-edge-flow-rev; }
.dir-both .arch-edge-pulse { animation-name: arch-edge-flow-both; animation-duration: 3.2s; }
.is-static .arch-edge-pulse { display: none; }

@keyframes arch-edge-flow {
  0%, 8%   { transform: translateX(0%); opacity: 0; }
  18%      { opacity: 0.85; }
  85%      { opacity: 0.85; }
  100%     { transform: translateX(calc(100% - 8px)); opacity: 0; }
}
@keyframes arch-edge-flow-rev {
  0%, 8%   { transform: translateX(calc(100% - 8px)); opacity: 0; }
  18%      { opacity: 0.85; }
  85%      { opacity: 0.85; }
  100%     { transform: translateX(0%); opacity: 0; }
}
@keyframes arch-edge-flow-both {
  0%       { transform: translateX(0%); opacity: 0; }
  10%      { opacity: 0.85; }
  45%      { transform: translateX(calc(100% - 8px)); opacity: 0.85; }
  50%      { transform: translateX(calc(100% - 8px)); opacity: 0; }
  55%      { transform: translateX(calc(100% - 8px)); opacity: 0.85; }
  90%      { transform: translateX(0%); opacity: 0.85; }
  100%     { transform: translateX(0%); opacity: 0; }
}

/* Arrow heads — pure CSS triangles. */
.arch-edge-head {
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  flex-shrink: 0;
}
.head-right {
  border-left: 7px solid var(--edge-fg);
  margin-left: -1px;
}
.head-left {
  border-right: 7px solid var(--edge-fg);
  margin-right: -1px;
}

/* Label cluster sits below the centermost edge. */
.arch-edge-label {
  margin-top: 0.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.arch-edge-label-main {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--edge-fg);
  letter-spacing: 0.02em;
}
.arch-edge-label-sub {
  font-size: 0.66rem;
  color: #64748b;
}
body[data-theme="dark"] .arch-edge-label-sub { color: #94a3b8; }

/* Tone palette — same keys as ArchNode. Default `neutral` is a quiet slate. */
.arch-edge.tone-blue    { --edge-fg: #3b82f6; }
.arch-edge.tone-cyan    { --edge-fg: #22d3ee; }
.arch-edge.tone-emerald { --edge-fg: #10b981; }
.arch-edge.tone-amber   { --edge-fg: #f59e0b; }
.arch-edge.tone-purple  { --edge-fg: #8b5cf6; }
.arch-edge.tone-rose    { --edge-fg: #f43f5e; }
.arch-edge.tone-neutral { --edge-fg: #94a3b8; }

body[data-theme="dark"] .arch-edge.tone-blue    { --edge-fg: #60a5fa; }
body[data-theme="dark"] .arch-edge.tone-cyan    { --edge-fg: #22d3ee; }
body[data-theme="dark"] .arch-edge.tone-emerald { --edge-fg: #34d399; }
body[data-theme="dark"] .arch-edge.tone-amber   { --edge-fg: #fbbf24; }
body[data-theme="dark"] .arch-edge.tone-purple  { --edge-fg: #a78bfa; }
body[data-theme="dark"] .arch-edge.tone-rose    { --edge-fg: #fb7185; }
body[data-theme="dark"] .arch-edge.tone-neutral { --edge-fg: #94a3b8; }

/* Honor reduced-motion preference. */
@media (prefers-reduced-motion: reduce) {
  .arch-edge-pulse { display: none; }
}

/* ─── Narrow viewport: vertical stack mode ────────────────────────────────
   The parent ArchDiagram switches its track to flex-direction: column at
   the same breakpoint. Each edge collapses to a single down/up arrow with
   the label beside it — the multi-arrow `count` is irrelevant once nodes
   stack vertically (one stage per row). */
@media (max-width: 720px) {
  .arch-edge {
    flex: 0 0 auto;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    width: 100%;
    min-width: 0;
    padding: 0.2rem 0;
  }

  /* Hide the horizontal arrow stack; replace with a single arrow glyph. */
  .arch-edge-stack { display: none; }

  .arch-edge::before {
    content: "↓";
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 1.2rem;
    line-height: 1;
    color: var(--edge-fg);
    font-weight: 700;
    filter: drop-shadow(0 0 4px var(--edge-fg));
  }
  .arch-edge.dir-left::before { content: "↑"; }
  .arch-edge.dir-both::before { content: "↕"; }

  .arch-edge-label {
    margin-top: 0;
    text-align: left;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.45rem;
  }
}
</style>
