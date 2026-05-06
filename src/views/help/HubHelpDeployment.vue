<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";
import {
  ArchDiagram,
  ArchStage,
  ArchNode,
  ArchEdge,
  ArchPill,
} from "@/components/help-diagram";

useDocumentTitle("Docs · Deployment");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Deployment" />

    <p class="lede">
      Vigil Pro pairs many <strong>Collectors</strong> with one
      <strong>Hub</strong>. Each Collector opens an outbound
      connection to the hub and pushes a sample every second — no port
      to open on the host, nothing for the hub to install on the
      monitored machine. This page walks through installing the hub,
      registering a host, pointing the Collector at it, and how the
      hub decides whether a host is still reachable. New here?
      <RouterLink to="/hub/help/overview">Start with the Overview</RouterLink>.
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

      <ArchDiagram caption="— FLEET TOPOLOGY">
        <ArchStage>
          <ArchNode title="Collector" sub="web-01.dc1" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
          <ArchNode title="Collector" sub="web-02.dc1" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
        </ArchStage>
        <ArchEdge
          :count="2"
          tone="emerald"
          label="wss://hub/ingest"
          sub="bearer = api_key · 1 Hz"
        />
        <ArchStage>
          <ArchNode
            title="Vigil Pro Hub"
            sub="aggregator + alerts"
            icon="fa-server"
            tone="amber"
            size="lg"
          >
            <ArchPill icon="fa-database" label="SQLite" tone="purple" />
          </ArchNode>
        </ArchStage>
      </ArchDiagram>
    </section>

    <!-- ─── Install the hub ─────────────────────────────────────── -->
    <section class="help-section" id="install-the-hub">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-download" /></span>
        <div>
          <div class="help-title">Install the hub</div>
          <div class="help-sub">DOWNLOAD · CONFIGURE · SYSTEMD</div>
        </div>
      </header>

      <p class="example-intro">
        The hub is a single Rust binary plus a SQLite file. No external
        database, no message queue, no companion processes — the same
        binary serves the admin API, ingests Collector pushes, runs
        the alert engine, and dispatches notifications.
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>LINUX · X86_64</span>
          <div class="st-rule mono"><a href="#">vigil-pro-linux-x86_64.tar.gz</a></div>
          <div class="st-desc">glibc 2.31+. Most fleets run the hub on a small Linux VM (1 vCPU / 1 GiB is plenty for a few hundred hosts).</div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>LINUX · AARCH64</span>
          <div class="st-rule mono"><a href="#">vigil-pro-linux-aarch64.tar.gz</a></div>
          <div class="st-desc">For Graviton, Ampere, or Raspberry Pi self-hosting.</div>
        </div>
        <div class="status-tile is-offline">
          <span class="st-pill"><span class="st-dot"></span>DOCKER</span>
          <div class="st-rule mono"><a href="#">ghcr.io/…/vigil-pro:latest</a></div>
          <div class="st-desc">Same binary in a distroless image. Mount a host directory at <code>/data</code> for the SQLite file.</div>
        </div>
      </div>

      <p class="example-intro">
        Quick check — drop the binary, generate an admin token, point
        it at a writable data directory, and run it in the foreground:
      </p>

      <pre class="cmd"><span class="prompt">$</span> curl -sSL <span class="string">https://…/vigil-pro-linux-x86_64.tar.gz</span> | sudo tar -xz -C /usr/local/bin
<span class="prompt">$</span> mkdir -p ./data
<span class="prompt">$</span> VIGIL_PRO_ADMIN_TOKEN=$(openssl rand -base64 32) \
  VIGIL_PRO_DB=./data/hub.db \
  vigil-pro
<span class="comment"># INFO  listening on http://0.0.0.0:4600</span></pre>

      <p class="example-intro">
        That's enough to point a UI build at and register your first
        host. For anything beyond a sanity check, run it as a service
        and read the token from a protected env file:
      </p>

      <pre class="cmd"><span class="comment"># /etc/systemd/system/vigil-pro.service</span>
<span class="metric">[Unit]</span>
Description=Vigil Pro Hub
After=network-online.target
Wants=network-online.target

