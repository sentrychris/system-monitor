<script setup lang="ts">
import { useDocumentTitle } from "@/composables/useDocumentTitle";
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";

useDocumentTitle("Docs · Metric Catalog");
</script>

<template>
  <article class="help-page">
    <PageHeader decor-title="Vigil Pro Hub · Docs" title="Metric Catalog" />

    <p class="lede">
      Every Collector ships <strong>metrics</strong>
      to the hub at 1 Hz. This page is the canonical reference for what
      gets emitted: each metric's name, units, source, and the
      caveats worth knowing before writing an
      <RouterLink to="/hub/help/rules" class="lede-link">alert rule</RouterLink>
      against it.
    </p>

    <!-- ─── Wire shape ──────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-table-list" /></span>
        <div>
          <div class="help-title">Anatomy of a sample</div>
          <div class="help-sub">FOUR FIELDS · KEYED ON (HOST, METRIC, DIM, TS)</div>
        </div>
      </header>

      <p class="example-intro">
        Each Collector tick produces one <code>samples</code> frame
        carrying a flat <code>metrics</code> map. Dimensioned metrics
        encode their dim after a pipe (<code>disk.percent|/var</code>);
        the hub splits on that pipe at ingest and stores
        <code>metric</code> and <code>dim</code> as separate columns.
      </p>

      <div class="example">
        <div class="example-eyebrow">— ON THE WIRE</div>
        <pre class="timeline"><span class="comment">{</span>
<span class="comment">  </span><span class="metric">"v"</span><span class="comment">: 1, </span><span class="metric">"t"</span><span class="comment">: </span><span class="state state-ok">"samples"</span><span class="comment">, </span><span class="metric">"ts"</span><span class="comment">: 1735689600,</span>
<span class="comment">  </span><span class="metric">"metrics"</span><span class="comment">: {</span>
<span class="comment">    </span><span class="metric">"cpu.usage"</span><span class="comment">: 42.7,</span>
<span class="comment">    </span><span class="metric">"mem.percent"</span><span class="comment">: 68.1,</span>
<span class="comment">    </span><span class="metric">"disk.percent|/"</span><span class="comment">: 71.4,</span>
<span class="comment">    </span><span class="metric">"net.rx_bytes_per_s"</span><span class="comment">: 184320</span>
<span class="comment">  }</span>
<span class="comment">}</span></pre>
      </div>

      <dl class="ds-list">
        <dt><code>v</code></dt>
        <dd>Protocol version. Currently <code>1</code>. Bumped on incompatible wire changes.</dd>
        <dt><code>t</code></dt>
        <dd>Frame type. <code>"samples"</code> here; <code>"hello"</code>, <code>"welcome"</code>, and <code>"processes"</code> are the others.</dd>
        <dt><code>ts</code></dt>
        <dd>Unix epoch seconds at the Collector when the snapshot was taken. The hub trusts this — clock skew shows up as gaps or overlap on charts.</dd>
        <dt><code>metrics</code></dt>
        <dd>Flat <code>{ "metric[|dim]": value }</code> map. Numeric values only — strings, nulls, and arrays are rejected at ingest.</dd>
      </dl>
    </section>

    <!-- ─── CPU ────────────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-cyan"><font-awesome-icon icon="fa-solid fa-microchip" /></span>
        <div>
          <div class="help-title">CPU</div>
          <div class="help-sub">UTILIZATION · LOAD · FREQUENCY · TEMPERATURE</div>
        </div>
      </header>

      <ul class="metric-list">
        <li class="metric-row is-percent">
          <div class="metric-head">
            <span class="metric-names"><code>cpu.usage</code></span>
            <span class="metric-tags"><span class="unit-tag is-percent">%</span></span>
          </div>
          <p class="metric-desc">
            Whole-system CPU utilization averaged across all logical
            cores since the last sample, 0–100. From
            <code>psutil.cpu_percent(interval=None)</code>; the sampler
            primes this once at startup so the first tick still reports
            a meaningful value. The most common alert target.
          </p>
        </li>

        <li class="metric-row is-mhz">
          <div class="metric-head">
            <span class="metric-names"><code>cpu.freq_mhz</code></span>
            <span class="metric-tags"><span class="unit-tag is-mhz">MHz</span></span>
          </div>
          <p class="metric-desc">
            Current CPU clock frequency. Only emitted when the platform
            reports it — virtualized hosts and many ARM SoCs return
            <code>0</code> from psutil and the metric is omitted
            entirely. Useful for spotting thermal throttling alongside
            <code>cpu.temp_c</code>.
          </p>
        </li>

        <li class="metric-row is-load">
          <div class="metric-head">
            <span class="metric-names">
              <code>cpu.load_1m</code>
              <code>cpu.load_5m</code>
              <code>cpu.load_15m</code>
            </span>
            <span class="metric-tags"><span class="unit-tag is-load">loadavg</span></span>
          </div>
          <p class="metric-desc">
            Unix load averages over the last 1, 5, and 15 minutes.
            Linux and macOS only — missing on Windows and on container
            hosts without a load source. A load of <code>n</code> means
            <em>n</em> runnable processes; compare against
            <code>cpu_cores</code> from the host's hello frame, not a
            fixed threshold.
          </p>
        </li>

        <li class="metric-row is-temp">
          <div class="metric-head">
            <span class="metric-names"><code>cpu.temp_c</code></span>
            <span class="metric-tags"><span class="unit-tag is-temp">°C</span></span>
          </div>
          <p class="metric-desc">
            CPU package temperature in Celsius. Only emitted when the
            kernel exposes a sensor and the reading is non-zero — most
            VMs, most containers, and many cloud bare-metal images
            return nothing here. Alert with
            <code>scope: tag:bare-metal</code> to avoid false negatives.
          </p>
        </li>
      </ul>
    </section>

    <!-- ─── Memory ─────────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-emerald"><font-awesome-icon icon="fa-solid fa-memory" /></span>
        <div>
          <div class="help-title">Memory</div>
          <div class="help-sub">VIRTUAL_MEMORY · ROUNDED TO 2-DECIMAL GIB ON THE WIRE</div>
        </div>
      </header>

      <p class="example-intro">
        All <code>*_bytes</code> memory and disk values are rounded by
        the Collector to 2-decimal GiB before transmission and converted
        back to bytes — precision is bounded at roughly 10 MiB. Fine
        for alerting; not an accounting tool.
      </p>

      <ul class="metric-list">
        <li class="metric-row is-percent">
          <div class="metric-head">
            <span class="metric-names"><code>mem.percent</code></span>
            <span class="metric-tags"><span class="unit-tag is-percent">%</span></span>
          </div>
          <p class="metric-desc">
            Overall memory utilization, 0–100. Matches the percent field
            of <code>psutil.virtual_memory()</code>. The recommended
            alert target — works on any host without per-host tuning.
          </p>
        </li>

        <li class="metric-row is-bytes">
          <div class="metric-head">
            <span class="metric-names"><code>mem.used_bytes</code></span>
            <span class="metric-tags"><span class="unit-tag is-bytes">bytes</span></span>
          </div>
          <p class="metric-desc">
            Used memory in bytes. Use when hosts have very different
            RAM sizes and a single percent threshold doesn't translate
            (a database box at 80% of 256 GiB is fine; the same percent
            on a 2 GiB worker is not).
          </p>
        </li>

        <li class="metric-row is-bytes">
          <div class="metric-head">
            <span class="metric-names"><code>mem.total_bytes</code></span>
            <span class="metric-tags">
              <span class="unit-tag is-bytes">bytes</span>
              <span class="unit-tag is-static">static</span>
            </span>
          </div>
          <p class="metric-desc">
            Total physical RAM. Effectively static — emitted every tick
            for completeness, but you'd never alert on it. The host
            page uses it as the denominator for the memory bar.
          </p>
        </li>

        <li class="metric-row is-bytes">
          <div class="metric-head">
            <span class="metric-names"><code>mem.free_bytes</code></span>
            <span class="metric-tags"><span class="unit-tag is-bytes">bytes</span></span>
          </div>
          <p class="metric-desc">
            Free memory as psutil reports it. Note: on Linux this
            excludes buffers and cache — for "available memory"
            semantics, alert on <code>mem.percent</code> instead.
          </p>
        </li>
      </ul>
    </section>

    <!-- ─── Disk I/O ───────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-amber"><font-awesome-icon icon="fa-solid fa-wave-square" /></span>
        <div>
          <div class="help-title">Disk I/O</div>
          <div class="help-sub">RATE METRICS · AGGREGATE ACROSS BLOCK DEVICES</div>
        </div>
      </header>

      <p class="example-intro">
        These are <em>rates</em> the Collector computes itself from
        <code>psutil.disk_io_counters()</code> deltas — the value is
        already <code>per-second</code>, no conversion needed. They sum
        across every block device on the host; per-device dimensioning
        is on the roadmap and will appear here as <code>dim = device
        name</code> when it lands.
      </p>

      <ul class="metric-list">
        <li class="metric-row is-rate">
          <div class="metric-head">
            <span class="metric-names"><code>disk.io.read_bytes_per_s</code></span>
            <span class="metric-tags"><span class="unit-tag is-rate">bytes/s</span></span>
          </div>
          <p class="metric-desc">Aggregate read throughput across all block devices.</p>
        </li>

        <li class="metric-row is-rate">
          <div class="metric-head">
            <span class="metric-names"><code>disk.io.write_bytes_per_s</code></span>
            <span class="metric-tags"><span class="unit-tag is-rate">bytes/s</span></span>
          </div>
          <p class="metric-desc">Aggregate write throughput across all block devices.</p>
        </li>

        <li class="metric-row is-count">
          <div class="metric-head">
            <span class="metric-names"><code>disk.io.read_iops</code></span>
            <span class="metric-tags"><span class="unit-tag is-count">ops/s</span></span>
          </div>
          <p class="metric-desc">
            Aggregate read operations per second. Useful for detecting
            random-IO storms that don't show up in throughput.
          </p>
        </li>

        <li class="metric-row is-count">
          <div class="metric-head">
            <span class="metric-names"><code>disk.io.write_iops</code></span>
            <span class="metric-tags"><span class="unit-tag is-count">ops/s</span></span>
          </div>
          <p class="metric-desc">Aggregate write operations per second.</p>
        </li>
      </ul>
    </section>

    <!-- ─── Disk capacity ──────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-purple"><font-awesome-icon icon="fa-solid fa-hard-drive" /></span>
        <div>
          <div class="help-title">Disk capacity</div>
          <div class="help-sub">PER-MOUNT · DIM = MOUNT PATH</div>
        </div>
      </header>

      <p class="example-intro">
        Capacity metrics are dimensioned: one value per mount point,
        with <code>dim</code> set to the mount path
        (<code>/</code>, <code>/var</code>, <code>/data</code>, …). On
        the wire the dim follows a pipe — <code>disk.percent|/var</code>
        — and the hub splits on ingest. Alert rules supply the
        <code>dim</code> separately from the <code>metric</code>; the UI
        does this for you when you pick a dimensioned metric in the
        <RouterLink to="/hub/rules" class="lede-link">rules form</RouterLink>.
      </p>

      <ul class="metric-list">
        <li class="metric-row is-percent">
          <div class="metric-head">
            <span class="metric-names"><code>disk.percent</code></span>
            <span class="metric-tags">
              <span class="unit-tag is-percent">%</span>
              <span class="dim-tag">+ dim</span>
            </span>
          </div>
          <p class="metric-desc">
            Mount fullness, 0–100. The recommended target — 85–90
            catches most operational concerns without firing on every
            <code>/tmp</code> burst.
          </p>
        </li>

        <li class="metric-row is-bytes">
          <div class="metric-head">
            <span class="metric-names"><code>disk.used_bytes</code></span>
            <span class="metric-tags">
              <span class="unit-tag is-bytes">bytes</span>
              <span class="dim-tag">+ dim</span>
            </span>
          </div>
          <p class="metric-desc">
            Used capacity for the mount. Use when you want to alert on
            absolute headroom (e.g. less than 10 GiB free on a small
            root).
          </p>
        </li>

        <li class="metric-row is-bytes">
          <div class="metric-head">
            <span class="metric-names"><code>disk.total_bytes</code></span>
            <span class="metric-tags">
              <span class="unit-tag is-bytes">bytes</span>
              <span class="unit-tag is-static">static</span>
              <span class="dim-tag">+ dim</span>
            </span>
          </div>
          <p class="metric-desc">
            Mount capacity. Static (changes only on resize); emitted
            for completeness so the UI can compute headroom without a
            separate query.
          </p>
        </li>
      </ul>

      <p class="example-intro" style="margin-top: 1rem;">
        <strong>Skipped mounts.</strong> The Collector filters three
        prefixes that bloat the namespace without telling you anything
        actionable: <code>/snap/</code> (Ubuntu snap loops),
        <code>/var/lib/docker/</code>, and <code>/run/docker/</code>.
        Anything underneath those won't appear in the catalog and
        can't be alerted on.
      </p>
    </section>

    <!-- ─── Network ────────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-tower-broadcast" /></span>
        <div>
          <div class="help-title">Network</div>
          <div class="help-sub">RATE METRICS · AGGREGATE ACROSS INTERFACES</div>
        </div>
      </header>

      <p class="example-intro">
        Network throughput is computed by the Collector from
        <code>psutil.net_io_counters()</code> deltas across all
        non-loopback interfaces. Per-interface dimensioning will land
        alongside the corresponding Collector change — the existing
        empty-string <code>dim</code> slot becomes the interface name
        with no breaking change to rules already targeting the aggregate.
      </p>

      <ul class="metric-list">
        <li class="metric-row is-rate">
          <div class="metric-head">
            <span class="metric-names"><code>net.rx_bytes_per_s</code></span>
            <span class="metric-tags"><span class="unit-tag is-rate">bytes/s</span></span>
          </div>
          <p class="metric-desc">Receive throughput summed over every non-loopback interface.</p>
        </li>

        <li class="metric-row is-rate">
          <div class="metric-head">
            <span class="metric-names"><code>net.tx_bytes_per_s</code></span>
            <span class="metric-tags"><span class="unit-tag is-rate">bytes/s</span></span>
          </div>
          <p class="metric-desc">Transmit throughput summed over every non-loopback interface.</p>
        </li>
      </ul>
    </section>

    <!-- ─── Cadence & freshness ─────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-rose"><font-awesome-icon icon="fa-solid fa-stopwatch" /></span>
        <div>
          <div class="help-title">Sampling cadence and freshness</div>
          <div class="help-sub">1 HZ DEFAULT · 90 S ALERT FRESHNESS WINDOW</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>interval</code></dt>
        <dd>
          Cadence is negotiated at handshake — the hub returns an
          <code>interval</code> in its <code>welcome</code> frame and
          the Collector pushes at that rate. Default is 1.0 s. The hub
          can lower it for noisy fleets; it's never raised below the
          Collector's local sampler tick.
        </dd>
        <dt>Alert freshness</dt>
        <dd>
          The alert engine ignores samples older than
          <strong>90&nbsp;s</strong>. A host that goes silent stops
          contributing to evaluation rather than wedging an old breach
          firing forever — see the
          <RouterLink to="/hub/help/deployment" class="lede-link">Hub Deployment</RouterLink>
          page for the corresponding host status windows.
        </dd>
        <dt>Retention</dt>
        <dd>
          Raw 1 Hz samples are kept 6 hours. The rollup worker rolls
          them into <code>samples_1m</code>, <code>samples_5m</code>,
          and <code>samples_1h</code> tiers — the host page picks the
          tier appropriate to the chart window automatically.
        </dd>
      </dl>
    </section>

    <!-- ─── Pointer to alert rules ──────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— USING METRICS IN RULES</div>
        <p>
          Every metric in this catalog is a valid alert target. The
          <RouterLink to="/hub/help/rules" class="lede-link">Alert Rules</RouterLink>
          page walks through the seven-field rule shape, scope syntax,
          and the <code>for_seconds</code> debounce. The
          <RouterLink to="/hub/rules" class="lede-link">Alert rules</RouterLink>
          view is the canonical UI for authoring them.
        </p>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* ── Metric list ───────────────────────────────────────────────────────
   Per-metric row with a category-tinted left accent, name + unit chips
   on a head row, and the description below. Lighter visual weight than
   the panel-card-per-metric option since each row already lives inside
   the section's own panel-card. */
