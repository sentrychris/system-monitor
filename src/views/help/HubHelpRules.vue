<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Docs · Alert Rules");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Alert Rules" />

    <p class="lede">
      A <strong>rule</strong> is the <em>input</em> to the alert engine —
      a metric, an operator, a threshold, and a scope of hosts to watch.
      The <RouterLink to="/hub/help/alerts" class="lede-link">Alerts</RouterLink>
      page covers the firing/breaching state machine; this page covers
      authoring rules: the seven fields, the metric namespace, scope
      syntax, and the API recipes the
      <RouterLink to="/hub/rules" class="lede-link">Alert rules</RouterLink>
      view wraps.
    </p>

    <!-- ─── Anatomy of a rule ───────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-list-check" /></span>
        <div>
          <div class="help-title">Anatomy of a rule</div>
          <div class="help-sub">SEVEN FIELDS · ONE TABLE</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>name</code></dt>
        <dd>Human label that appears in dispatched notifications and the rules list. No uniqueness constraint — pick something the oncall will recognize at 3am.</dd>
        <dt><code>metric</code> + <code>dim</code></dt>
        <dd>
          What to evaluate. <code>metric</code> is the flat namespace key
          (e.g. <code>cpu.usage</code>, <code>mem.percent</code>);
          <code>dim</code> is a single-dimension qualifier used today only
          for per-mount disk metrics (<code>/</code>, <code>/var</code>,
          …). Empty string for everything else, never <code>NULL</code>.
          See the catalog below.
        </dd>
        <dt><code>op</code> + <code>threshold</code></dt>
        <dd>
          Comparator and value. <code>op</code> is one of <code>&gt;</code>,
          <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code>;
          <code>threshold</code> is a real number compared against the
          metric's most recent sample. Units are whatever the metric
          uses — percent, bytes, bytes/s — no scaling is applied.
        </dd>
        <dt><code>for_seconds</code></dt>
        <dd>
          How long the breach must persist before the rule fires.
          Defaults to <code>60</code>. <code>0</code> means fire on the
          first sample that crosses — useful for binary signals, noisy
          for anything analog.
        </dd>
        <dt><code>scope</code></dt>
        <dd>
          Which hosts the rule applies to. One of <code>all</code>,
          <code>host:&lt;name&gt;</code>, or <code>tag:&lt;tag&gt;</code>.
          Resolved every eval tick — adding a tag to a host enrolls it
          in matching rules within the next interval.
        </dd>
        <dt><code>channel_id</code></dt>
        <dd>FK into <code>channels</code>. The rule fires into exactly one channel; fan-out is by registering the same target in two channels (e.g. an oncall webhook and an audit log).</dd>
        <dt><code>enabled</code></dt>
        <dd><code>0</code> excludes the rule from evaluation without deleting it. Existing alert state is preserved — re-enable and the next tick picks up where it left off.</dd>
      </dl>
    </section>

    <!-- ─── Common metric targets ───────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-microchip" /></span>
        <div>
          <div class="help-title">Common metric targets</div>
          <div class="help-sub">SHORTLIST · FULL CATALOG IS A CLICK AWAY</div>
        </div>
      </header>

      <p class="example-intro">
        These are the metrics most rules end up targeting. The
        <RouterLink to="/hub/help/metrics" class="lede-link">Metric Catalog</RouterLink>
        page has the complete list — every value the Collector emits,
        with units, source, and caveats.
      </p>

      <dl class="ds-list">
        <dt><code>cpu.usage</code></dt>
        <dd>Whole-system CPU utilization, percent (0–100). The default for "is something on fire?" rules.</dd>
        <dt><code>mem.percent</code></dt>
        <dd>Memory utilization. 85–90 catches most operational concerns without per-host tuning.</dd>
        <dt><code>disk.percent</code> <span class="dim-tag">+ dim</span></dt>
        <dd>Per-mount fullness — <code>dim</code> is the mount path. One rule per mount you care about.</dd>
        <dt><code>cpu.load_1m</code> · <code>cpu.load_5m</code> · <code>cpu.load_15m</code></dt>
        <dd>Unix load averages. Compare against <code>cpu_cores</code> from the host's hello frame — a load of 8 means very different things on a 4-core box and a 32-core one.</dd>
      </dl>
    </section>

    <!-- ─── Scope syntax ────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-bullseye" /></span>
        <div>
          <div class="help-title">Scope syntax</div>
          <div class="help-sub">RESOLVED EVERY TICK · DISABLED HOSTS EXCLUDED</div>
        </div>
      </header>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>ALL</span>
          <div class="st-rule mono">scope = "all"</div>
          <div class="st-desc">Every <code>enabled</code> host. The blunt option — fine for global SLOs (<em>any</em> host above 95% CPU), too noisy for anything host-specific.</div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>HOST</span>
          <div class="st-rule mono">scope = "host:web-01.dc1"</div>
          <div class="st-desc">A single host by exact <code>name</code>. Best for the one box that needs a custom threshold — a database with legitimately high memory, an edge node with tighter latency goals.</div>
        </div>
        <div class="status-tile is-offline">
          <span class="st-pill"><span class="st-dot"></span>TAG</span>
          <div class="st-rule mono">scope = "tag:edge"</div>
          <div class="st-desc">Every host whose <code>tags</code> array contains the value. The recommended default: tag hosts by role (<code>db</code>, <code>edge</code>, <code>worker</code>) and write rules against the role.</div>
        </div>
      </div>

      <p class="example-intro" style="margin-top: 1rem;">
        Hosts with <code>enabled = 0</code> are skipped at scope-resolution
        time, so muting a host (PATCH <code>enabled: 0</code>) silences
        every rule that targets it without touching the rules themselves.
      </p>
    </section>

    <!-- ─── for_seconds + lifecycle pointer ─────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-stopwatch" /></span>
        <div>
          <div class="help-title">for_seconds and the firing lifecycle</div>
          <div class="help-sub">DEBOUNCE · NOT A SLIDING WINDOW</div>
        </div>
      </header>

      <p class="example-intro">
        <code>for_seconds</code> is a <em>continuous-breach</em> timer,
        not a rolling average. The metric must stay over (or under) the
        threshold for the entire window — a single sample that recovers
        clears the timer back to zero. The
        <RouterLink to="/hub/help/alerts" class="lede-link">Alerts</RouterLink>
        page has worked timelines.
      </p>

      <div class="example">
        <div class="example-eyebrow">— RULE: cpu.usage &gt; 90, for_seconds = 60</div>
        <pre class="timeline"><span class="t">t=0s   </span><span class="metric">cpu = 30%</span>   <span class="state state-ok">ok</span>
