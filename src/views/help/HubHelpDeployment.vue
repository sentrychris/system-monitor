<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Docs · Hub Deployment");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Hub Deployment" />

    <p class="lede">
      Vigil <span class="seg-pro" aria-label="Vigil Pro">Pro</span> pairs many <strong>Collectors</strong> with one
      commercial <strong>Hub</strong>. Each Collector opens an outbound
      WebSocket to the hub and pushes 1 Hz samples — there's no inbound
      port to expose, no agent for the hub to manage. This page walks
      through registering hosts, configuring the Collector, and the
      lifecycle the hub uses to decide whether a host is reachable.
    </p>

    <!-- ─── Architecture at a glance ────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-circle-nodes" /></span>
        <div>
          <div class="help-title">How a fleet talks to the hub</div>
          <div class="help-sub">PUSH · OUTBOUND · ONE WS PER COLLECTOR</div>
        </div>
      </header>

      <pre class="timeline"><span class="comment">             ┌──────────────┐    wss://hub/ingest   ┌──────────────┐</span>
<span class="comment">             │  Collector   │ ────── push 1 Hz ───> │              │</span>
<span class="comment">             │ web-01.dc1   │     bearer = api_key  │  Vigil Pro   │</span>
<span class="comment">             └──────────────┘                       │     Hub      │</span>
<span class="comment">             ┌──────────────┐    wss://hub/ingest   │              │</span>
<span class="comment">             │  Collector   │ ────── push 1 Hz ───> │  ┌────────┐  │</span>
<span class="comment">             │ web-02.dc1   │                       │  │ SQLite │  │</span>
<span class="comment">             └──────────────┘                       │  └────────┘  │</span>
<span class="comment">                       ...                          └──────────────┘</span></pre>
    </section>

    <!-- ─── End-to-end deployment ───────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-server" /></span>
        <div>
          <div class="help-title">Deploying a host</div>
          <div class="help-sub">REGISTER · CONFIGURE · START</div>
        </div>
      </header>

      <ol class="step-list">
        <li>
          <div class="step-body">
            <div class="step-title">Register the host with the hub</div>
            <p>
              Hit the admin API with a unique <code>name</code> (and any
              tags you want to scope alert rules by). The hub issues a
              one-time <code>api_key</code> in the response — it's stored
              hashed (argon2) on the hub and cannot be recovered later, so
              copy it straight into the Collector's config.
            </p>
            <pre class="cmd"><span class="prompt">$</span> curl -sX POST https://hub.example/api/hosts \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> \
    -H <span class="string">"Content-Type: application/json"</span> \
    -d <span class="string">'{"name": "web-01.dc1", "tags": ["dc1", "edge"]}'</span>
<span class="comment"># → {"id": 7, "name": "web-01.dc1", "api_key": "vh_…"}</span></pre>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Point the Collector at the hub</div>
            <p>
              Set the WebSocket URL and the api_key on the Collector. CLI
              flags or env vars both work — env is friendlier for systemd
              drop-ins. Tags here are appended to whatever the hub already
              has for the host.
            </p>
            <pre class="cmd"><span class="prompt">$</span> vigil-collector \
    <span class="flag">--hub</span>=<span class="string">wss://hub.example/ingest</span> \
    <span class="flag">--hub-key</span>=<span class="string">vh_…</span> \
    <span class="flag">--hub-name</span>=<span class="string">web-01.dc1</span>

<span class="comment"># or via env (e.g. inside a systemd unit)</span>
<span class="prompt">$</span> export VIGIL_COLLECTOR_HUB=wss://hub.example/ingest
<span class="prompt">$</span> export VIGIL_COLLECTOR_HUB_KEY=vh_…
<span class="prompt">$</span> export VIGIL_COLLECTOR_HUB_NAME=web-01.dc1
<span class="prompt">$</span> systemctl --user start vigil-collector</pre>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Verify the handshake</div>
            <p>
              On connect the Collector sends a <code>hello</code> frame
              with the host metadata; the hub authenticates the bearer,
              upserts the row, and replies with <code>welcome</code>.
              From there it's a 1 Hz push of <code>samples</code> +
              <code>processes</code> frames until the WS drops.
            </p>
            <pre class="cmd"><span class="prompt">$</span> journalctl -u vigil-collector -f
