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
        counters and more. One Collector per host gives you everything Vigil knows about it.
      </p>

      <p class="example-intro mb-3">
        It's intentionally small, packaged into one binary, no database, no
        plugins. Idle footprint is a few MB of RAM and a fraction of a
        percent of one core.
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

      <ArchDiagram caption="— HUB MODE AT A GLANCE">
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
          <ArchNode title="Vigil UI" sub="this app" icon="fa-laptop" tone="cyan" />
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
