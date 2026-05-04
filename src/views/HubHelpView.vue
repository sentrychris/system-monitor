<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useLoadingStore } from "@/stores/loading";
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Alerts Help Section");

onMounted(() => {
  useLoadingStore().toggle(true);
});
</script>

<template>
  <div class="container-fluid py-3 help-page">
    <div class="back-link">
      <RouterLink to="/hub" class="back">
        <font-awesome-icon icon="fa-solid fa-arrow-left" />
        <span>Back to hub</span>
      </RouterLink>
    </div>

    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Alerts" />

    <p class="lede">
      The hub watches every Collector's incoming samples against a list of
      <strong>rules</strong>. When a rule's threshold is sustained for long
      enough, the matching <strong>channel</strong> (Slack, Discord, or any
      webhook) is dispatched. The lifecycle of every <code>(rule, host)</code>
      pair is a small three-state machine — this page explains what each
      state means, when transitions happen, and what they look like in the
      data.
    </p>

    <!-- ─── At-a-glance state legend ─────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-list-ul" /></span>
        <div>
          <div class="help-title">The three states</div>
          <div class="help-sub">PER (RULE, HOST) · ALWAYS EXACTLY ONE</div>
        </div>
      </header>

      <dl class="state-grid">
        <div class="state-row state-ok">
          <span class="state-pill"><span class="sp-dot"></span>OK</span>
          <dd>Threshold not violated. Nothing to do.</dd>
        </div>
        <div class="state-row state-breaching">
          <span class="state-pill"><span class="sp-dot"></span>BREACHING</span>
          <dd>
            Threshold <em>just</em> started being violated. The hub is
            timing it but hasn't told anyone yet — if the metric recovers
            within <code>for_seconds</code>, the breach is silently
            forgotten. This is the spam filter: a 5-second CPU spike during
            a deploy shouldn't page the oncall.
          </dd>
        </div>
        <div class="state-row state-firing">
          <span class="state-pill"><span class="sp-dot"></span>FIRING</span>
          <dd>
            Threshold has been violated continuously for at least
            <code>for_seconds</code>. The hub has dispatched the configured
            channel and recorded a <code>fired</code> event. Stays in this
            state until the metric recovers.
          </dd>
        </div>
      </dl>
    </section>

    <!-- ─── State-machine diagram ────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-code-branch" /></span>
        <div>
          <div class="help-title">Transitions</div>
          <div class="help-sub">FROM → TO · WHEN · SIDE-EFFECTS</div>
        </div>
      </header>

      <ol class="transition-list">
        <li>
          <span class="state-pill state-ok"><span class="sp-dot"></span>OK</span>
          <span class="trans-arrow" aria-hidden="true">→</span>
          <span class="state-pill state-breaching"><span class="sp-dot"></span>BREACHING</span>
          <span class="trans-when">when the metric first crosses the threshold</span>
          <span class="trans-fx">no dispatch</span>
        </li>
        <li>
          <span class="state-pill state-breaching"><span class="sp-dot"></span>BREACHING</span>
          <span class="trans-arrow" aria-hidden="true">→</span>
          <span class="state-pill state-firing"><span class="sp-dot"></span>FIRING</span>
          <span class="trans-when">when the breach has persisted for ≥ <code>for_seconds</code></span>
          <span class="trans-fx fx-fire">dispatch <code>fired</code> + write event</span>
        </li>
        <li>
          <span class="state-pill state-breaching"><span class="sp-dot"></span>BREACHING</span>
          <span class="trans-arrow" aria-hidden="true">→</span>
          <span class="state-pill state-ok"><span class="sp-dot"></span>OK</span>
          <span class="trans-when">when the metric recovers <em>before</em> <code>for_seconds</code> elapses</span>
          <span class="trans-fx">silent — no dispatch, no event</span>
        </li>
        <li>
          <span class="state-pill state-firing"><span class="sp-dot"></span>FIRING</span>
          <span class="trans-arrow" aria-hidden="true">→</span>
          <span class="state-pill state-ok"><span class="sp-dot"></span>OK</span>
          <span class="trans-when">when the metric recovers</span>
          <span class="trans-fx fx-resolve">dispatch <code>resolved</code> + write event</span>
        </li>
      </ol>
    </section>

    <!-- ─── Two example timelines ────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-wave-square" /></span>
        <div>
          <div class="help-title">Two timelines</div>
          <div class="help-sub">SAME RULE · DIFFERENT OUTCOMES</div>
        </div>
      </header>

      <p class="example-intro">
        Rule: <code>cpu.usage &gt; 90</code>, <code>for_seconds = 60</code>,
        channel = <code>#ops-alerts</code>.
      </p>

      <div class="example">
        <div class="example-eyebrow">— SPIKE THAT RECOVERS</div>
        <pre class="timeline"><span class="t">t=0s   </span><span class="metric">cpu = 30%</span>   <span class="state state-ok">ok</span>