<span class="t">t=10s  </span><span class="metric">cpu = 95%</span>   <span class="state state-breaching">breaching</span>   timer starts
<span class="t">t=40s  </span><span class="metric">cpu = 60%</span>   <span class="state state-ok">ok</span>          <span class="comment"># cleared — timer resets</span>
<span class="t">t=80s  </span><span class="metric">cpu = 95%</span>   <span class="state state-breaching">breaching</span>   timer restarts from 0
<span class="t">t=140s </span><span class="metric">cpu = 95%</span>   <span class="state state-firing">firing</span>      <span class="comment"># 60s sustained → dispatch</span></pre>
      </div>

      <p class="example-intro">
        Rule of thumb: pick <code>for_seconds</code> longer than your
        deploy/restart pause. A 60-second window swallows a normal
        rolling restart; a 5-second window will page on every deploy.
        The engine evaluates every 10 s by default, so set
        <code>for_seconds</code> in multiples of that for predictable
        timing.
      </p>
    </section>

    <!-- ─── Authoring rules — UI + API ──────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-pen-to-square" /></span>
        <div>
          <div class="help-title">Authoring rules</div>
          <div class="help-sub">UI · OR CURL THE ADMIN API</div>
        </div>
      </header>

      <p class="example-intro">
        The <RouterLink to="/hub/rules" class="lede-link">Alert rules</RouterLink>
        view is the canonical UI — every field maps one-to-one with the
        <code>POST /api/alert_rules</code> body. Use the API directly
        when bootstrapping a fleet from config or when you'd rather
        commit rules to a repo than click them in.
      </p>

      <ol class="step-list">
        <li>
          <div class="step-body">
            <div class="step-title">Create a rule</div>
            <p>
              <code>POST</code> the seven fields. The hub responds with
              the assigned <code>id</code> and <code>created_at</code>.
              The rule is live on the next eval tick (≤ 10 s by default).
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX POST https://hub.example/api/alert_rules \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> \
    -H <span class="string">"Content-Type: application/json"</span> \
    -d <span class="string">'{
      "name": "cpu hot (edge)",
      "metric": "cpu.usage",
      "dim": "",
      "scope": "tag:edge",
      "op": ">",
      "threshold": 90,
      "for_seconds": 60,
      "channel_id": 1,
      "enabled": true
    }'</span>
