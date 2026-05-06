<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Docs · Troubleshooting");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Troubleshooting" />

    <p class="lede">
      The common failure modes when wiring up Vigil — symptom on the
      left, what to check on the right. Most issues fall into one of a
      handful of buckets: name mismatch, missing token, network reach,
      or a webhook the receiver no longer accepts. New here?
      <RouterLink to="/hub/help/overview">Start with the Overview</RouterLink>.
    </p>

    <!-- ─── Host shows up but no metrics ────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-microchip" /></span>
        <div>
          <div class="help-title">Host registered but no metrics</div>
          <div class="help-sub">FLEET VIEW SHOWS THE ROW · ALL CHARTS BLANK</div>
        </div>
      </header>

      <p class="example-intro">
        The host card exists (you registered it) but cpu and memory
        never populate. The Collector isn't actually connected. In
        order of likelihood:
      </p>

      <dl class="ds-list">
        <dt>Name mismatch</dt>
        <dd>
          The Collector's <code>--hub-name</code> (or
          <code>VIGIL_COLLECTOR_HUB_NAME</code>) must match the
          <code>name</code> you used on <code>POST /api/hosts</code>
          exactly — case-sensitive, dots and dashes included. A
          mismatch shows up in the Collector log as
          <code>auth_failed: unknown host</code>. Check both:
          <pre class="cmd"><span class="prompt">$</span> journalctl -u vigil-collector | grep -i hub
