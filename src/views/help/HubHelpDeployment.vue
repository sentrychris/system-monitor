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
      <strong>Hub</strong>. Each Collector opens an outbound
      connection to the hub and pushes a sample every second — no port
      to open on the host, nothing for the hub to install. This page
      walks through registering a host, pointing the Collector at the
      hub, and how the hub decides whether a host is still reachable.
    </p>

    <!-- ─── Architecture at a glance ────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-circle-nodes" /></span>
        <div>
          <div class="help-title">How a fleet talks to the hub</div>
          <div class="help-sub">EACH HOST PUSHES TO THE HUB</div>
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

    <!-- ─── Admin token ─────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-key" /></span>
        <div>
          <div class="help-title">Admin token</div>
          <div class="help-sub">REQUIRED FOR EVERY ADMIN API CALL</div>
        </div>
      </header>

      <p class="example-intro">
        Every admin endpoint (registering hosts, writing alert rules,
        editing channels) is gated by a single bearer token. The
        examples on this page reference it as
        <code>$HUB_ADMIN_TOKEN</code>.
      </p>

      <p class="example-intro">
        The hub reads the token from <code>VIGIL_PRO_ADMIN_TOKEN</code>
        at startup, and the systemd unit picks that env var up from
        <code>/etc/vigil-pro/hub.env</code> (root, mode 600). The hub
        refuses to start without one.
      </p>

      <p class="example-intro">
        First-time setup — generate a token, write it to the env file,
        restart the hub:
      </p>

      <pre class="cmd"><span class="prompt">$</span> TOKEN=$(openssl rand -base64 32)
