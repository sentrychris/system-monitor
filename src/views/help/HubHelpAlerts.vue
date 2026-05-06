<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Docs · Alert States");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Alert States" />

    <p class="lede">
      Vigil watches each host's metrics against the
      <RouterLink to="/hub/help/rules">rules</RouterLink>
      you set. When a metric crosses a threshold and stays there long
      enough, you get a notification on Slack, Discord, or a webhook.
      Every rule moves through three states for every host it
      watches — this page walks through them. New here?
      <RouterLink to="/hub/help/overview">Start with the Overview</RouterLink>.
    </p>

    <!-- ─── At-a-glance state legend ─────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-list-ul" /></span>
        <div>
          <div class="help-title">The three states</div>
          <div class="help-sub">ONE STATE PER HOST PER RULE</div>
        </div>
      </header>

      <dl class="state-grid">
        <div class="state-row state-ok">
          <span class="state-pill"><span class="sp-dot"></span>OK</span>
          <dd>The metric is within the threshold. Nothing to do.</dd>
        </div>
        <div class="state-row state-breaching">
          <span class="state-pill"><span class="sp-dot"></span>BREACHING</span>
          <dd>
            The metric just crossed the threshold. Vigil starts a timer
            but doesn't notify anyone yet — if it recovers within
            <code>for_seconds</code>, the breach is forgotten silently.
            This is the noise filter: a 5-second CPU spike during a
            deploy shouldn't page anyone.
          </dd>
        </div>
        <div class="state-row state-firing">
          <span class="state-pill"><span class="sp-dot"></span>FIRING</span>
          <dd>
            The metric stayed across the threshold for the full
            <code>for_seconds</code> window. Vigil has sent the alert
            and recorded it. Stays here until the metric recovers.
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
          <div class="help-sub">FROM → TO · WHEN · WHAT HAPPENS</div>
        </div>
      </header>

      <ol class="transition-list">
        <li>
          <span class="state-pill state-ok"><span class="sp-dot"></span>OK</span>
          <span class="trans-arrow" aria-hidden="true">→</span>
          <span class="state-pill state-breaching"><span class="sp-dot"></span>BREACHING</span>
          <span class="trans-when">when the metric first crosses the threshold</span>
          <span class="trans-fx">no notification yet</span>
        </li>
        <li>
          <span class="state-pill state-breaching"><span class="sp-dot"></span>BREACHING</span>
          <span class="trans-arrow" aria-hidden="true">→</span>
          <span class="state-pill state-firing"><span class="sp-dot"></span>FIRING</span>
          <span class="trans-when">when the metric has stayed across the threshold for ≥ <code>for_seconds</code></span>
          <span class="trans-fx fx-fire">send <code>fired</code> notification</span>
        </li>
        <li>
          <span class="state-pill state-breaching"><span class="sp-dot"></span>BREACHING</span>
          <span class="trans-arrow" aria-hidden="true">→</span>
          <span class="state-pill state-ok"><span class="sp-dot"></span>OK</span>
          <span class="trans-when">when the metric recovers <em>before</em> <code>for_seconds</code> elapses</span>
          <span class="trans-fx">silent — no notification</span>
        </li>
        <li>
          <span class="state-pill state-firing"><span class="sp-dot"></span>FIRING</span>
          <span class="trans-arrow" aria-hidden="true">→</span>
          <span class="state-pill state-ok"><span class="sp-dot"></span>OK</span>
          <span class="trans-when">when the metric recovers</span>
          <span class="trans-fx fx-resolve">send <code>resolved</code> notification</span>
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
          <div class="help-sub">DISPATCH FAILURES · OPERATOR MUTE</div>
        </div>
      </header>

      <dl class="state-grid">
        <div class="state-row">
          <span class="state-pill state-breaching"><span class="sp-dot"></span>STUCK BREACHING</span>
          <dd>
            If sending the alert fails (Slack is down, webhook
            returned an error), Vigil stays in <code>breaching</code>
            and retries on the next check. If a rule has been
            <code>breaching</code> well past its <code>for_seconds</code>
            without ever firing, the channel is probably broken — check
            the hub logs for <code>alert.dispatch_failed</code>.
          </dd>
        </div>
        <div class="state-row">
          <span class="state-pill state-firing"><span class="sp-dot"></span>ALWAYS RESOLVES</span>
          <dd>
            When a metric recovers, Vigil moves from <code>firing</code>
            to <code>ok</code> even if the resolved notification fails
            to send. Otherwise a deleted webhook could wedge an alert in
            <code>firing</code> forever. The recovery is still written
            to history; only the notification is lost.
          </dd>
        </div>
        <div class="state-row">
          <span class="state-pill state-ok"><span class="sp-dot"></span>RULE MUTED</span>
          <dd>
            Disabling a rule (eye toggle on the rules view, or
            <code>enabled: false</code> via API) clears its live state
            for every host immediately. Anything currently
            <code>firing</code> gets a <code>resolved</code> event in
            history so the dashboards stop showing it. Re-enabling
            doesn't restore the prior state — if the metric is still
            over threshold, the rule walks the
            <code>ok → breaching → firing</code> cycle again on the
            next ticks.
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
          Current state per rule and host: which state it's in, when
          the breach started, the last value seen. Drives the Health
          card on each host page and the fleet alerts list.
        </dd>
        <dt><code>alert_events</code></dt>
        <dd>
          Append-only log of <code>fired</code> and <code>resolved</code>
          events. Powers the alert history view and persists after the
          breach is over.
        </dd>
      </dl>
    </section>

    <!-- ─── Creating rules pointer ────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— SETTING UP RULES</div>
        <p>
          The <RouterLink to="/hub/help/rules" class="lede-link">Alert Rules</RouterLink>
          page walks through the seven fields, scope syntax, and the
          API recipes. Channels (Slack, Discord, generic webhooks) are
          managed on the
          <RouterLink to="/hub/channels" class="lede-link">Channels</RouterLink>
          page.
        </p>
      </div>
    </section>
  </article>
</template>