.metric-list {
  list-style: none;
  margin: 0;
  padding: 0.45rem 0.4rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.metric-row {
  position: relative;
  padding: 0.7rem 0.95rem 0.75rem 1.1rem;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.10);
  /* Left accent — colored per category via the .is-* modifier. The
     border-left is the visual stripe; padding-left above leaves room. */
  border-left: 3px solid rgba(148, 163, 184, 0.38);
}
body[data-theme="dark"] .metric-row {
  background: rgba(148, 163, 184, 0.04);
  border-color: rgba(148, 163, 184, 0.10);
  border-left-color: rgba(148, 163, 184, 0.30);
}

.metric-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}
.metric-names {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  min-width: 0;
}
.metric-names code {
  /* Heftier than inline <code> in the body — this is the metric's
     identity, not just a snippet. Keep the chip recipe but bump the
     weight and contrast a touch. */
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0.005em;
  padding: 0.12rem 0.5rem;
  border-radius: 5px;
  background: rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.10);
  color: #0f172a;
}
body[data-theme="dark"] .metric-names code {
  background: rgba(241, 245, 249, 0.06);
  border-color: rgba(241, 245, 249, 0.12);
  color: #f1f5f9;
}

.metric-tags {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-left: auto;
}

.metric-desc {
  margin: 0;
  font-family: "Lato", "Montserrat", system-ui, sans-serif;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #475569;
}
body[data-theme="dark"] .metric-desc { color: #cbd5e1; }
.metric-desc code {
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.82em;
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
  background: rgba(96, 165, 250, 0.08);
  border: 1px solid rgba(96, 165, 250, 0.18);
  color: #2563eb;
}
body[data-theme="dark"] .metric-desc code { color: #67e8f9; }

/* ── Category accent — left stripe per metric family ───────────────── */
.metric-row.is-percent  { border-left-color: rgba(52, 211, 153, 0.55); }
.metric-row.is-bytes    { border-left-color: rgba(96, 165, 250, 0.55); }
.metric-row.is-rate     { border-left-color: rgba(251, 191, 36, 0.6); }
.metric-row.is-count    { border-left-color: rgba(167, 139, 250, 0.55); }
.metric-row.is-temp     { border-left-color: rgba(244, 63, 94, 0.55); }
.metric-row.is-mhz,
.metric-row.is-load     { border-left-color: rgba(34, 211, 238, 0.55); }

/* ── Unit chip ─────────────────────────────────────────────────────────
   Slate-by-default, color-tinted per category modifier. Keeps the chip
   visually tied to the metric's family at a glance. */
.unit-tag {
  display: inline-block;
  padding: 0.05rem 0.45rem;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.32);
  color: #475569;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  white-space: nowrap;
  vertical-align: middle;
}
body[data-theme="dark"] .unit-tag {
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.20);
  background: rgba(148, 163, 184, 0.10);
}