<span class="t">t=10s  </span><span class="metric">cpu = 95%</span>   <span class="state state-breaching">breaching</span>   breach starts
<span class="t">t=35s  </span><span class="metric">cpu = 95%</span>   <span class="state state-breaching">breaching</span>   25s elapsed (still &lt; 60)
<span class="t">t=40s  </span><span class="metric">cpu = 60%</span>   <span class="state state-ok">ok</span>          <span class="comment"># recovered before fire — silent</span></pre>
      </div>

      <div class="example">
        <div class="example-eyebrow">— SUSTAINED BREACH</div>
        <pre class="timeline"><span class="t">t=0s   </span><span class="metric">cpu = 30%</span>   <span class="state state-ok">ok</span>
<span class="t">t=10s  </span><span class="metric">cpu = 95%</span>   <span class="state state-breaching">breaching</span>   breach starts
<span class="t">t=70s  </span><span class="metric">cpu = 95%</span>   <span class="state state-firing">firing</span>      <span class="comment"># 60s elapsed → dispatch &quot;fired&quot; to #ops-alerts</span>
<span class="t">t=120s </span><span class="metric">cpu = 50%</span>   <span class="state state-ok">ok</span>          <span class="comment"># recovered → dispatch &quot;resolved&quot;</span></pre>
      </div>
    </section>

    <!-- ─── Edge cases ───────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-rose"><font-awesome-icon icon="fa-solid fa-exclamation-triangle" /></span>
        <div>
          <div class="help-title">Edge cases</div>
          <div class="help-sub">DISPATCH FAILURES</div>
        </div>
      </header>

      <dl class="state-grid">
        <div class="state-row">
          <span class="state-pill state-breaching"><span class="sp-dot"></span>STUCK BREACHING</span>
          <dd>
            If the dispatch fails on the <code>BREACHING → FIRING</code>
            edge (Slack down, webhook 500, etc.), the state machine stays
            in <code>breaching</code> and retries on the next eval tick. An
            alert that sits past <code>for_seconds</code> without
            transitioning to <code>firing</code> usually means the channel
            is broken — check the hub logs for
            <code>alert.dispatch_failed</code>.
          </dd>
        </div>
        <div class="state-row">
          <span class="state-pill state-firing"><span class="sp-dot"></span>ALWAYS RESOLVES</span>
          <dd>
            On the <code>FIRING → OK</code> edge, the state advances even
            if the resolved-dispatch fails. Otherwise a deleted webhook
            would wedge an alert in <code>firing</code> forever. The
            <code>resolved</code> event is still written to
            <code>alert_events</code> so the history stays correct; only
            the channel notification is lost.
          </dd>
        </div>
      </dl>
    </section>

    <!-- ─── Where it lives ────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-server" /></span>
        <div>
          <div class="help-title">Where the data lives</div>
          <div class="help-sub">SQLITE · TWO TABLES</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>alert_state</code></dt>
        <dd>
          One row per <code>(rule_id, host_id)</code>. The current
          <code>state</code>, <code>breach_started_at</code>,
          <code>fired_at</code>, and last observed value. Read by the
          Health card on each host page and by the fleet alerts list.
        </dd>
        <dt><code>alert_events</code></dt>
        <dd>
          Append-only log of <code>fired</code> and <code>resolved</code>
          transitions. Powers the alert-history view and is what gets
          retained beyond the rolling
          <code>alert_state</code> snapshot.
        </dd>
      </dl>
    </section>

    <!-- ─── Creating rules pointer ────────────────────────────────── -->
    <section class="help-section help-cta">
      <div>
        <div class="help-cta-eyebrow">— SETTING UP RULES</div>
        <p>
          Rules are created via the admin API. See <code>ALERTS.md</code>
          on the hub host for the full quickstart, including channel
          setup for Slack, Discord, and generic webhooks.
        </p>
        <pre class="cta-cmd"><span class="prompt">$</span> cat ~/vigil-pro/ALERTS.md</pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.help-page {
  padding-bottom: 3rem;
  max-width: 980px;
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

.lede {
  font-family: "Lato", "Montserrat", system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.65;
  color: #475569;
  margin: 1rem 0 2rem;
  max-width: 72ch;
}
body[data-theme="dark"] .lede { color: #cbd5e1; }
.lede strong {
  color: #0f172a;
  font-weight: 600;
}
body[data-theme="dark"] .lede strong { color: #f1f5f9; }

/* ── Section frame — panel-card recipe (BRANDING §8.2) ───────────── */
.help-section {
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
  margin-bottom: 1.4rem;
}
body[data-theme="dark"] .help-section {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(148, 163, 184, 0.14);
  box-shadow:
    0 0 0 1px rgba(96, 165, 250, 0.05) inset,
    0 8px 24px -8px rgba(0, 0, 0, 0.55),
    0 28px 56px -18px rgba(0, 0, 0, 0.6);
}

.help-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #111827 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(96, 165, 250, 0.22);
  position: relative;
  overflow: hidden;
}
.help-header::before {
  content: ""; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(96, 165, 250, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 165, 250, 0.04) 1px, transparent 1px);
  background-size: 32px 32px; opacity: 0.55; pointer-events: none;
}
.help-header::after {
  content: ""; position: absolute; inset: 0;
  background:
    radial-gradient(700px circle at 0% 0%,    rgba(59, 130, 246, 0.14), transparent 50%),
    radial-gradient(500px circle at 100% 100%, rgba(34, 211, 238, 0.08), transparent 50%);
  pointer-events: none;
}
.help-header > * { position: relative; z-index: 1; }
.help-title {
  font-family: "IBM Plex Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: var(--fs-body, 14px);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f1f5f9;
  line-height: 1.15;
}
.help-sub {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: var(--fs-micro, 10px);
  color: #94a3b8;
  letter-spacing: 0.18em;
  margin-top: 2px;
  text-transform: uppercase;
}

/* Tone tile (re-used pattern). */
.icon-tile {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.icon-tile.tone-blue    { background: rgba(59, 130, 246, 0.13);  color: #60a5fa; box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.28); }
.icon-tile.tone-cyan    { background: rgba(34, 211, 238, 0.13);  color: #22d3ee; box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.28); }
.icon-tile.tone-purple  { background: rgba(167, 139, 250, 0.13); color: #a78bfa; box-shadow: inset 0 0 0 1px rgba(167, 139, 250, 0.28); }
.icon-tile.tone-emerald { background: rgba(52, 211, 153, 0.13);  color: #34d399; box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.28); }
.icon-tile.tone-amber   { background: rgba(251, 191, 36, 0.13);  color: #fbbf24; box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.28); }
.icon-tile.tone-rose    { background: rgba(244, 63, 94, 0.13);   color: #f43f5e; box-shadow: inset 0 0 0 1px rgba(244, 63, 94, 0.28); }

/* ── State-pill chip — shared by all sections ────────────────────── */
.state-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.32);
  color: #047857;
}
body[data-theme="dark"] .state-pill { color: #34d399; }
.state-pill .sp-dot {
  display: inline-block;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  flex-shrink: 0;                 /* never let the flex algorithm collapse it */
}
.state-pill.state-breaching,
.state-row.state-breaching .state-pill {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.32);
  color: #b45309;
}
body[data-theme="dark"] .state-pill.state-breaching,
body[data-theme="dark"] .state-row.state-breaching .state-pill { color: #fbbf24; }
.state-pill.state-firing,
.state-row.state-firing .state-pill {
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.32);
  color: #b91c1c;
}
body[data-theme="dark"] .state-pill.state-firing,
body[data-theme="dark"] .state-row.state-firing .state-pill { color: #f87171; }

/* ── At-a-glance state list ──────────────────────────────────────── */
.state-grid {
  margin: 0;
  padding: 1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.state-row {
  /* Flex (not grid) so each pill takes its natural width — labels in
     the edge-cases section ("STUCK BREACHING", "ALWAYS RESOLVES") are
     too wide for a fixed 130 px column. The pill stays on the left,
     the description fills the rest of the row. */
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
}
.state-row > .state-pill { flex: 0 0 auto; }
.state-row > dd { flex: 1 1 240px; min-width: 0; }
.state-row dd {
  margin: 0;
  font-family: "Lato", system-ui, sans-serif;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #475569;
}
body[data-theme="dark"] .state-row dd { color: #cbd5e1; }
.state-row dd em { color: inherit; font-style: italic; opacity: 0.85; }

/* ── Transitions list ────────────────────────────────────────────── */
.transition-list {
  list-style: none;
  margin: 0;
  padding: 1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.transition-list li {
  display: grid;
  grid-template-columns: auto auto auto 1fr auto;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(148, 163, 184, 0.04);
}
.trans-arrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 1.05rem;
  color: #94a3b8;
  user-select: none;
}
.trans-when {
  font-family: "Lato", system-ui, sans-serif;
  font-size: 0.86rem;
  color: #475569;
}
body[data-theme="dark"] .trans-when { color: #cbd5e1; }
.trans-fx {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.18);
}
body[data-theme="dark"] .trans-fx { color: #94a3b8; }
.trans-fx.fx-fire {
  color: #b91c1c;
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.32);
}
body[data-theme="dark"] .trans-fx.fx-fire { color: #f87171; }
.trans-fx.fx-resolve {
  color: #047857;
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.32);
}
body[data-theme="dark"] .trans-fx.fx-resolve { color: #34d399; }
.trans-when code,
.trans-fx code {
  font-family: inherit;
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 0.95em;
  color: inherit;
}

@media (max-width: 768px) {
  .transition-list li {
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
    row-gap: 0.4rem;
  }
  .trans-when { grid-column: 1 / -1; }
  .trans-fx   { grid-column: 1 / -1; justify-self: start; }
}

/* ── Examples — terminal-block lite ──────────────────────────────── */
.example-intro {
  padding: 1rem 1.1rem 0;
  margin: 0;
  font-family: "Lato", system-ui, sans-serif;
  font-size: 0.92rem;
  color: #475569;
  line-height: 1.55;
}
body[data-theme="dark"] .example-intro { color: #cbd5e1; }

.example { padding: 0.85rem 1.1rem 0; }
.example:last-of-type { padding-bottom: 1.1rem; }

.example-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.5rem;
}
body[data-theme="dark"] .example-eyebrow { color: #94a3b8; }

.timeline {
  margin: 0;
  padding: 0.7rem 0.95rem;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.78rem;
  line-height: 1.7;
  color: #334155;
  overflow-x: auto;
  white-space: pre;
}
body[data-theme="dark"] .timeline {
  background: rgba(10, 14, 23, 0.6);
  border-color: rgba(148, 163, 184, 0.16);
  color: #e2e8f0;
}
.timeline .t      { color: #22d3ee; }
.timeline .metric { color: #93c5fd; }
.timeline .state  {
  display: inline-block;
  min-width: 9.5ch;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.timeline .state.state-ok        { color: #34d399; }
.timeline .state.state-breaching { color: #fbbf24; }
.timeline .state.state-firing    { color: #f87171; }
.timeline .comment { color: #64748b; font-style: italic; }
body[data-theme="dark"] .timeline .comment { color: #94a3b8; }

/* ── Where it lives — definition list ────────────────────────────── */
.ds-list {
  margin: 0;
  padding: 1rem 1.1rem 1.1rem;
  display: grid;
  grid-template-columns: 160px 1fr;
  column-gap: 1.2rem;
  row-gap: 0.7rem;
  align-items: baseline;
}
.ds-list dt code {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.82rem;
  color: #2563eb;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.45rem;
}
body[data-theme="dark"] .ds-list dt code { color: #67e8f9; }
.ds-list dd {
  margin: 0;
  font-family: "Lato", system-ui, sans-serif;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #475569;
}
body[data-theme="dark"] .ds-list dd { color: #cbd5e1; }

/* ── CTA block ───────────────────────────────────────────────────── */
.help-cta { padding: 1.2rem 1.3rem 1.4rem; }
.help-cta-eyebrow {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.5rem;
}
body[data-theme="dark"] .help-cta-eyebrow { color: #94a3b8; }
.help-cta p {
  margin: 0 0 0.85rem;
  font-family: "Lato", system-ui, sans-serif;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.55;
}
body[data-theme="dark"] .help-cta p { color: #cbd5e1; }
.cta-cmd {
  margin: 0;
  padding: 0.55rem 0.8rem;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.78rem;
  color: #334155;
  white-space: pre-wrap;
  overflow-x: auto;
}
body[data-theme="dark"] .cta-cmd {
  background: rgba(10, 14, 23, 0.6);
  border-color: rgba(148, 163, 184, 0.16);
  color: #e2e8f0;
}
.cta-cmd .prompt { color: #22d3ee; margin-right: 0.5rem; user-select: none; }

/* Generic <code> styling (lede, dd) */
.lede code,
.state-row dd code,
.trans-when code,
.help-cta p code {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 4px;
  padding: 0.05rem 0.4rem;
  font-size: 0.82em;
  color: #2563eb;
}
body[data-theme="dark"] .lede code,
body[data-theme="dark"] .state-row dd code,
body[data-theme="dark"] .trans-when code,
body[data-theme="dark"] .help-cta p code { color: #67e8f9; }
</style>
