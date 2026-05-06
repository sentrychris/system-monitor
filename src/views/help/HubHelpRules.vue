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
      A <strong>rule</strong> tells Vigil what to watch and when to
      alert: a metric, a comparison, a threshold, and which hosts to
      apply it to. The
      <RouterLink to="/hub/help/alerts" class="lede-link">Alert States</RouterLink>
      page explains what happens once a rule fires; this page explains
      how to write one. New here?
      <RouterLink to="/hub/help/overview">Start with the Overview</RouterLink>.
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
        <dd>What the rule is called. Shows up in alerts and the rules list — pick something you'll recognize when paged at 3am. Doesn't need to be unique.</dd>
        <dt><code>metric</code> + <code>dim</code></dt>
        <dd>
          What to watch. <code>metric</code> is the value name
          (<code>cpu.usage</code>, <code>mem.percent</code>);
          <code>dim</code> is an extra label used today only for
          per-mount disk metrics (<code>/</code>, <code>/var</code>, …).
          Leave it blank for everything else. See the catalog below.
        </dd>
        <dt><code>op</code> + <code>threshold</code></dt>
        <dd>
          How to compare. <code>op</code> is one of <code>&gt;</code>,
          <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code>;
          <code>threshold</code> is the value to compare against the
          latest sample, in whatever unit the metric uses (percent,
          bytes, bytes/s — no conversion).
        </dd>
        <dt><code>for_seconds</code></dt>
        <dd>
          How long the threshold must keep being crossed before the
          alert fires. Defaults to <code>60</code>. Set to <code>0</code>
          to fire on the first sample that crosses — fine for binary
          signals, very noisy for anything that fluctuates.
        </dd>
        <dt><code>scope</code></dt>
        <dd>
          Which hosts the rule covers. One of <code>all</code>,
          <code>host:&lt;name&gt;</code>, or <code>tag:&lt;tag&gt;</code>.
          Vigil rechecks scope on every tick, so adding a tag to a host
          enrolls it in seconds.
        </dd>
        <dt><code>channel_id</code></dt>
        <dd>Which channel to send the alert to. One channel per rule — to send to multiple places, set up multiple channels with the same target.</dd>
        <dt><code>enabled</code></dt>
        <dd>Set to <code>0</code> to pause the rule without deleting it. State and history are kept — turn it back on and Vigil picks up where it left off.</dd>
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
        These are the metrics most rules end up using. The
        <RouterLink to="/hub/help/metrics" class="lede-link">Metrics</RouterLink>
        has the full list with units and notes.
      </p>

      <dl class="ds-list">
        <dt><code>cpu.usage</code></dt>
        <dd>CPU usage across all cores, 0–100. The default for "is this host in trouble?" rules.</dd>
        <dt><code>mem.percent</code></dt>
        <dd>Memory usage. 85–90 works for most setups without tuning per host.</dd>
        <dt><code>disk.percent</code> <span class="dim-tag">+ dim</span></dt>
        <dd>How full each mount is. Set <code>dim</code> to the mount path. Write one rule per mount you care about.</dd>
        <dt><code>cpu.load_1m</code> · <code>cpu.load_5m</code> · <code>cpu.load_15m</code></dt>
        <dd>Unix load averages. Compare against the host's CPU core count — a load of 8 means very different things on a 4-core box vs a 32-core one.</dd>
      </dl>
    </section>

    <!-- ─── Scope syntax ────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-bullseye" /></span>
        <div>
          <div class="help-title">Scope syntax</div>
          <div class="help-sub">RECHECKED EVERY TICK · DISABLED HOSTS SKIPPED</div>
        </div>
      </header>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>ALL</span>
          <div class="st-rule mono">scope = "all"</div>
          <div class="st-desc">Every active host. Good for global thresholds (<em>any</em> host above 95% CPU), too noisy for anything host-specific.</div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>HOST</span>
          <div class="st-rule mono">scope = "host:web-01.dc1"</div>
          <div class="st-desc">One specific host, by name. Use when one box needs a different threshold — a database that legitimately runs hot, an edge node with stricter limits.</div>
        </div>
        <div class="status-tile is-offline">
          <span class="st-pill"><span class="st-dot"></span>TAG</span>
          <div class="st-rule mono">scope = "tag:edge"</div>
          <div class="st-desc">Every host with that tag. The recommended default: tag hosts by role (<code>db</code>, <code>edge</code>, <code>worker</code>) and write rules per role.</div>
        </div>
      </div>

      <p class="example-intro mb-3">
        Setting <code>enabled = 0</code> on a host silences every rule
        that targets it without touching the rules themselves. Useful
        for muting a noisy host mid-incident.
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
        <code>for_seconds</code> is a continuous timer, not a rolling
        average. The metric has to stay across the threshold for the
        whole window — a single sample that recovers resets the timer
        to zero. The
        <RouterLink to="/hub/help/alerts" class="lede-link">Alert States</RouterLink>
        page has more worked timelines.
      </p>

      <div class="example">
        <div class="example-eyebrow">— RULE: cpu.usage &gt; 90, for_seconds = 60</div>
        <pre class="timeline"><span class="t">t=0s   </span><span class="metric">cpu = 30%</span>   <span class="state state-ok">ok</span>