.unit-tag.is-percent {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.34);
  color: #047857;
}
body[data-theme="dark"] .unit-tag.is-percent { color: #34d399; }

.unit-tag.is-bytes {
  background: rgba(96, 165, 250, 0.12);
  border-color: rgba(96, 165, 250, 0.34);
  color: #1d4ed8;
}
body[data-theme="dark"] .unit-tag.is-bytes { color: #93c5fd; }

.unit-tag.is-rate {
  background: rgba(251, 191, 36, 0.14);
  border-color: rgba(251, 191, 36, 0.38);
  color: #b45309;
}
body[data-theme="dark"] .unit-tag.is-rate { color: #fbbf24; }

.unit-tag.is-count {
  background: rgba(167, 139, 250, 0.14);
  border-color: rgba(167, 139, 250, 0.34);
  color: #6d28d9;
}
body[data-theme="dark"] .unit-tag.is-count { color: #a78bfa; }

.unit-tag.is-temp {
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.34);
  color: #b91c1c;
}
body[data-theme="dark"] .unit-tag.is-temp { color: #fda4af; }

.unit-tag.is-mhz,
.unit-tag.is-load {
  background: rgba(34, 211, 238, 0.12);
  border-color: rgba(34, 211, 238, 0.34);
  color: #0e7490;
}
body[data-theme="dark"] .unit-tag.is-mhz,
body[data-theme="dark"] .unit-tag.is-load { color: #67e8f9; }

/* "static" qualifier — visually quieter so it reads as secondary to the
   primary unit chip beside it. */
.unit-tag.is-static {
  background: rgba(148, 163, 184, 0.10);
  border-color: rgba(148, 163, 184, 0.28);
  color: #64748b;
  letter-spacing: 0.16em;
}
body[data-theme="dark"] .unit-tag.is-static { color: #94a3b8; }

/* ── Dim chip — amber, matches the Alert Rules page treatment ──────── */
.dim-tag {
  display: inline-block;
  padding: 0.05rem 0.45rem;
  border-radius: 4px;
  background: rgba(251, 191, 36, 0.14);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #b45309;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  vertical-align: middle;
}
body[data-theme="dark"] .dim-tag { color: #fbbf24; }

@media (max-width: 720px) {
  /* On narrow screens the chips wrap below the metric name instead of
     squeezing — keeps the head row legible without truncation. */
  .metric-tags { margin-left: 0; }
}
</style>
