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

useDocumentTitle("Docs · The Vigil UI");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="The Vigil UI" />

    <p class="lede">
      The Vigil UI is the web app you're reading this in. It's a static
      hostable app, separate from the basic interface each Collector
      ships with. This page covers what the UI is, where it can run,
      and how it talks to the rest of Vigil. New here?
      <RouterLink to="/hub/help/overview">Start with the Overview</RouterLink>.
    </p>

    <!-- ─── Two dashboards, one look ───────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-laptop" /></span>
        <div>
          <div class="help-title">Two dashboards, one look</div>
          <div class="help-sub">BUNDLED WITH THE COLLECTOR · OR HOSTED SEPARATELY</div>
        </div>
      </header>

      <p class="example-intro">
        Two distinct things share the Vigil look-and-feel. They
        overlap on the per-host view, but only one of them scales to
        a fleet:
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>BUNDLED</span>
          <div class="st-rule mono">http://localhost:4500</div>
          <div class="st-desc">
            Each Collector serves a tiny built-in dashboard at port
            4500. Zero setup — start the Collector and open the page.
            Single host, live charts, no hub required. Good for one
            box; doesn't know any other Collector exists.
          </div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>STANDALONE</span>
          <div class="st-rule mono">https://status.edcs.app</div>
          <div class="st-desc">
            The Vigil UI you're using right now. Hosted anywhere you
            like, configured at build time to point at either a
            Collector (single-host) or a hub (fleet). Adds the fleet
            view, alert rules, channels, and history.
          </div>
        </div>
      </div>

      <p class="example-intro mb-3">
        The bundled dashboard is a convenience for running a single
        Collector. As soon as you want more than one host, alerts, or
        any persistence beyond "what's happening this second," you'll
        want the standalone UI pointed at a Vigil Pro hub.
      </p>
    </section>

    <!-- ─── Two operating modes ────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-circle-nodes" /></span>
        <div>
          <div class="help-title">Two operating modes</div>
          <div class="help-sub">SAME APP · POINT IT AT A COLLECTOR OR A HUB</div>
        </div>
      </header>

      <p class="example-intro">
        The UI is the same build either way; what it does is decided
        by which env vars are set when you build it.
      </p>

      <div class="status-grid">
        <div class="status-tile is-live">
          <span class="st-pill"><span class="st-dot"></span>SINGLE-HOST</span>
          <div class="st-rule mono">VITE_API_URL = http://host:4500</div>
          <div class="st-desc">
            Set <code>VITE_API_URL</code> (and the matching
            <code>VITE_WEBSOCKET_URL</code>) to a Collector. The
            <em>Host</em> view in the navbar lights up — you get the
            same per-host charts as the bundled dashboard, just
            served from wherever you've hosted the UI.
          </div>
        </div>
        <div class="status-tile is-stale">
          <span class="st-pill"><span class="st-dot"></span>HUB MODE</span>
          <div class="st-rule mono">VITE_HUB_URL = https://hub.example</div>
          <div class="st-desc">
            Set <code>VITE_HUB_URL</code> to your Vigil Pro hub. The
            <em>Hub</em> segment in the navbar appears, the
            <code>/hub/*</code> routes activate, and you get fleet
            view, alert rules, channels, host detail, and more. 
            You can set both — the navbar lets the user toggle.
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Where to host it ───────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-globe" /></span>
        <div>
          <div class="help-title">Where to host it</div>
          <div class="help-sub">STATIC BUILD · NO RUNTIME REQUIRED</div>
        </div>
      </header>

      <p class="example-intro">
        The UI distribution is a static build. No Node process, no
        database, no server-side runtime. You can drop it anywhere
        that serves static HTML, JS and CSS:
      </p>

      <p class="example-intro">
        <strong>Same machine as the Collector.</strong> Convenient
        for tiny deployments — the operator opens
        <code>https://that-host/</code> and sees the live data without
        any extra infra.
      </p>

      <p class="example-intro">
        <strong>A central admin host.</strong> The most common
        production pattern. Build the UI with
        <code>VITE_HUB_URL</code> set, deploy to nginx (or Apache, or
        Caddy), and put your hub at a known URL behind the same
        domain. The UI talks to the hub over HTTPS.
      </p>

      <p class="example-intro">
        <strong>S3 / CloudFront / GitHub Pages.</strong> Because the
        build is just static assets, any object store or CDN works.
        Pair with a public hub URL or a VPN-gated one — the UI
        doesn't care, it just makes HTTPS calls.
      </p>

      <p class="example-intro">
        Wherever you put it, the UI only needs network reach to the
        upstream Collector or hub. The browser does all the work; no
        special server permissions required.
      </p>

      <p class="example-intro mb-3">
        <strong>The UI doesn't have to be co-located with anything
        else.</strong> In hub mode it never talks to a Collector
        directly — only to the hub — so you can host the UI on a
        machine with zero agents installed. In single-host mode the
        Collector address is whatever you pass in
        <code>VITE_API_URL</code> — could be localhost, could be a
        remote box. The UI is pure client; what it can reach is
        decided by the build config and the network, not by where
        it's served from.
      </p>
    </section>

    <!-- ─── What the UI doesn't do ─────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-rose"><font-awesome-icon icon="fa-solid fa-bullseye" /></span>
        <div>
          <div class="help-title">What the UI doesn't do</div>
          <div class="help-sub">PURE CLIENT · NO STATE OF ITS OWN</div>
        </div>
      </header>

      <p class="example-intro">
        <strong>No data storage.</strong> The UI doesn't keep
        metrics, alert history, or rule definitions. Everything you
        see is fetched live from the Collector or the hub on each
        page view. Refresh the page and the cache is gone.
      </p>

      <p class="example-intro">
        <strong>No backend authentication.</strong> The UI prompts
        you for the hub's admin token and stores it in the browser
        (Pinia persisted state) so you don't re-enter it on every
        page load. There's no UI-side login server, no session
        cookie, no user accounts. Auth happens at the hub.
      </p>

      <p class="example-intro mb-3">
        <strong>No proxying.</strong> The browser talks to the
        Collector or hub directly. CORS and TLS are on the upstream
        side; if the hub doesn't accept your origin, the UI can't
        help you.
      </p>
    </section>

    <!-- ─── Operator shortcuts ─────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-bookmark" /></span>
        <div>
          <div class="help-title">Operator shortcuts</div>
          <div class="help-sub">PINS · TAG EDITOR · QUICK MUTE</div>
        </div>
      </header>

      <p class="example-intro">
        A handful of small affordances that come up often when running
        a fleet. None require setup; they're built into the UI.
      </p>

      <p class="example-intro">
        <strong>Pinned hosts.</strong> The host detail page has a
        bookmark button next to the dashboard link. Click it and the
        host appears as a chip in the navbar, persistent across page
        loads (per-browser via localStorage). The first few pins sit
        inline; the rest collapse into a <code>+N ▾</code> dropdown.
        The chip representing the host you're currently viewing lights
        up cyan to match the breadcrumb — same "you are here"
        vocabulary across the navbar.
      </p>

      <p class="example-intro">
        <strong>Inline tag editor.</strong> Tags on the host detail
        page are editable in place — <em>+ tag</em>, type, Enter
        commits; × on a chip removes. Autocomplete suggests tags
        already in use elsewhere on the fleet. The same data goes
        through <code>PATCH /api/hosts/{id}</code> as the API path,
        but the UI handles validation (lowercase,
        <code>[a-z0-9_-]+</code>) and the round-trip for you.
      </p>

      <p class="example-intro">
        <strong>Alert badges on the fleet view.</strong> Each host row
        in the fleet list shows a small icon+count chip when a rule is
        firing or breaching for that host — rose triangle for firing
        (pulsing), amber stopwatch for breaching. Same vocabulary as
        the
        <RouterLink to="/hub/help/alerts">Alert States</RouterLink>
        page; lets you spot trouble at a glance without opening the
        host page.
      </p>

      <p class="example-intro mb-3">
        <strong>Quick rule mute.</strong> The
        <RouterLink to="/hub/rules">Alert rules</RouterLink>
        view has an eye toggle on each row — one click flips a rule
        between watching (eye) and muted (eye-slash). Useful for
        silencing a noisy rule mid-incident; clears the rule's live
        firing state immediately so dashboards stop showing it.
      </p>
    </section>

    <!-- ─── How it relates ─────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-circle-nodes" /></span>
        <div>
          <div class="help-title">How it fits with the other pieces</div>
          <div class="help-sub">UI · COLLECTOR · HUB</div>
        </div>
      </header>

      <p class="example-intro">
        Three projects, one product. The UI is the front door, but
        it's never the source of truth — it always reads from
        somewhere upstream:
      </p>

      <ArchDiagram caption="— FLEET MODE · UI READS FROM THE HUB">
        <ArchStage>
          <ArchNode title="Collector" sub="web-01" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
          <ArchNode title="Collector" sub="web-02" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
        </ArchStage>
        <ArchEdge :count="2" tone="emerald" label="1 Hz push" sub="WebSocket" />
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
          <ArchNode title="Vigil UI" sub="this app" icon="fa-laptop" tone="cyan" />
        </ArchStage>
      </ArchDiagram>

      <ArchDiagram caption="— SINGLE-HOST MODE · UI POINTS DIRECTLY AT A COLLECTOR">
        <ArchStage>
          <ArchNode title="Collector" sub="any host" icon="fa-microchip" tone="emerald">
            <ArchPill icon="fa-gauge-high" label="dashboard :4500" tone="emerald" />
          </ArchNode>
        </ArchStage>
        <ArchEdge dir="left" tone="cyan" label="HTTP + WebSocket" sub="no hub in the loop" />
        <ArchStage>
          <ArchNode title="Vigil UI" sub="this app" icon="fa-laptop" tone="cyan" />
        </ArchStage>
      </ArchDiagram>

      <p class="example-intro">
        <strong><RouterLink to="/hub/help/fundamentals">Vigil Collector</RouterLink></strong>
        runs on each host, sampling psutil and either serving
        directly or pushing to the hub. MIT-licensed, public source.
      </p>

      <p class="example-intro">
        <strong>Vigil Pro</strong> is the hub — aggregates many
        Collectors, persists samples and rollups, evaluates alert
        rules, and dispatches to channels. Closed source, the
        commercial layer.
      </p>

      <p class="example-intro mb-3">
        <strong>Vigil (this UI)</strong> is the standalone web app
        you can point at either. Public source, no runtime; ships as
        static files.
      </p>
    </section>

    <!-- ─── Pointer ─────────────────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— GETTING THE PIECES TALKING</div>
        <p>
          Already have the UI hosted but no data showing up? The
          <RouterLink to="/hub/help/deployment">Deployment</RouterLink>
          page covers wiring a Collector to the hub, and the
          <RouterLink to="/hub/help/fundamentals">Fundamentals</RouterLink>
          page covers what each piece is for.
        </p>
      </div>
    </section>
  </article>
</template>
