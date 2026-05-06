<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Docs · Channels");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Channels" />

    <p class="lede">
      A <strong>channel</strong> is where alerts get sent — Slack,
      Discord, or a generic webhook. Every
      <RouterLink to="/hub/help/rules" class="lede-link">alert rule</RouterLink>
      points at exactly one channel. Manage them on the
      <RouterLink to="/hub/channels" class="lede-link">Channels</RouterLink>
      page.
    </p>

    <!-- ─── The three types ─────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-bell" /></span>
        <div>
          <div class="help-title">The three types</div>
          <div class="help-sub">SLACK · DISCORD · GENERIC WEBHOOK</div>
        </div>
      </header>

      <div class="status-grid">
        <div class="status-tile is-slack">
          <span class="st-pill"><span class="st-dot"></span>SLACK</span>
          <div class="st-rule mono">webhook_url</div>
          <div class="st-desc">
            Slack incoming webhook. Vigil POSTs
            <code>{ "text": "..." }</code> with a Slack-formatted
            message — bold verb, mono host name, value vs threshold.
          </div>
        </div>
        <div class="status-tile is-discord">
          <span class="st-pill"><span class="st-dot"></span>DISCORD</span>
          <div class="st-rule mono">webhook_url</div>
          <div class="st-desc">
            Discord webhook in Slack-compatible mode. Same payload
            shape as Slack — just remember to append
            <code>/slack</code> to your Discord webhook URL.
          </div>
        </div>
        <div class="status-tile is-webhook">
          <span class="st-pill"><span class="st-dot"></span>WEBHOOK</span>
          <div class="st-rule mono">url</div>
          <div class="st-desc">
            Generic JSON receiver. Gets the full structured payload
            (rule, host, op, threshold, value, event, text) so you can
            route to PagerDuty, an internal incident system, or
            anything else.
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Setting one up ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-pen-to-square" /></span>
        <div>
          <div class="help-title">Setting one up</div>
          <div class="help-sub">UI · OR THE API IF YOU PREFER</div>
        </div>
      </header>

      <p class="example-intro">
        The <RouterLink to="/hub/channels" class="lede-link">Channels</RouterLink>
        page is the easiest way — pick a type, paste the webhook URL,
        save. The form switches fields based on the selected type and
        catches the obvious mistakes (missing URL, wrong scheme) before
        save.
      </p>

      <p class="example-intro">
        If you'd rather author from a script or commit channels to a
        repo, the API takes the same fields:
      </p>

      <pre class="cmd"><span class="prompt">$</span> curl -sX POST https://hub.example/api/channels \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> \
    -H <span class="string">"Content-Type: application/json"</span> \
    -d <span class="string">'{
      "name": "ops-alerts",
      "type": "slack",
      "config": { "webhook_url": "https://hooks.slack.com/services/T0…/B0…/…" }
    }'</span>
<span class="comment"># → {"id": 3, "name": "ops-alerts", "type": "slack", "config": {…}}</span></pre>

      <p class="example-intro">
        Edit (<code>PATCH</code>) and delete (<code>DELETE</code>) work
        the same way — the patch body accepts <code>name</code>,
        <code>type</code>, and <code>config</code>.
      </p>
    </section>

    <!-- ─── Slack message format ────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-bolt" /></span>
        <div>
          <div class="help-title">Slack &amp; Discord message format</div>
          <div class="help-sub">VIGIL FORMATS THE TEXT FOR YOU</div>
        </div>
      </header>

      <p class="example-intro">
        Slack and Discord receive a single <code>text</code> field with
        a fixed shape — siren emoji + verb + rule name on one line,
        host and value on the next. No template to configure.
      </p>

      <div class="example">
        <div class="example-eyebrow">— FIRED</div>
        <pre class="timeline"><span class="state state-firing">🚨  *[FIRING]*  cpu hot (edge)</span>
<span class="comment">`web-01.dc1` — value `95.40` &gt; threshold `90`</span></pre>
      </div>

      <div class="example">
        <div class="example-eyebrow">— RESOLVED</div>
        <pre class="timeline"><span class="state state-ok">✅  *[RESOLVED]*  cpu hot (edge)</span>