<span class="prompt">$</span> echo <span class="string">"VIGIL_PRO_ADMIN_TOKEN=$TOKEN"</span> | sudo tee /etc/vigil-pro/hub.env >/dev/null
<span class="prompt">$</span> sudo systemctl restart vigil-pro</pre>

      <p class="example-intro">
        Get the current value back from a running install:
      </p>

      <pre class="cmd"><span class="prompt">$</span> sudo grep -oP <span class="string">'^VIGIL_PRO_ADMIN_TOKEN=\K.*'</span> /etc/vigil-pro/hub.env</pre>

      <p class="example-intro">
        To rotate, repeat the first-time setup with a fresh value. The
        new token takes effect on the next request — there's no grace
        period, so update any scripts that hold the old one at the
        same time.
      </p>
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
              Call the admin API with a unique <code>name</code> (and
              any tags you want to use in alert rules). The hub returns
              an <code>api_key</code> once — it's stored hashed and
              can't be retrieved later, so copy it straight into the
              Collector's config.
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
              Set the hub URL and api_key on the Collector. CLI flags
              and env vars both work — env is easier for systemd. Tags
              set here are added to whatever the hub already has for
              the host.
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
              On connect, the Collector introduces itself with a
              <code>hello</code> frame; the hub authenticates the key,
              updates the host record, and replies with
              <code>welcome</code>. From there it's a steady push of
              <code>samples</code> and <code>processes</code> frames
              until the connection drops.
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
              The host appears on <code>/hub</code> within a second.
              Its card shows the OS, architecture, CPU cores, and
              Collector version reported in <code>hello</code>,
              alongside the latest <code>cpu.usage</code> and
              <code>mem.percent</code>.
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
          <div class="help-sub">SENT ON EVERY (RE)CONNECT</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>name</code></dt>
        <dd>The name you set when registering. Must match.</dd>
        <dt><code>hostname</code></dt>
        <dd>The host's operating-system hostname.</dd>
        <dt><code>os</code></dt>
        <dd>
          Pretty distro string (<em>Ubuntu 24.04.1 LTS</em>,
          <em>macOS 14.5</em>, <em>Windows 11</em>). Falls back to
          <code>linux</code>/<code>darwin</code>/<code>windows</code>
          on containers or unusual distros.
        </dd>
        <dt><code>arch</code></dt>
        <dd>CPU architecture (<code>x86_64</code>, <code>aarch64</code>, …).</dd>
        <dt><code>cpu_cores</code></dt>
        <dd>Number of logical CPU cores. The host page uses this to scale the load-average reference line.</dd>
        <dt><code>agent_version</code></dt>
        <dd>Collector version. Shown on the host's metadata tag and data sheet.</dd>
        <dt><code>tags</code></dt>
        <dd>Labels added to whatever the hub already has. Used in alert rule scopes (<code>tag:edge</code>).</dd>
      </dl>
    </section>

    <!-- ─── Status freshness windows ────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-heart-pulse" /></span>
        <div>
          <div class="help-title">Status windows</div>
          <div class="help-sub">HOW VIGIL DECIDES IF A HOST IS REACHABLE</div>
        </div>
      </header>

      <p class="example-intro">
        The hub records <code>last_seen</code> every time a host pushes
        data and again when it disconnects. The fleet view derives the
        host's status from how old that timestamp is — no separate
        heartbeat.
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>LIVE</span>
          <div class="st-rule">age ≤ 90 s</div>
          <div class="st-desc">A sample arrived recently. Vigil uses this host's metrics for alerts.</div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>STALE</span>
          <div class="st-rule">90 s &lt; age ≤ 600 s</div>
          <div class="st-desc">The Collector is probably reconnecting (network blip, host paused). The fleet view dims the row but keeps the last-known values.</div>
        </div>
        <div class="status-tile is-offline">
          <span class="st-pill"><span class="st-dot"></span>OFFLINE</span>
          <div class="st-rule">age &gt; 600 s</div>
          <div class="st-desc">The host hasn't pushed for ten minutes. Vigil skips it for alerts so a dead Collector can't keep an old breach firing.</div>
        </div>
      </div>
    </section>

    <!-- ─── Editing a host ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-pen" /></span>
        <div>
          <div class="help-title">Editing a host</div>
          <div class="help-sub">THREE FIELDS YOU CAN UPDATE</div>
        </div>
      </header>

      <p class="example-intro">
        Three fields can be updated via
        <code>PATCH /api/hosts/{id}</code>. Anything else in the body
        is ignored.
      </p>

      <dl class="ds-list">
        <dt><code>collector_url</code></dt>
        <dd>
          URL of the Collector's own dashboard for this host
          (e.g. <code>https://web-01.dc1:4500</code>). When set, the
          host page shows an <em>Open dashboard</em> link.
        </dd>
        <dt><code>tags</code></dt>
        <dd>Replaces the host's tag list. Affects alert scope matching on the next check.</dd>
        <dt><code>enabled</code></dt>
        <dd>Set to <code>0</code> to mute alerts for the host without disconnecting the Collector. Useful for muting a noisy host mid-incident.</dd>
      </dl>
    </section>

    <!-- ─── Removing a host ─────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-rose"><font-awesome-icon icon="fa-solid fa-trash" /></span>
        <div>
          <div class="help-title">Removing a host</div>
          <div class="help-sub">DELETES EVERYTHING TIED TO THE HOST</div>
        </div>
      </header>

      <p class="example-intro">
        <code>DELETE /api/hosts/{id}</code> removes the host and
        everything tied to it — raw samples, all rollups, alert state
        and history, the latest process snapshot. The Collector will
        keep retrying until you stop it or re-register with a new key.
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
        <dd>One row per registered host. Holds the host's name, the hashed api_key, the metadata from the latest <code>hello</code>, and <code>last_seen</code>.</dd>
        <dt><code>samples_raw</code></dt>
        <dd>Raw 1 Hz samples, kept for 6 hours, then rolled up into <code>samples_1m</code>, <code>samples_5m</code>, and <code>samples_1h</code> for longer windows.</dd>
        <dt><code>host_processes_latest</code></dt>
        <dd>Latest top-N processes per host. Replaced in full on every push — the host page reads from here for the Top Processes panel.</dd>
      </dl>
    </section>

    <!-- ─── Pointer to ops ─────────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— BULK PROVISIONING / SYSTEMD UNITS</div>
        <p>
          The full ops handbook — bundled systemd unit, an Ansible
          role, batch-registration recipes — lives in the hub source.
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