<span class="t">t=10s  </span><span class="metric">cpu = 95%</span>   <span class="state state-breaching">breaching</span>   timer starts
<span class="t">t=40s  </span><span class="metric">cpu = 60%</span>   <span class="state state-ok">ok</span>          <span class="comment"># cleared — timer resets</span>
<span class="t">t=80s  </span><span class="metric">cpu = 95%</span>   <span class="state state-breaching">breaching</span>   timer restarts from 0
<span class="t">t=140s </span><span class="metric">cpu = 95%</span>   <span class="state state-firing">firing</span>      <span class="comment"># 60s sustained → dispatch</span></pre>
      </div>

      <p class="example-intro mb-3">
        Rule of thumb: pick <code>for_seconds</code> longer than a
        typical deploy or restart. 60 seconds absorbs a normal rolling
        restart; 5 seconds will page you every deploy. Vigil checks
        every 10 seconds by default, so multiples of 10 give the most
        predictable timing.
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
        view is the easiest way to author rules — every field maps
        directly to the API. Use the API directly when bootstrapping a
        fleet from config or committing rules to a repo.
      </p>

      <ol class="step-list">
        <li>
          <div class="step-body">
            <div class="step-title">Create a rule</div>
            <p>
              Send the seven fields. The hub returns the new
              <code>id</code> and <code>created_at</code>. The rule is
              live on the next check — within 10 seconds by default.
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX POST https://hub.vigil.edcs.app/api/alert_rules \
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
              You can change <code>name</code>, <code>scope</code>,
              <code>op</code>, <code>threshold</code>,
              <code>for_seconds</code>, <code>channel_id</code>, and
              <code>enabled</code>. <code>metric</code> and
              <code>dim</code> can't be changed — that would orphan the
              existing history. Delete and recreate to switch metrics.
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX PATCH https://hub.vigil.edcs.app/api/alert_rules/4 \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> \
    -H <span class="string">"Content-Type: application/json"</span> \
    -d <span class="string">'{"threshold": 95, "for_seconds": 120}'</span></pre>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Mute without losing history</div>
            <p>
              Set <code>enabled</code> to <code>0</code>. Vigil skips
              the rule but keeps its state and history. Turn it back on
              and evaluation resumes from where it left off.
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX PATCH https://hub.vigil.edcs.app/api/alert_rules/4 \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> \
    -d <span class="string">'{"enabled": false}'</span></pre>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Delete</div>
            <p>
              Removes the rule along with its state and history. For a
              temporary pause, use the mute step above instead.
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX DELETE https://hub.vigil.edcs.app/api/alert_rules/4 \
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
        <dd>The seven fields plus <code>id</code> and <code>created_at</code>. Vigil reloads every rule on every check, so changes apply within seconds.</dd>
        <dt><code>alert_state</code></dt>
        <dd>Current state per rule and host: which state it's in, when the breach started, the last value seen. See the <RouterLink to="/hub/help/alerts" class="lede-link">Alert States</RouterLink> page for what the states mean.</dd>
        <dt><code>alert_events</code></dt>
        <dd>Append-only log of <code>fired</code> and <code>resolved</code> events. Deleted with the rule — mute instead if you need to keep the history.</dd>
        <dt><code>channels</code></dt>
        <dd>Where alerts go. Each rule's <code>channel_id</code> points here; the channel's <code>type</code> and <code>config</code> decide how the notification is delivered.</dd>
      </dl>
    </section>

    <!-- ─── Pointer to channels ─────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— DISPATCH TARGETS</div>
        <p>
          Every rule needs a channel. Configure Slack, Discord, and
          generic webhooks on the
          <RouterLink to="/hub/channels" class="lede-link">Channels</RouterLink>
          page — Add / Edit / Delete with the same shape as the rules
          form.
        </p>
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
