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
  ArchSequence,
  ArchSequenceFrame,
} from "@/components/help-diagram";

useDocumentTitle("Docs · Fundamentals");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Fundamentals" />

    <p class="lede">
      Vigil is built around the <strong>Collector</strong> — a small
      agent built in Rust. It runs on each host, takes a snapshot of the
      system once a second, and either serves it locally or pushes it
      to a central <strong>Hub</strong>. This page is the Collector
      in depth. New here?
      <RouterLink to="/hub/help/overview">Start with the Overview</RouterLink>.
    </p>

    <!-- ─── What a Collector is ────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-microchip" /></span>
        <div>
          <div class="help-title">What a Collector is</div>
          <div class="help-sub">ONE AGENT PER HOST · LIGHTWEIGHT · MIT</div>
        </div>
      </header>

      <p class="example-intro">
        The Collector is a single process that you run on each
        machine you want to monitor. It reads CPU, memory, disk, network
        counters and more.
      </p>

      <p class="example-intro mb-3">
        It's intentionally small, packaged into one tiny binary, no database, no
        plugins. Idle footprint is a few MB of RAM and a fraction of a
        percent of one core.
      </p>
    </section>

    <!-- ─── Install ────────────────────────────────────────────── -->
    <section class="help-section" id="install">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-download" /></span>
        <div>
          <div class="help-title">Install</div>
          <div class="help-sub">DOWNLOAD · RUN · (OPTIONAL) SYSTEMD</div>
        </div>
      </header>

      <p class="example-intro">
        The Collector is a single static binary. Pick the build for your
        platform, drop it on the host, and it runs — no shared libraries,
        no installer.
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>LINUX · X86_64</span>
          <div class="st-rule mono"><a href="#">vigil-collector-linux-x86_64.tar.gz</a></div>
          <div class="st-desc">glibc 2.31+ (Ubuntu 20.04, Debian 11, RHEL 9, equivalents).</div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>LINUX · AARCH64</span>
          <div class="st-rule mono"><a href="#">vigil-collector-linux-aarch64.tar.gz</a></div>
          <div class="st-desc">Raspberry Pi 4/5, Graviton, Ampere — same glibc floor.</div>
        </div>
        <div class="status-tile is-offline">
          <span class="st-pill"><span class="st-dot"></span>MACOS · UNIVERSAL</span>
          <div class="st-rule mono"><a href="#">vigil-collector-macos.tar.gz</a></div>
          <div class="st-desc">Universal binary — Intel and Apple Silicon. macOS 12+.</div>
        </div>
      </div>

      <p class="example-intro">
        Drop the binary somewhere on <code>$PATH</code> and confirm it
        runs:
      </p>

      <pre class="cmd"><span class="prompt">$</span> curl -sSL <span class="string">https://…/vigil-collector-linux-x86_64.tar.gz</span> | sudo tar -xz -C /usr/local/bin
<span class="prompt">$</span> vigil-collector --version</pre>

      <p class="example-intro">
        With no flags, the Collector listens on <code>:4500</code> for
        the bundled dashboard. Open
        <code>http://localhost:4500</code> and you'll see live charts.
        Stop it with Ctrl-C; that's the whole single-host experience.
      </p>

      <p class="example-intro">
        For long-lived deployments — and required if you're pushing to a
        hub — run it as a service. The systemd unit below reads its
        config from <code>/etc/vigil-collector/collector.env</code> so
        the api_key never appears on the command line:
      </p>

      <pre class="cmd"><span class="comment"># /etc/systemd/system/vigil-collector.service</span>
<span class="metric">[Unit]</span>
Description=Vigil Collector
After=network-online.target
Wants=network-online.target

<span class="metric">[Service]</span>
Type=simple
User=vigil-collector
EnvironmentFile=-/etc/vigil-collector/collector.env
ExecStart=/usr/local/bin/vigil-collector
Restart=on-failure
RestartSec=5

<span class="metric">[Install]</span>
WantedBy=multi-user.target</pre>

      <p class="example-intro">
        Create an unprivileged user and the env file with the host's
        api_key (issued by the hub — see the
        <RouterLink to="/hub/help/deployment#deploying-a-host" class="lede-link">Deployment</RouterLink>
        page for how to register a host and obtain one):
      </p>

      <pre class="cmd"><span class="prompt">$</span> sudo useradd --system --no-create-home --shell /usr/sbin/nologin vigil-collector
