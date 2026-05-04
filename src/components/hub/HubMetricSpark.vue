<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { config } from "@/config";
import { hubApi } from "@/api/hub";
import { useHubStore } from "@/stores/hub";
import type { SeriesPoint } from "@/interfaces/Hub";

type Tone = "blue" | "cyan" | "emerald" | "purple" | "amber" | "rose";

const props = withDefaults(
  defineProps<{
    hostId: number;
    metric: string;
    dim?: string;
    label: string;
    tone?: Tone;
    unit?: string;
    decimals?: number;
    /** Window in seconds — defaults to 5 minutes. */
    windowS?: number;
  }>(),
  {
    dim: "",
    tone: "cyan",
    unit: "",
    decimals: 1,
    windowS: 300,
  },
);

const TONES: Record<Tone, { primary: string; secondary: string; glow: string }> = {
  blue:    { primary: "#60a5fa", secondary: "#93c5fd", glow: "rgba(96, 165, 250, 0.55)" },
  cyan:    { primary: "#22d3ee", secondary: "#67e8f9", glow: "rgba(34, 211, 238, 0.55)" },
  emerald: { primary: "#10b981", secondary: "#34d399", glow: "rgba(16, 185, 129, 0.55)" },
  purple:  { primary: "#a78bfa", secondary: "#c4b5fd", glow: "rgba(167, 139, 250, 0.55)" },
  amber:   { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245, 158, 11, 0.55)" },
  rose:    { primary: "#f43f5e", secondary: "#fb7185", glow: "rgba(244, 63, 94, 0.55)" },
};

const hub = useHubStore();
const points = ref<SeriesPoint[]>([]);
const error = ref("");
let timer: number | null = null;

const tone = computed(() => TONES[props.tone]);

const latestValue = computed(() => {
  if (!points.value.length) return null;
  const p = points.value[points.value.length - 1];
  return p.v ?? p.avg ?? null;
});

const formattedLatest = computed(() => {
  const v = latestValue.value;
  return v === null ? "—" : v.toFixed(props.decimals);
});

const path = computed(() => {
  if (points.value.length < 2) return "";
  const values = points.value.map((p) => p.v ?? p.avg ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 280, H = 56;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 6) - 3;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
});

const fillPath = computed(() => {
  if (!path.value) return "";
  return `${path.value} L 280 56 L 0 56 Z`;
});

const uid = `hms-${Math.random().toString(36).slice(2, 9)}`;

async function fetchSeries() {
  if (!hub.token || !config.hub.url) return;
  try {
    const end = Math.floor(Date.now() / 1000);
    const start = end - props.windowS;
    const resp = await hubApi.getSeries(
      { baseUrl: config.hub.url, token: hub.token },
      props.hostId,
      props.metric,
      { dim: props.dim, start, end },
    );
    points.value = resp.points;
    error.value = "";
  } catch (e) {
    error.value = (e as Error).message || "load failed";
  }
}

onMounted(() => {
  fetchSeries();
  timer = window.setInterval(fetchSeries, config.hub.pollInterval);
});
onUnmounted(() => {
  if (timer !== null) window.clearInterval(timer);
});
watch(() => [props.hostId, props.metric, props.dim], fetchSeries);
</script>

<template>
  <div class="spark">
    <div class="spark-head">
      <span class="spark-label">{{ label }}</span>
      <span class="spark-value metric-num" :style="{ color: tone.primary }">
        {{ formattedLatest }}<span class="spark-unit">{{ unit }}</span>
      </span>
    </div>
    <svg class="spark-svg" viewBox="0 0 280 56" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-stroke`" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" :stop-color="tone.secondary" />
          <stop offset="100%" :stop-color="tone.primary" />
        </linearGradient>
        <linearGradient :id="`${uid}-fill`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="tone.primary" stop-opacity="0.25" />
          <stop offset="100%" :stop-color="tone.primary" stop-opacity="0" />
        </linearGradient>
        <filter :id="`${uid}-blur`" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <path v-if="fillPath" :d="fillPath" :fill="`url(#${uid}-fill)`" />
      <path v-if="path" :d="path" fill="none" :stroke="tone.glow" stroke-width="4"
            :filter="`url(#${uid}-blur)`" stroke-linecap="round" stroke-linejoin="round" />
      <path v-if="path" :d="path" fill="none" :stroke="`url(#${uid}-stroke)`"
            stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <div v-if="error" class="spark-error">{{ error }}</div>
  </div>
</template>

<style scoped>
.spark { padding: 0.85rem 1rem 0.85rem; }
.spark-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 0.5rem; margin-bottom: 0.4rem;
}
.spark-label {
  font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;
  color: #6b7280;
}
body[data-theme="dark"] .spark-label { color: #94a3b8; }

.spark-value {
  font-family: "Montserrat", "IBM Plex Mono", monospace;
  font-feature-settings: "tnum";
  font-variant-numeric: tabular-nums;
  font-size: 1.4rem;
  font-weight: 400;
  letter-spacing: 0.005em;
  line-height: 1;
}
.spark-unit {
  font-size: 0.55em;
  color: #94a3b8;
  margin-left: 0.15rem;
  font-weight: 500;
}
body[data-theme="dark"] .spark-unit { color: #64748b; }

.spark-svg {
  display: block;
  width: 100%;
  height: 64px;
}
.spark-error {
  margin-top: 0.3rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  color: #b91c1c;
}
body[data-theme="dark"] .spark-error { color: #f87171; }
</style>
