<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";

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

      <div class="example">
        <div class="example-eyebrow">— DATA FLOW</div>
        <pre class="timeline"><span class="comment">  ┌────────────┐   1 Hz push      ┌──────────────┐    HTTPS     ┌────────────┐</span>
<span class="comment">  │ Collector  │ ───────────────> │              │ <─────────── │            │</span>
<span class="comment">  │ web-01     │                  │              │              │            │</span>
<span class="comment">  └────────────┘                  │   Vigil Pro  │              │  Vigil UI  │</span>
<span class="comment">  ┌────────────┐                  │      Hub     │              │            │</span>
<span class="comment">  │ Collector  │ ───────────────> │              │              │            │</span>
<span class="comment">  │ web-02     │                  └──────────────┘              └────────────┘</span>
<span class="comment">  └────────────┘                       ▲                                         </span>
<span class="comment">       ▲                               │ admin token                            </span>
<span class="comment">       │                               │                                        </span>
<span class="comment">       └─── (single-host) ─────────────┴───── HTTP/WS ───────────────────────── </span></pre>
      </div>

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