<span class="comment"># INFO  Pushing to Vigil Pro hub at wss://hub.example/ingest</span>
<span class="comment"># INFO  hub.connected: host=web-01.dc1 host_id=7 interval=1.00s</span></pre>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Confirm in the fleet view</div>
            <p>
              The host appears on <code>/hub</code> within one tick. Its
              card shows the <code>os</code>, <code>arch</code>,
              <code>cpu_cores</code>, and <code>agent_version</code> the
              Collector reported in <code>hello</code>, alongside the
              latest <code>cpu.usage</code> and <code>mem.percent</code>.
            </p>
          </div>
        </li>
      </ol>
    </section>

    <!-- ─── What hello carries ──────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-microchip" /></span>
        <div>
          <div class="help-title">What the Collector reports</div>
          <div class="help-sub">HELLO FRAME · STAMPED ON EVERY (RE)CONNECT</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>name</code></dt>
        <dd>Operator-assigned identifier. Must match the hub registration.</dd>
        <dt><code>hostname</code></dt>
        <dd>OS-reported hostname (<code>socket.gethostname()</code>).</dd>
        <dt><code>os</code></dt>
        <dd>
          Pretty distro string (e.g. <em>Ubuntu 24.04.1 LTS</em>,
          <em>macOS 14.5</em>, <em>Windows 11</em>). Falls back to
          <code>linux</code>/<code>darwin</code>/<code>windows</code> on
          containers or exotic distros.
        </dd>
        <dt><code>arch</code></dt>
        <dd>CPU architecture (<code>x86_64</code>, <code>aarch64</code>, …).</dd>
        <dt><code>cpu_cores</code></dt>
        <dd>Logical core count from psutil — used by the host page to scale the load-average reference line.</dd>
        <dt><code>agent_version</code></dt>
        <dd>Collector package version. Surfaces in the host meta tag and the data sheet.</dd>
        <dt><code>tags</code></dt>
        <dd>Free-form labels appended to whatever the hub stores. Used by alert rule scopes (<code>tag:edge</code>).</dd>
      </dl>
    </section>

    <!-- ─── Status freshness windows ────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-heart-pulse" /></span>
        <div>
          <div class="help-title">Status windows</div>
          <div class="help-sub">DERIVED FROM LAST_SEEN · SAME THRESHOLDS THE ALERT ENGINE USES</div>
        </div>
      </header>

      <p class="example-intro">
        The hub stamps <code>last_seen</code> on every ingest and on
        disconnect. The fleet view derives a tri-state status from the
        age of that timestamp — no separate heartbeat path.
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>LIVE</span>
          <div class="st-rule">age ≤ 90 s</div>
          <div class="st-desc">A frame arrived inside the last sampler-interval grace window. The alert engine treats this host as authoritative.</div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>STALE</span>
          <div class="st-rule">90 s &lt; age ≤ 600 s</div>
          <div class="st-desc">The Collector probably reconnecting (network blip, host paused). Fleet view dims the row but keeps the last-known metrics.</div>
        </div>
        <div class="status-tile is-offline">
          <span class="st-pill"><span class="st-dot"></span>OFFLINE</span>
          <div class="st-rule">age &gt; 600 s</div>
          <div class="st-desc">The host hasn't pushed for ten minutes. Alert evaluation skips this host so a dead Collector can't keep an old breach firing forever.</div>
        </div>
      </div>
    </section>

    <!-- ─── Editing a host ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-pen" /></span>
        <div>
          <div class="help-title">Editing a host</div>
          <div class="help-sub">PATCH · WHITELISTED FIELDS</div>
        </div>
      </header>

      <p class="example-intro">
        Three fields are operator-managed via <code>PATCH /api/hosts/{id}</code>.
        Anything else in the body is ignored (forward-compat).
      </p>

      <dl class="ds-list">
        <dt><code>collector_url</code></dt>
        <dd>
          Browser-reachable base URL of the Collector's own dashboard
          (e.g. <code>https://web-01.dc1:4500</code>). When set, the host
          page renders an <em>Open dashboard</em> deep-link.
        </dd>
        <dt><code>tags</code></dt>
        <dd>Replace the host's tag list. Affects alert rule scope matching on the next eval tick.</dd>
        <dt><code>enabled</code></dt>
        <dd><code>0</code> excludes the host from alert evaluation without disconnecting the Collector. Useful for muting a noisy box mid-incident.</dd>
      </dl>
    </section>

    <!-- ─── Removing a host ─────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-rose"><font-awesome-icon icon="fa-solid fa-trash" /></span>
        <div>
          <div class="help-title">Removing a host</div>
          <div class="help-sub">DELETE · CASCADES TO ALL TIERS</div>
        </div>
      </header>

      <p class="example-intro">
        <code>DELETE /api/hosts/{id}</code> drops the row and cascades
        through every dependent table — raw samples, every downsample
        tier, alert state, alert events, and the latest process snapshot.
        The Collector will keep retrying with backoff until you stop it
        or rotate to a fresh registration.
      </p>

      <pre class="cmd"><span class="prompt">$</span> curl -sX DELETE https://hub.example/api/hosts/7 \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span>
<span class="comment"># → {"ok": true}</span></pre>
    </section>

    <!-- ─── Where it lives ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-database" /></span>
        <div>
          <div class="help-title">Where the data lives</div>
          <div class="help-sub">SQLITE · ONE FILE · WAL</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>hosts</code></dt>
        <dd>One row per registered host. Holds the operator-set name, hashed api_key, the metadata stamped from the latest <code>hello</code>, and <code>last_seen</code>.</dd>
        <dt><code>samples_raw</code></dt>
        <dd>1 Hz observations, retained 6 hours. The rollup worker rolls them into <code>samples_1m</code>, <code>samples_5m</code>, and <code>samples_1h</code> for longer windows.</dd>
        <dt><code>host_processes_latest</code></dt>
        <dd>Snapshot-only top-N per host, replaced wholesale on every ingest. The host page polls a derived view of this for the Top Processes panel.</dd>
      </dl>
    </section>

    <!-- ─── Pointer to ops ─────────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— BULK PROVISIONING / SYSTEMD UNITS</div>
        <p>
          The full ops handbook — including the bundled systemd unit, an
          Ansible role, and the API curl recipes for batch host
          registration — lives on the hub host alongside the codebase.
        </p>
        <pre class="cta-cmd"><span class="prompt">$</span> cat ~/vigil-pro/docs/DEPLOYMENT.md</pre>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* "PRO" chip on the Hub segment — gold gradient (amber primary + secondary
   from BRANDING §3.5) for an unmistakable premium-tier signal without
   expanding the palette. Tiny, mono caps, dark text on gold for AA
   contrast. */
.seg-pro {
  display: inline-flex;
  align-items: center;
  padding: 0.08rem 0.4rem 0.1rem;
  border-radius: 4px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%);
  color: #422006;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1;
  box-shadow:
    0 0 10px -2px rgba(251, 191, 36, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.22);
  /* Slight upward translate to optically center against caps text. */
  transform: translateY(-0.5px);
}
/* Brighten the chip subtly when its segment is active or hovered — keeps
   the gold from looking dim against the cyan-tinted active background. */
.seg.is-active .seg-pro,
.seg:hover .seg-pro {
  box-shadow:
    0 0 14px -2px rgba(251, 191, 36, 0.6),
    inset 0 0 0 1px rgba(255, 255, 255, 0.32);
}
</style>