<span class="prompt">$</span> curl -sH <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> https://hub.example/api/hosts | jq <span class="string">'.[].name'</span></pre>
        </dd>
        <dt>Wrong api_key</dt>
        <dd>
          The hub returns the api_key once, hashed thereafter — there's
          no way to look it up. If you've lost it, re-register the
          host (it gets a new id and key) or rotate via
          <code>POST /api/hosts/{id}/rotate-key</code>. The Collector
          log shows <code>auth_failed: invalid key</code>.
        </dd>
        <dt>No outbound reach to the hub</dt>
        <dd>
          The Collector opens an outbound WebSocket — check it with
          <code>curl</code>:
          <pre class="cmd"><span class="prompt">$</span> curl -v https://hub.example/api/hosts -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span></pre>
          A connection refused / timeout means a firewall or proxy is
          in the way. See <em>Behind a corporate proxy</em> below.
        </dd>
        <dt>Host marked OFFLINE in fleet view</dt>
        <dd>
          The hub hasn't seen a sample for &gt;600 s. The Collector
          process may have crashed or gone unreachable —
          <code>journalctl -u vigil-collector -n 200</code> on the host
          is the next stop.
        </dd>
      </dl>
    </section>

    <!-- ─── Hub won't start ─────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-rose"><font-awesome-icon icon="fa-solid fa-server" /></span>
        <div>
          <div class="help-title">The hub won't start</div>
          <div class="help-sub">SYSTEMD STATUS = FAILED</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>admin token required</code></dt>
        <dd>
          <code>VIGIL_PRO_ADMIN_TOKEN</code> isn't set. The hub refuses
          to start without one — it can't authenticate any admin
          calls. Generate one and add it to
          <code>/etc/vigil-pro/hub.env</code>:
          <pre class="cmd"><span class="prompt">$</span> openssl rand -base64 32 | sudo tee -a /etc/vigil-pro/hub.env</pre>
        </dd>
        <dt><code>address already in use</code></dt>
        <dd>
          Another process holds <code>:4600</code> (the hub's default
          port). Either pick a different port via
          <code>VIGIL_PRO_PORT</code> or stop the conflicting service
          (<code>sudo ss -tlnp | grep 4600</code> shows the offender).
        </dd>
        <dt><code>permission denied</code> on the SQLite path</dt>
        <dd>
          The unit runs as <code>vigil-pro</code> by default; the user
          needs write access to <code>VIGIL_PRO_DB</code>. The
          <RouterLink to="/hub/help/deployment#install-the-hub" class="lede-link">Install the hub</RouterLink>
          recipe creates <code>/var/lib/vigil-pro</code> with the
          right ownership.
        </dd>
        <dt><code>database is locked</code> on startup</dt>
        <dd>
          A previous instance left a <code>-wal</code> /
          <code>-shm</code> sidecar pinned. Stop the unit, confirm no
          other <code>vigil-pro</code> process is alive
          (<code>pgrep vigil-pro</code>), then start again. The hub
          uses WAL mode; never delete the sidecars while the process
          is running.
        </dd>
      </dl>
    </section>

    <!-- ─── UI can't talk to anything ───────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-laptop" /></span>
        <div>
          <div class="help-title">UI shows nothing / "Hub mode disabled"</div>
          <div class="help-sub">BUILD CONFIG · CORS · TLS</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt>"Hub mode disabled" banner</dt>
        <dd>
          The UI build had no <code>VITE_HUB_URL</code> set. Rebuild
          with the env var pointing at your hub
          (<code>VITE_HUB_URL=https://hub.example npm run build</code>).
          The
          <RouterLink to="/hub/help/ui" class="lede-link">UI</RouterLink>
          page covers the full build-time env var matrix.
        </dd>
        <dt>CORS errors in DevTools</dt>
        <dd>
          The browser is hitting the hub from an origin the hub
          doesn't allow. Vigil Pro's hub permits requests from any
          origin by default; CORS errors usually mean a reverse proxy
          in front of it stripped the headers. Confirm with
          <code>curl -i -H 'Origin: https://ui.example' https://hub.example/api/hosts</code>
          — you should see <code>access-control-allow-origin: *</code>
          on the response.
        </dd>
        <dt>"Mixed content" / blocked WebSocket</dt>
        <dd>
          The UI is served over HTTPS but
          <code>VITE_WEBSOCKET_URL</code> / <code>VITE_HUB_URL</code>
          point at <code>http://</code> or <code>ws://</code>. Browsers
          refuse to upgrade to insecure transport from a secure page.
          Use <code>wss://</code> and <code>https://</code> end to end.
        </dd>
        <dt>Token-prompt loop</dt>
        <dd>
          The UI keeps re-asking for the admin token. Either the token
          is wrong, or the hub rotated it and the browser still has
          the old value cached in localStorage. Clear site data, paste
          the current token from <code>/etc/vigil-pro/hub.env</code>.
        </dd>
      </dl>
    </section>

    <!-- ─── Notifications never arrive ──────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-bell" /></span>
        <div>
          <div class="help-title">Alerts fire but nothing shows up in Slack</div>
          <div class="help-sub">DISPATCH FAILURE · RULE STUCK BREACHING</div>
        </div>
      </header>

      <p class="example-intro">
        If the rule has been <code>breaching</code> well past its
        <code>for_seconds</code> without ever transitioning to
        <code>firing</code>, the channel itself is broken. The
        <RouterLink to="/hub/help/alerts" class="lede-link">Alert States</RouterLink>
        page explains why — Vigil retries fires on every check rather
        than dropping the breach.
      </p>

      <dl class="ds-list">
        <dt>Check the dispatch log</dt>
        <dd>
          <pre class="cmd"><span class="prompt">$</span> journalctl -u vigil-pro | grep alert.dispatch_failed</pre>
          The log line includes the channel id, HTTP status, and the
          first 200 chars of the response body. That's almost always
          enough to identify the cause (404 = revoked webhook, 410 =
          channel deleted on Slack's side, 403 = workspace policy
          blocked it).
        </dd>
        <dt>Discord webhook returns 400</dt>
        <dd>
          Discord webhooks need <code>/slack</code> appended for
          Slack-format payloads. Without it they reject the
          <code>{ "text": "..." }</code> body. Edit the channel and
          add the suffix:
          <code>https://discord.com/api/webhooks/…/slack</code>.
        </dd>
        <dt>Generic webhook receiver returns 5xx</dt>
        <dd>
          Vigil treats anything ≥ 400 as a dispatch failure and stays
          in <code>breaching</code>. Test the receiver directly with
          the payload shape from the
          <RouterLink to="/hub/help/channels" class="lede-link">Channels</RouterLink>
          page — if your endpoint requires auth, that has to be
          encoded in the URL since Vigil sends no
          <code>Authorization</code> header.
        </dd>
        <dt>Resolved notifications work, fired don't</dt>
        <dd>
          Vigil moves <code>firing → ok</code> even if the resolved
          dispatch fails (otherwise a deleted webhook would wedge an
          alert forever). So a one-sided "I see resolves but never
          fires" pattern usually means the receiver started rejecting
          requests after a recent change — check it with curl.
        </dd>
      </dl>
    </section>

    <!-- ─── Behind a proxy ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-network-wired" /></span>
        <div>
          <div class="help-title">Behind a corporate proxy</div>
          <div class="help-sub">HTTPS_PROXY · CA BUNDLE</div>
        </div>
      </header>

      <p class="example-intro">
        The Collector picks up <code>HTTPS_PROXY</code> /
        <code>HTTP_PROXY</code> / <code>NO_PROXY</code> from the
        environment for both the hub WebSocket and any outbound HTTP
        calls. In a systemd unit, set them in the env file:
      </p>

      <pre class="cmd"><span class="comment"># /etc/vigil-collector/collector.env</span>
HTTPS_PROXY=http://proxy.corp:3128
NO_PROXY=localhost,127.0.0.1,.internal</pre>

      <p class="example-intro mb-3">
        If the proxy MITMs TLS with a corporate root CA, point
        <code>SSL_CERT_FILE</code> at the bundle the host already
        trusts (<code>/etc/ssl/certs/ca-certificates.crt</code> on
        Debian/Ubuntu). The Collector uses the system trust store by
        default, so this is rarely needed if the CA is installed
        properly at the OS level.
      </p>
    </section>

    <!-- ─── The "what changed?" checklist ───────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-list-check" /></span>
        <div>
          <div class="help-title">Quick checklist</div>
          <div class="help-sub">WHEN NOTHING ABOVE FITS</div>
        </div>
      </header>

      <p class="example-intro">
        End-to-end sanity check. Each step proves a single link in the
        chain is working — when one fails, you've found the layer.
      </p>

      <ol class="step-list">
        <li>
          <div class="step-body">
            <div class="step-title">Hub is up</div>
            <pre class="cmd"><span class="prompt">$</span> curl -sf https://hub.example/api/hosts -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> | jq length</pre>
            <p>200 with a JSON array means the admin API is reachable and the token works.</p>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Host is registered</div>
            <pre class="cmd"><span class="prompt">$</span> curl -sf https://hub.example/api/hosts -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> | jq <span class="string">'.[] | select(.name=="web-01.dc1")'</span></pre>
            <p>Empty result means the name on the Collector won't match. Re-register or correct <code>--hub-name</code>.</p>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Collector is connecting</div>
            <pre class="cmd"><span class="prompt">$</span> journalctl -u vigil-collector -n 50 --no-pager</pre>
            <p>Look for <code>hub.connected</code>. If you see <code>auth_failed</code>, the name or key is wrong; if you see network errors, the host can't reach the hub.</p>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">Samples are landing</div>
            <pre class="cmd"><span class="prompt">$</span> curl -sf https://hub.example/api/hosts/7/metrics?metric=cpu.usage&amp;window=5m \
       -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> | jq <span class="string">'.points | length'</span></pre>
            <p>A non-zero count means the hub is ingesting. Zero with a connected Collector means the WebSocket is open but frames are being rejected — bump <code>VIGIL_PRO_LOG_LEVEL=debug</code> on the hub to see why.</p>
          </div>
        </li>
        <li>
          <div class="step-body">
            <div class="step-title">A rule actually evaluates</div>
            <pre class="cmd"><span class="prompt">$</span> curl -sf https://hub.example/api/alert_state -H <span class="string">"Authorization: Bearer $HUB_ADMIN_TOKEN"</span> | jq <span class="string">'.[] | {rule, host, state, last_value}'</span></pre>
            <p>If the rule isn't listed for the host you expect, scope is wrong (tag missing, host name mismatched). If it's listed but stuck on <code>breaching</code>, see <em>Alerts fire but nothing shows up in Slack</em> above.</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- ─── Where to ask ────────────────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— STILL STUCK?</div>
        <p>
          Capture the relevant log excerpt
          (<code>journalctl -u vigil-pro -n 200</code> or
          <code>journalctl -u vigil-collector -n 200</code>) along
          with the hub version (<code>vigil-pro --version</code>) and
          file an issue. The
          <RouterLink to="/hub/help/deployment">Deployment</RouterLink>
          page covers the moving parts; the
          <RouterLink to="/hub/help/alerts">Alert States</RouterLink>
          page explains the firing/resolved state machine in detail.
        </p>
      </div>
    </section>
  </article>
</template>