<span class="metric">[Service]</span>
Type=simple
User=vigil-pro
Group=vigil-pro
EnvironmentFile=/etc/vigil-pro/hub.env
ExecStart=/usr/local/bin/vigil-pro
WorkingDirectory=/var/lib/vigil-pro
Restart=on-failure
RestartSec=5

<span class="metric">[Install]</span>
WantedBy=multi-user.target</pre>

      <pre class="cmd"><span class="prompt">$</span> sudo useradd --system --no-create-home --shell /usr/sbin/nologin vigil-pro
<span class="prompt">$</span> sudo install -d -m 0750 -o vigil-pro -g vigil-pro /var/lib/vigil-pro
<span class="prompt">$</span> sudo install -d -m 0750 -o root      -g vigil-pro /etc/vigil-pro
<span class="prompt">$</span> TOKEN=$(openssl rand -base64 32)
<span class="prompt">$</span> sudo tee /etc/vigil-pro/hub.env >/dev/null <span class="string">&lt;&lt;EOF</span>
<span class="string">VIGIL_PRO_ADMIN_TOKEN=$TOKEN</span>
<span class="string">VIGIL_PRO_DB=/var/lib/vigil-pro/hub.db</span>
<span class="string">EOF</span>
<span class="prompt">$</span> sudo chmod 0640 /etc/vigil-pro/hub.env
<span class="prompt">$</span> sudo chown root:vigil-pro /etc/vigil-pro/hub.env
<span class="prompt">$</span> sudo systemctl daemon-reload
<span class="prompt">$</span> sudo systemctl enable --now vigil-pro
<span class="prompt">$</span> journalctl -u vigil-pro -f</pre>

      <dl class="ds-list">
        <dt><code>VIGIL_PRO_ADMIN_TOKEN</code></dt>
        <dd>Bearer token gating every admin endpoint. Required — the hub refuses to start without one. Rotation guidance is in the next section.</dd>
        <dt><code>VIGIL_PRO_PORT</code></dt>
        <dd>HTTP listen port. Default <code>4600</code>. Note this is distinct from the Collector's bundled dashboard on <code>4500</code>.</dd>
        <dt><code>VIGIL_PRO_HOST</code></dt>
        <dd>Listen address. Default <code>0.0.0.0</code> — bind to <code>127.0.0.1</code> if you're fronting it with a reverse proxy on the same box.</dd>
        <dt><code>VIGIL_PRO_DB</code></dt>
        <dd>Path to the SQLite file. Default <code>data/hub.db</code> relative to the working directory. The hub creates the file on first start; back this one file up and you've backed up the hub.</dd>
        <dt><code>VIGIL_PRO_LOG_LEVEL</code></dt>
        <dd><code>info</code> by default. Set to <code>debug</code> to see ingest frames and dispatch attempts; <code>warn</code> for production noise floors.</dd>
      </dl>

      <p class="example-intro">
        <strong>TLS.</strong> The hub speaks HTTP, not HTTPS. Front it
        with nginx, Caddy, or your platform's load balancer for TLS
        termination — the Collectors and the UI both expect
        <code>wss://</code> / <code>https://</code> in production. A
        minimal nginx site:
      </p>

      <pre class="cmd"><span class="metric">server</span> {
    listen 443 ssl;
    server_name hub.example.com;
    ssl_certificate     /etc/ssl/hub.crt;
    ssl_certificate_key /etc/ssl/hub.key;

    location / {
        proxy_pass         http://127.0.0.1:4600;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection $connection_upgrade;
        proxy_read_timeout 90s;
    }
}</pre>

      <p class="example-intro mb-3">
        <strong>Upgrades.</strong> Replace the binary, then
        <code>systemctl restart vigil-pro</code>. The schema migrates
        forward automatically on start. There's no live-reload — the
        process restart is the upgrade. Backup the SQLite file first
        if you're upgrading across a major version.
      </p>
    </section>

    <!-- ─── Admin token ─────────────────────────────────────────── -->
    <section class="help-section" id="admin-token">
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

      <p class="example-intro mb-3">
        To rotate, repeat the first-time setup with a fresh value. The
        new token takes effect on the next request — there's no grace
        period, so update any scripts that hold the old one at the
        same time.
      </p>
    </section>

    <!-- ─── End-to-end deployment ───────────────────────────────── -->
    <section class="help-section" id="deploying-a-host">
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
            <pre class="cmd"><span class="prompt">$</span> curl -sX POST https://hub.vigil.edcs.app/api/hosts \
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
              Set the hub URL and API key on the Collector. CLI flags
              and env vars both work — env is easier for systemd. Tags
              set here are added to whatever the hub already has for
              the host.
            </p>
            <pre class="cmd mb-3"><span class="prompt">$</span> vigil-collector \
    <span class="flag">--hub</span>=<span class="string">wss://hub.vigil.edcs.app/ingest</span> \
    <span class="flag">--hub-key</span>=<span class="string">vh_…</span> \
    <span class="flag">--hub-name</span>=<span class="string">web-01.dc1</span></pre>
    <pre class="cmd"><span class="comment"># or via env (e.g. inside a systemd unit)</span>