<span class="comment">`web-01.dc1` — value `52.10` &gt; threshold `90`</span></pre>
      </div>
    </section>

    <!-- ─── Webhook payload ─────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-code-branch" /></span>
        <div>
          <div class="help-title">Generic webhook payload</div>
          <div class="help-sub">JSON POST · STRUCTURED FIELDS</div>
        </div>
      </header>

      <p class="example-intro">
        Generic webhooks get the same information as Slack but as
        structured JSON, so you can route on any field. Vigil sends
        one POST per fire and one per resolve.
      </p>

      <div class="example">
        <div class="example-eyebrow">— BODY</div>
        <pre class="timeline"><span class="comment">{</span>
<span class="comment">  </span><span class="metric">"rule"</span><span class="comment">: </span><span class="state state-ok">"cpu hot (edge)"</span><span class="comment">,</span>
<span class="comment">  </span><span class="metric">"host"</span><span class="comment">: </span><span class="state state-ok">"web-01.dc1"</span><span class="comment">,</span>
<span class="comment">  </span><span class="metric">"op"</span><span class="comment">: </span><span class="state state-ok">"&gt;"</span><span class="comment">,</span>
<span class="comment">  </span><span class="metric">"threshold"</span><span class="comment">: 90,</span>
<span class="comment">  </span><span class="metric">"value"</span><span class="comment">: 95.4,</span>
<span class="comment">  </span><span class="metric">"event"</span><span class="comment">: </span><span class="state state-firing">"fired"</span><span class="comment">,</span>
<span class="comment">  </span><span class="metric">"text"</span><span class="comment">: </span><span class="state state-ok">"🚨  *[FIRING]*  cpu hot (edge)\n`web-01.dc1` — value `95.40` &gt; threshold `90`"</span>
<span class="comment">}</span></pre>
      </div>

      <dl class="ds-list">
        <dt><code>rule</code></dt>
        <dd>The rule's <code>name</code>.</dd>
        <dt><code>host</code></dt>
        <dd>Host that breached, by registered name.</dd>
        <dt><code>op</code> + <code>threshold</code></dt>
        <dd>The comparison from the rule, exactly as configured.</dd>
        <dt><code>value</code></dt>
        <dd>The metric reading that triggered the event.</dd>
        <dt><code>event</code></dt>
        <dd><code>"fired"</code> when the rule starts firing, <code>"resolved"</code> when it recovers.</dd>
        <dt><code>text</code></dt>
        <dd>Pre-formatted Slack-style string. Convenient if your receiver wants to forward it as-is.</dd>
      </dl>
    </section>

    <!-- ─── When dispatch fails ─────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-heart-pulse" /></span>
        <div>
          <div class="help-title">When sending fails</div>
          <div class="help-sub">RETRIED ON FIRE · ADVANCES ON RESOLVE</div>
        </div>
      </header>

      <p class="example-intro">
        Vigil treats fire and resolve notifications differently when
        the channel itself is broken (Slack down, webhook returning
        500, URL deleted). The
        <RouterLink to="/hub/help/alerts" class="lede-link">Alerts</RouterLink>
        page covers the state-machine details; the short version:
      </p>

      <dl class="ds-list">
        <dt>Fire failed</dt>
        <dd>Vigil stays in <code>breaching</code> and retries on the next check. A rule stuck in <code>breaching</code> well past <code>for_seconds</code> usually means the channel is broken — check the hub logs for <code>alert.dispatch_failed</code>.</dd>
        <dt>Resolve failed</dt>
        <dd>Vigil still moves to <code>ok</code> and records the recovery. Otherwise a deleted webhook would wedge the alert in <code>firing</code> forever. Only the notification is lost.</dd>
      </dl>
    </section>

    <!-- ─── Reuse and deletion ──────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-rose"><font-awesome-icon icon="fa-solid fa-link" /></span>
        <div>
          <div class="help-title">Reuse and deletion</div>
          <div class="help-sub">ONE CHANNEL · MANY RULES</div>
        </div>
      </header>

      <p class="example-intro">
        A single channel can serve any number of rules — most fleets
        end up with one general-purpose <code>ops-alerts</code> and
        one or two specialized channels (e.g. a quieter
        <code>infra-low-priority</code> for capacity rules). Reuse
        rather than duplicating the same webhook URL across channels.
      </p>

      <p class="example-intro">
        Deleting a channel that's still referenced by a rule returns a
        <code>409</code>; you'll need to repoint or delete the
        offending rules first. The error message names the channel,
        not the rules — list rules and grep
        <code>channel_id</code> if you need to find them.
      </p>
    </section>

    <!-- ─── Where it lives ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-database" /></span>
        <div>
          <div class="help-title">Where the data lives</div>
          <div class="help-sub">SQLITE · ONE ROW PER CHANNEL</div>
        </div>
      </header>

      <p class="example-intro">
        The <code>channels</code> table holds one row per channel —
        <code>id</code>, <code>name</code> (unique), <code>type</code>,
        and <code>config</code> (JSON blob with the per-type keys).
      </p>

      <p class="example-intro">
        Every alert rule's <code>channel_id</code> column references
        this table. Vigil refuses to delete a channel still referenced
        by any rule (the 409 you'll see in the UI).
      </p>
    </section>

    <!-- ─── Pointer to live page ────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— MANAGE CHANNELS</div>
        <p>
          Add, edit, and delete channels on the
          <RouterLink to="/hub/channels" class="lede-link">Channels</RouterLink>
          page. Same shape as the
          <RouterLink to="/hub/rules" class="lede-link">Alert rules</RouterLink>
          form.
        </p>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* Per-type tile colors so the status-grid tiles match the row chips on
   the live /hub/channels page (slack=blue, discord=purple, webhook=emerald).
   The base .status-tile chrome lives in help.scss; we only override the
   pill/dot color per modifier. */
.status-tile.is-slack .st-pill {
  color: #1d4ed8;
  background: rgba(96, 165, 250, 0.10);
  border: 1px solid rgba(96, 165, 250, 0.34);
}
.status-tile.is-discord .st-pill {
  color: #6d28d9;
  background: rgba(167, 139, 250, 0.10);
  border: 1px solid rgba(167, 139, 250, 0.34);
}
.status-tile.is-webhook .st-pill {
  color: #047857;
  background: rgba(52, 211, 153, 0.10);
  border: 1px solid rgba(52, 211, 153, 0.34);
}
body[data-theme="dark"] .status-tile.is-slack .st-pill   { color: #93c5fd; }
body[data-theme="dark"] .status-tile.is-discord .st-pill { color: #c4b5fd; }
body[data-theme="dark"] .status-tile.is-webhook .st-pill { color: #6ee7b7; }

/* Mono override inside the status-tile rule line — keeps the per-type
   key (`webhook_url`, `url`) in IBM Plex Mono. Same trick as the scope
   tiles on the Rules docs page. */
.status-tile .mono {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}
</style>
