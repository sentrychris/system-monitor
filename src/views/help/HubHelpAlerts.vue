<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Docs · Alerts");
</script>

<template>
  <article class="help-page">
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
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— SETTING UP RULES</div>
        <p>
          Rules are created via the admin API. See <code>ALERTS.md</code>
          on the hub host for the full quickstart, including channel
          setup for Slack, Discord, and generic webhooks.
        </p>
        <pre class="cta-cmd"><span class="prompt">$</span> cat ~/vigil-pro/ALERTS.md</pre>
      </div>
    </section>
  </article>
</template>