<span class="prompt">$</span> export VIGIL_COLLECTOR_HUB=wss://hub.vigil.edcs.app/ingest
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
<span class="comment"># INFO  Pushing to Vigil Pro hub at wss://hub.vigil.edcs.app/ingest</span>
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
          <div class="help-sub">UI · OR PATCH /api/hosts/{id}</div>
        </div>
      </header>

      <p class="example-intro">
        Open any host from the
        <RouterLink to="/hub" class="lede-link">fleet view</RouterLink>
        — collector URL and tags are both edited inline on the detail
        page, no form to open. Three fields are writable; anything else
        in a <code>PATCH</code> body is ignored.
      </p>

      <dl class="ds-list">
        <dt><code>collector_url</code></dt>
        <dd>
          URL of the Collector's own dashboard for this host
          (e.g. <code>https://web-01.dc1:4500</code>). Click the pencil
          next to the URL on the host page to set it; once saved, the
          page shows an <em>Open dashboard</em> link.
        </dd>
        <dt><code>tags</code></dt>
        <dd>
          Replaces the host's tag list. The host detail page has an
          inline editor with autocomplete from existing fleet tags —
          click <em>+ tag</em>, type, Enter to commit; the × on each
          chip removes one. Tags are normalized to lowercase and must
          match <code>[a-z0-9_-]+</code> so they slot cleanly into
          alert scopes (<code>tag:&lt;value&gt;</code>). Changes affect
          alert scope matching on the next check.
        </dd>
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
        On the host detail page, the trash icon next to the collector
        URL deletes the host. Vigil asks for confirmation before
        removing it along with everything tied to it — raw samples,
        all rollups, alert state and history, the latest process
        snapshot. The Collector keeps retrying its old key in the
        background; stop it (or re-register the host to give it a
        fresh key) once you're done.
      </p>

      <p class="example-intro">
        Same call from the API:
      </p>

      <pre class="cmd"><span class="prompt">$</span> curl -sX DELETE https://hub.vigil.edcs.app/api/hosts/7 \
    -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span>
<span class="comment"># → {"ok": true}</span></pre>

      <p class="example-intro mb-3">
        Need it back? Run the same
        <em>register → point Collector → start</em> steps from
        <RouterLink to="/hub/help/deployment#deploying-a-host" class="lede-link">Deploying a host</RouterLink>
        above. The hub treats it as a brand-new host (new id, new
        api_key) — the previous samples and history don't come back
        with it.
      </p>
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
        <dt><code>host_process_latest</code></dt>
        <dd>Latest top-N processes per host. Replaced in full on every push — the host page reads from here for the Top Processes panel.</dd>
      </dl>
    </section>

    <!-- ─── Pointer onward ─────────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— NEXT</div>
        <p>
          Host registered and pushing? The
          <RouterLink to="/hub/help/metrics">Metrics</RouterLink>
          page covers what the Collector emits, and
          <RouterLink to="/hub/help/rules">Alert Rules</RouterLink>
          walks through writing your first threshold. Hitting trouble
          getting a host to show up? The
          <RouterLink to="/hub/help/troubleshooting">Troubleshooting</RouterLink>
          page covers the common failure modes.
        </p>
      </div>
    </section>
  </article>
</template>