<span class="prompt">$</span> sudo install -d -m 0750 -o root -g vigil-collector /etc/vigil-collector
<span class="prompt">$</span> sudo tee /etc/vigil-collector/collector.env >/dev/null <span class="string">&lt;&lt;'EOF'</span>
<span class="string">VIGIL_COLLECTOR_HUB=wss://hub.example/ingest</span>
<span class="string">VIGIL_COLLECTOR_HUB_KEY=vh_…</span>
<span class="string">VIGIL_COLLECTOR_HUB_NAME=web-01.dc1</span>
<span class="string">VIGIL_COLLECTOR_HUB_TAGS=dc1,edge</span>
<span class="string">EOF</span>
<span class="prompt">$</span> sudo chmod 0640 /etc/vigil-collector/collector.env
<span class="prompt">$</span> sudo chown root:vigil-collector /etc/vigil-collector/collector.env
<span class="prompt">$</span> sudo systemctl daemon-reload
<span class="prompt">$</span> sudo systemctl enable --now vigil-collector
<span class="prompt">$</span> journalctl -u vigil-collector -f</pre>

      <p class="example-intro">
        Every value above also has an equivalent CLI flag — handy for
        ad-hoc runs from a shell, but for a real service the env file
        keeps the api_key off the process listing.
      </p>

      <dl class="ds-list">
        <dt><code>VIGIL_COLLECTOR_HUB</code> · <code>--hub</code></dt>
        <dd>WebSocket URL of the Vigil Pro hub. Omit for single-host mode.</dd>
        <dt><code>VIGIL_COLLECTOR_HUB_KEY</code> · <code>--hub-key</code></dt>
        <dd>Per-host api_key issued by the hub when you register the host.</dd>
        <dt><code>VIGIL_COLLECTOR_HUB_NAME</code> · <code>--hub-name</code></dt>
        <dd>The host name registered with the hub. Must match the <code>name</code> you used on <code>POST /api/hosts</code> exactly — a mismatch shows up as <code>auth_failed</code> in the Collector log. Defaults to the system hostname if unset.</dd>
        <dt><code>VIGIL_COLLECTOR_HUB_TAGS</code> · <code>--hub-tags</code></dt>
        <dd>Comma-separated tags merged into whatever the hub already has for the host. Used in alert rule scopes (<code>tag:edge</code>).</dd>
        <dt><code>--address</code> · <code>--port</code></dt>
        <dd>Override the bundled dashboard's listen address and port. Default: all interfaces, port <code>4500</code>.</dd>
      </dl>

      <p class="example-intro mb-3">
        macOS uses <code>launchd</code> instead of systemd; a sample
        <code>.plist</code> with the same env-file pattern lives in the
        Collector source. Windows builds are not currently distributed.
      </p>
    </section>

    <!-- ─── Two ways to use it ─────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-circle-nodes" /></span>
        <div>
          <div class="help-title">Two ways to use it</div>
          <div class="help-sub">SINGLE-HOST · OR PUSH TO A HUB</div>
        </div>
      </header>

      <p class="example-intro">
        Same Collector binary, two ways it can be used. The difference
        is where its data ends up:
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>SERVES LOCALLY</span>
          <div class="st-rule mono">HTTP + WS on :4500</div>
          <div class="st-desc">
            The Collector exposes its own dashboard at port 4500. Open
            it in a browser to see live charts for that host. No hub
            in the loop, no aggregation — just this machine.
          </div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>PUSHES TO A HUB</span>
          <div class="st-rule mono">outbound 1 Hz WebSocket</div>
          <div class="st-desc">
            With <code>--hub</code> set, the Collector also opens an
            outbound WebSocket and pushes one sample per second to a
            Vigil Pro hub. The local dashboard keeps working — pushing
            is additive, not exclusive.
          </div>
        </div>
      </div>

      <p class="example-intro mb-3">
        These aren't exclusive — a Collector with <code>--hub</code>
        set still serves its bundled dashboard locally. The
        <RouterLink to="/hub/help/ui">Vigil UI</RouterLink> page covers
        what the standalone web app does with this data on the other
        end.
      </p>

      <ArchDiagram caption="— SINGLE-HOST MODE · COLLECTOR SERVES DIRECTLY">
        <ArchStage>
          <ArchNode title="Collector" sub="any host" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
        </ArchStage>
        <ArchEdge dir="left" tone="cyan" label="HTTP + WebSocket" sub="no hub in the loop" />
        <ArchStage>
          <ArchNode title="Vigil UI" sub="bundled or standalone" icon="fa-laptop" tone="cyan" />
        </ArchStage>
      </ArchDiagram>

      <ArchDiagram caption="— HUB MODE · COLLECTORS PUSH TO THE HUB">
        <ArchStage>
          <ArchNode title="Collector" sub="web-01" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
          <ArchNode title="Collector" sub="web-02" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
        </ArchStage>
        <ArchEdge :count="2" tone="emerald" label="wss://hub/ingest" sub="push · 1 Hz" />
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
        <ArchEdge dir="left" tone="cyan" label="HTTPS" sub="reads + admin" />
        <ArchStage>
          <ArchNode title="Vigil UI" sub="visual interface" icon="fa-laptop" tone="cyan" />
        </ArchStage>
      </ArchDiagram>
    </section>

    <!-- ─── What it sends ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-tower-broadcast" /></span>
        <div>
          <div class="help-title">What the Collector sends</div>
          <div class="help-sub">HELLO ONCE · SAMPLES EVERY SECOND</div>
        </div>
      </header>

      <p class="example-intro">
        Every frame is a JSON message over a single long-lived
        WebSocket. The lifecycle has three phases — a one-time
        handshake, a steady stream of samples, and lightweight
        keepalives.
      </p>

      <ArchSequence
        caption="— FRAME FLOW"
        left-actor="Collector"
        left-sub="web-01"
        left-icon="fa-microchip"
        left-tone="emerald"
        right-actor="Vigil Pro Hub"
        right-sub="aggregator"
        right-icon="fa-server"
        right-tone="amber"
      >
        <ArchSequenceFrame
          dir="right"
          label="hello"
          sub="api_key + host info"
          tone="emerald"
          phase="handshake"
          phase-sub="once per connection"
        />
        <ArchSequenceFrame
          dir="left"
          label="welcome"
          sub="host_id, interval"
          tone="amber"
        />
        <ArchSequenceFrame
          dir="right"
          label="samples"
          sub="ts + metric map"
          tone="cyan"
          phase="stream"
          phase-sub="every 1 s"
        />
        <ArchSequenceFrame
          dir="right"
          label="samples"
          tone="cyan"
        />
        <ArchSequenceFrame
          dir="right"
          label="processes"
          sub="ts + top-N by memory"
          tone="purple"
          phase="snapshot"
          phase-sub="occasional"
        />
        <ArchSequenceFrame
          dir="left"
          label="ping"
          tone="neutral"
          phase="keepalive"
          phase-sub="either side"
        />
        <ArchSequenceFrame
          dir="right"
          label="pong"
          tone="neutral"
        />
      </ArchSequence>

      <p class="example-intro">
        On connect the Collector introduces itself with a
        <code>hello</code> frame — host name, OS, CPU cores, agent
        version, tags, and the per-host API key. The hub verifies the
        key, replies with <code>welcome</code> carrying an assigned
        <code>host_id</code> and the suggested cadence, and from then
        on the Collector pushes one <code>samples</code> frame per
        tick. The <code>processes</code> frame is a separate, less
        frequent snapshot of the top-N processes by memory.
      </p>

      <p class="example-intro">
        Either side can send <code>ping</code>; the other replies with
        <code>pong</code>. That keeps the WebSocket alive across NAT
        idle timers without the Collector having to reconnect.
      </p>

      <p class="example-intro mb-3">
        The full list of what's in <code>samples</code> lives on the
        <RouterLink to="/hub/help/metrics" class="lede-link">Metrics</RouterLink>
        page; the wire shape is documented there too.
      </p>
    </section>

    <!-- ─── What it doesn't do ─────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-bullseye" /></span>
        <div>
          <div class="help-title">What the Collector doesn't do</div>
          <div class="help-sub">ON PURPOSE · KEEPS IT SIMPLE</div>
        </div>
      </header>

      <p class="example-intro">
        The Collector is deliberately a thin agent. Anything beyond
        "look at the host right now" lives on the hub side:
      </p>

      <p class="example-intro">
        <strong>No history.</strong> The Collector only holds the
        latest snapshot. The hub stores raw samples, rolls them up
        into 1m/5m/1h tiers, and serves the historical charts.
      </p>

      <p class="example-intro">
        <strong>No alerts.</strong> Thresholds, the firing/breaching
        state machine, and dispatch to Slack/Discord/webhooks all
        live on the hub — see the
        <RouterLink to="/hub/help/alerts" class="lede-link">Alert States</RouterLink>
        page.
      </p>

      <p class="example-intro mb-3">
        <strong>No inbound port for the hub.</strong> The Collector
        opens an outbound WebSocket to the hub and pushes; the hub
        never connects back. If the link drops, the Collector
        reconnects with backoff. Nothing on the host needs to be
        firewall-exposed for hub mode.
      </p>
    </section>

    <!-- ─── Pointer to deployment ──────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— NEXT: GET A COLLECTOR RUNNING</div>
        <p>
          Ready to wire one up? The
          <RouterLink to="/hub/help/deployment" class="lede-link">Deployment</RouterLink>
          page walks through registering a host with the hub, pointing
          the Collector at the right URL, and checking the handshake.
        </p>
      </div>
    </section>
  </article>
</template>
