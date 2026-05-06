<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Docs · Fundamentals");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Fundamentals" />

    <p class="lede">
      Vigil is built around the <strong>Collector</strong> — a small
      Python agent that runs on each host, takes a snapshot of the
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
        The Collector is a single Python process that you run on each
        machine you want to monitor. It uses
        <code>psutil</code> to read CPU, memory, disk, and network
        counters, and packages those into a snapshot every second. No
        agent on the host means no data; one Collector per host gives
        you everything Vigil knows about it.
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

      <p class="example-intro">
        These aren't exclusive — a Collector with <code>--hub</code>
        set still serves its bundled dashboard locally. The
        <RouterLink to="/hub/help/ui">Vigil UI</RouterLink> page covers
        what the standalone web app does with this data on the other
        end.
      </p>

      <div class="example">
        <div class="example-eyebrow">— HUB MODE AT A GLANCE</div>
        <pre class="timeline"><span class="comment">  ┌────────────┐    wss://hub/ingest   ┌──────────────┐    https   ┌────────┐</span>
<span class="comment">  │ Collector  │ ──── push 1 Hz ─────> │              │ <───────── │        │</span>
<span class="comment">  │ web-01     │                       │              │            │   UI   │</span>
<span class="comment">  └────────────┘                       │   Vigil Pro  │            │        │</span>
<span class="comment">  ┌────────────┐                       │      Hub     │            └────────┘</span>
<span class="comment">  │ Collector  │ ──── push 1 Hz ─────> │              │</span>
<span class="comment">  │ web-02     │                       │   ┌────────┐ │</span>
<span class="comment">  └────────────┘                       │   │ SQLite │ │</span>
<span class="comment">           ...                         │   └────────┘ │</span>
<span class="comment">                                       └──────────────┘</span></pre>
      </div>
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
        On connect the Collector introduces itself with a
        <code>hello</code> frame (host name, OS, CPU cores, agent
        version, tags). After the hub replies with
        <code>welcome</code>, it pushes one <code>samples</code> frame
        per second carrying every metric value. A separate
        <code>processes</code> frame carries the top-N processes by
        memory.
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