<span class="comment"># → {"id": 4, "name": "cpu hot (edge)", ...}</span></pre>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Tune an existing rule</div>
            <p>
              <code>PATCH</code> accepts <code>name</code>,
              <code>scope</code>, <code>op</code>, <code>threshold</code>,
              <code>for_seconds</code>, <code>channel_id</code>, and
              <code>enabled</code>. <code>metric</code> and <code>dim</code>
              are <em>immutable</em> — changing them would orphan the
              alert state and event history, so the API rejects them.
              Delete and recreate to change the metric.
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX PATCH https://hub.example/api/alert_rules/4 \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> \
    -H <span class="string">"Content-Type: application/json"</span> \
    -d <span class="string">'{"threshold": 95, "for_seconds": 120}'</span></pre>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Mute without losing history</div>
            <p>
              Flip <code>enabled</code> to <code>0</code>. Evaluation
              skips the rule but <code>alert_state</code> and
              <code>alert_events</code> rows stay put. Re-enable and the
              engine resumes from the previous state on the next tick.
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX PATCH https://hub.example/api/alert_rules/4 \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> \
    -d <span class="string">'{"enabled": false}'</span></pre>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Delete</div>
            <p>
              <code>DELETE</code> drops the rule and cascades through
              <code>alert_state</code> and <code>alert_events</code>.
              Use only when you're certain you don't want the firing
              history — for a temporary pause, prefer <code>enabled:
              false</code> above.
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX DELETE https://hub.example/api/alert_rules/4 \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span>
<span class="comment"># → {"ok": true}</span></pre>
          </div>
        </li>
      </ol>
    </section>

    <!-- ─── Where it lives ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-database" /></span>
        <div>
          <div class="help-title">Where the data lives</div>
          <div class="help-sub">SQLITE · ONE ROW PER RULE</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>alert_rules</code></dt>
        <dd>The seven fields plus <code>id</code> and <code>created_at</code>. The whole table fits in a single eval-tick query — the engine reloads every rule on every tick, so config changes apply within the next interval.</dd>
        <dt><code>alert_state</code></dt>
        <dd>Per-<code>(rule, host)</code> snapshot — current state, breach-start timestamp, last value. Cascades on rule delete. See the <RouterLink to="/hub/help/alerts" class="lede-link">Alerts</RouterLink> page for what each state means.</dd>
        <dt><code>alert_events</code></dt>
        <dd>Append-only log of <code>fired</code> and <code>resolved</code> transitions. Cascades on rule delete — disable rather than delete if you need to keep the history.</dd>
        <dt><code>channels</code></dt>
        <dd>Dispatch targets. <code>channel_id</code> on every rule is a foreign key here; the channel's <code>type</code> + <code>config</code> JSON decides how the notification is delivered.</dd>
      </dl>
    </section>

    <!-- ─── Pointer to channels ─────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— DISPATCH TARGETS</div>
        <p>
          Every rule needs a <code>channel_id</code>. Channel
          configuration (Slack, Discord, generic webhook) lives on the
          hub host alongside the codebase — a dedicated docs page is on
          the way.
        </p>
        <pre class="cta-cmd"><span class="prompt">$</span> cat ~/vigil-pro/docs/CHANNELS.md</pre>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* Inline tag for "this metric carries a dim" — sits next to the dt code
   in the metric catalog. Mono caps, faint amber chip. */
.dim-tag {
  display: inline-block;
  margin-left: 0.45rem;
  padding: 0.05rem 0.42rem;
  border-radius: 4px;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.32);
  color: #b45309;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  vertical-align: middle;
}
body[data-theme="dark"] .dim-tag { color: #fbbf24; }

/* Mono override inside the status-tile rule line — keeps the scope
   examples (`scope = "tag:edge"`) in IBM Plex Mono without forcing the
   .mono class onto every consumer of .st-rule. */
.status-tile .mono {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}
</style>
