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

useDocumentTitle("Docs · Overview");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Overview" />

    <p class="lede">
      Vigil watches one or many hosts. You install a small agent on
      each machine — the <strong>Collector</strong> — and either look
      at one host directly or aggregate many hosts on a central
      <strong>Hub</strong>. This page is the 30-second tour: what the
      pieces are, how they fit together, and where to go next.
    </p>

    <!-- ─── The three pieces ───────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-circle-nodes" /></span>
        <div>
          <div class="help-title">The three pieces</div>
          <div class="help-sub">COLLECTOR · HUB · UI</div>
        </div>
      </header>

      <p class="example-intro">
        Three projects, one product. Each owns a clear job, and the
        wire protocol between them is small enough to fit on one
        page.
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>COLLECTOR</span>
          <div class="st-rule mono">runs on each host</div>
          <div class="st-desc">
            Small agent built in Rust. Samples CPU, memory, disk, and network
            once a second. Serves a built-in dashboard locally and can
            push to a hub.
          </div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>HUB</span>
          <div class="st-rule mono">central aggregator</div>
          <div class="st-desc">
            Vigil Pro. Receives Collector pushes, persists samples
            and rollups, evaluates alert rules, dispatches
            notifications. One SQLite file, no separate database to
            run.
          </div>
        </div>
        <div class="status-tile is-offline">
          <span class="st-pill"><span class="st-dot"></span>UI</span>
          <div class="st-rule mono">visual interface</div>
          <div class="st-desc">
            Standalone static app. Hosted anywhere, configured at build
            time to point at a Collector, a Pro Hub, or both. Pure client
            — no storage, no proxying.
          </div>
        </div>
      </div>

      <ArchDiagram caption="— SINGLE-HOST MODE · UI READS ONE COLLECTOR">
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

      <ArchDiagram caption="— FLEET MODE · MANY HOSTS THROUGH A HUB">
        <ArchStage>
          <ArchNode title="Collector" sub="web-01" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
          <ArchNode title="Collector" sub="web-02" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
        </ArchStage>
        <ArchEdge :count="2" tone="emerald" label="1 Hz push" sub="WebSocket · outbound" />
        <ArchStage>
          <ArchNode
            title="Vigil Pro Hub"
            sub="aggregator + alerts"
            icon="fa-server"
            tone="amber"
            size="lg"
          >
            <ArchPill icon="fa-database" label="SQLite" tone="purple" />
            <ArchPill icon="fa-key" label="admin token" tone="amber" />
          </ArchNode>
        </ArchStage>
        <ArchEdge dir="left" tone="cyan" label="HTTPS" sub="reads + admin" />
        <ArchStage>
          <ArchNode title="Vigil UI" sub="visual interface" icon="fa-laptop" tone="cyan" />
        </ArchStage>
      </ArchDiagram>

      <p class="example-intro mb-3">
        The UI doesn't have to be near anything else — it talks to
        the Collector or the Hub over HTTP(S) from wherever you host
        it. A laptop, a CDN, a private nginx, doesn't matter.
      </p>
    </section>

    <!-- ─── Pick your setup ────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-server" /></span>
        <div>
          <div class="help-title">Pick your setup</div>
          <div class="help-sub">THREE COMMON DEPLOYMENT PATTERNS</div>
        </div>
      </header>

      <p class="example-intro">
        Vigil scales down to one host and up to a fleet. Most
        deployments fall into one of three patterns:
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>SINGLE HOST</span>
          <div class="st-rule mono">Collector + bundled dashboard</div>
          <div class="st-desc">
            Install the Collector, open
            <code>http://localhost:4500</code>. Zero infrastructure
            beyond the agent. Good for dev boxes, homelabs, and any
            "I just want to see what this one machine is doing"
            situation.
          </div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>FLEET</span>
          <div class="st-rule mono">Collectors → Hub → UI</div>
          <div class="st-desc">
            Run a Vigil Pro hub somewhere reachable. Each Collector
            pushes to it over an outbound WebSocket — no ports to
            open on the hosts. Host the standalone UI anywhere
            (admin VM, nginx, CDN, GitHub Pages) and point it at the
            hub. Adds fleet view, alerts, channels, and history.
          </div>
        </div>
        <div class="status-tile is-offline">
          <span class="st-pill"><span class="st-dot"></span>HYBRID</span>
          <div class="st-rule mono">Hub + per-host dashboards</div>
          <div class="st-desc">
            Same as Fleet, but each Collector also keeps its bundled
            dashboard exposed for ad-hoc deep dives. Operators use
            the Hub for the bird's-eye view and click through to a
            host's local dashboard when they need real-time detail
            the Hub's rolled-up data doesn't show.
          </div>
        </div>
      </div>

      <p class="example-intro mb-3">
        You can move between patterns over time. Start with one
        Collector, add a hub when a second host shows up, host the
        UI somewhere central when more than one person needs
        access.
      </p>
    </section>

    <!-- ─── First steps ────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-bolt" /></span>
        <div>
          <div class="help-title">First steps</div>
          <div class="help-sub">FROM ZERO TO YOUR FIRST ALERT</div>
        </div>
      </header>

      <p class="example-intro">
        The fastest path to seeing something working:
      </p>

      <ol class="step-list">
        <li>
          <div class="step-body">
            <div class="step-title">Install a Collector on the host you want to watch</div>
            <p>
              Grab the Collector binary, run it. It listens on
              <code>:4500</code> with no config — open that port in a
              browser and you'll see live charts immediately. This
              alone is the Single-Host pattern. Download links and a
              systemd recipe are on the
              <RouterLink to="/hub/help/fundamentals#install">Fundamentals</RouterLink>
              page.
            </p>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">(Optional) Stand up a Hub and point the Collector at it</div>
            <p>
              For more than one host, install the hub
              (<RouterLink to="/hub/help/deployment#install-the-hub">Install the hub</RouterLink>),
              register the host with <code>POST /api/hosts</code>, and
              pass the returned api_key to the Collector via
              <code>--hub</code> and <code>--hub-key</code>. Full
              walkthrough on the
              <RouterLink to="/hub/help/deployment">Deployment</RouterLink>
              page.
            </p>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Configure a channel</div>
            <p>
              Channels are where alerts get sent — Slack, Discord, or
              a generic webhook. Add one on the
              <RouterLink to="/hub/channels">Channels</RouterLink>
              page (or via the API). You'll need at least one before
              you can save a rule.
            </p>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Write your first alert rule</div>
            <p>
              Pick a metric (<code>cpu.usage</code>,
              <code>mem.percent</code>, …), a threshold, and a
              channel. The rule lives on the
              <RouterLink to="/hub/rules">Alert rules</RouterLink>
              page. The
              <RouterLink to="/hub/help/rules">Alert Rules</RouterLink>
              docs walk through every field.
            </p>
          </div>
        </li>
      </ol>
    </section>

    <!-- ─── Where to dig deeper ────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-table-list" /></span>
        <div>
          <div class="help-title">Where to dig deeper</div>
          <div class="help-sub">THE REST OF THE DOCS · ROUGHLY IN READING ORDER</div>
        </div>
      </header>

      <p class="example-intro">
        Each page in the sidebar covers one concept end-to-end. Read
        them in this order if you're new; jump straight to the one
        you need otherwise:
      </p>

      <dl class="ds-list">
        <dt><RouterLink to="/hub/help/fundamentals">Fundamentals</RouterLink></dt>
        <dd>The Collector in depth — what it does, what it doesn't, what it sends.</dd>
        <dt><RouterLink to="/hub/help/ui">The Vigil UI</RouterLink></dt>
        <dd>The web app you're using right now — how it differs from the bundled Collector dashboard, where to host it.</dd>
        <dt><RouterLink to="/hub/help/deployment">Deployment</RouterLink></dt>
        <dd>The how-to: registering a host, configuring the Collector, the admin token, host status windows.</dd>
        <dt><RouterLink to="/hub/help/metrics">Metrics</RouterLink></dt>
        <dd>The full catalog of what the Collector emits, with units and caveats.</dd>
        <dt><RouterLink to="/hub/help/channels">Channels</RouterLink></dt>
        <dd>Slack, Discord, and webhook configuration; what each receiver gets on dispatch.</dd>
        <dt><RouterLink to="/hub/help/rules">Alert Rules</RouterLink></dt>
        <dd>The seven fields of a rule, scope syntax, the API.</dd>
        <dt><RouterLink to="/hub/help/alerts">Alert States</RouterLink></dt>
        <dd>The three-state machine that decides when an alert actually fires.</dd>
        <dt><RouterLink to="/hub/help/troubleshooting">Troubleshooting</RouterLink></dt>
        <dd>The common failure modes when wiring this up — symptom on the left, what to check on the right.</dd>
      </dl>
    </section>
  </article>
</template>
