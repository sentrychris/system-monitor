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
      Every host sends a snapshot of its <strong>metrics</strong> to
      Vigil once a second. This page is the full reference: every
      metric's name, unit, and what's worth knowing before writing an
      <RouterLink to="/hub/help/rules" class="lede-link">alert rule</RouterLink>
      against it.
    </p>

    <!-- ─── Wire shape ──────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-table-list" /></span>
        <div>
          <div class="help-title">Anatomy of a sample</div>
          <div class="help-sub">WHAT EACH HOST SENDS EVERY SECOND</div>
        </div>
      </header>

      <p class="example-intro">
        Every second, each host sends one <code>samples</code> frame
        with a flat map of metric values. Some metrics need a label
        (which mount, which interface) — those use a pipe
        (<code>disk.percent|/var</code>), and Vigil stores the metric
        and label separately on its end.
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
        <dd>Protocol version. Currently <code>1</code>. Bumped when the wire format changes incompatibly.</dd>
        <dt><code>t</code></dt>
        <dd>Frame type. <code>"samples"</code> here; <code>"hello"</code>, <code>"welcome"</code>, and <code>"processes"</code> are the others.</dd>
        <dt><code>ts</code></dt>
        <dd>Unix timestamp from the host when the snapshot was taken. Vigil trusts this — clock skew shows up as gaps or overlap on charts.</dd>
        <dt><code>metrics</code></dt>
        <dd>Flat map of <code>{ "metric[|label]": value }</code>. Numbers only — strings, nulls, and arrays are rejected.</dd>
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
            CPU usage across all logical cores since the last sample,
            0–100. The most common alert target.
          </p>
        </li>

        <li class="metric-row is-mhz">
          <div class="metric-head">
            <span class="metric-names"><code>cpu.freq_mhz</code></span>
            <span class="metric-tags"><span class="unit-tag is-mhz">MHz</span></span>
          </div>
          <p class="metric-desc">
            Current CPU clock speed. Only emitted when the OS reports
            it — virtual hosts and many ARM chips don't, and the
            metric is dropped entirely. Useful for spotting thermal
            throttling alongside <code>cpu.temp_c</code>.
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
            Linux and macOS only — Windows hosts and most containers
            won't report these. A load of <code>n</code> roughly means
            <em>n</em> processes wanting CPU; compare against the
            host's core count, not a fixed threshold.
          </p>
        </li>

        <li class="metric-row is-temp">
          <div class="metric-head">
            <span class="metric-names"><code>cpu.temp_c</code></span>
            <span class="metric-tags"><span class="unit-tag is-temp">°C</span></span>
          </div>
          <p class="metric-desc">
            CPU package temperature in °C. Only emitted when the OS
            exposes a sensor with a real reading — most VMs,
            containers, and cloud images don't. Tag your bare-metal
            hosts and use <code>scope: tag:bare-metal</code> to avoid
            false negatives.
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
          <div class="help-sub">TOTAL · USED · FREE · PERCENT</div>
        </div>
      </header>

      <p class="example-intro">
        All <code>*_bytes</code> memory and disk values are rounded to
        2-decimal GiB before being sent — precision is roughly 10 MiB.
        Fine for alerts, not for billing.
      </p>

      <ul class="metric-list">
        <li class="metric-row is-percent">
          <div class="metric-head">
            <span class="metric-names"><code>mem.percent</code></span>
            <span class="metric-tags"><span class="unit-tag is-percent">%</span></span>
          </div>
          <p class="metric-desc">
            Overall memory usage, 0–100. The recommended alert target
            — works on any host without tuning.
          </p>
        </li>

        <li class="metric-row is-bytes">
          <div class="metric-head">
            <span class="metric-names"><code>mem.used_bytes</code></span>
            <span class="metric-tags"><span class="unit-tag is-bytes">bytes</span></span>
          </div>
          <p class="metric-desc">
            Used memory, in bytes. Use when your hosts have very
            different RAM sizes and a single percent threshold doesn't
            fit (80% of 256 GiB is fine; 80% of 2 GiB is not).
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
            Total physical RAM. Doesn't change — sent every tick so
            the UI can show usage bars. You'd never alert on it.
          </p>
        </li>

        <li class="metric-row is-bytes">
          <div class="metric-head">
            <span class="metric-names"><code>mem.free_bytes</code></span>
            <span class="metric-tags"><span class="unit-tag is-bytes">bytes</span></span>
          </div>
          <p class="metric-desc">
            Free memory. On Linux this excludes buffers and cache —
            for true "available memory" semantics, alert on
            <code>mem.percent</code> instead.
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
          <div class="help-sub">RATES · TOTAL ACROSS EVERY DISK</div>
        </div>
      </header>

      <p class="example-intro">
        Vigil computes these rates from the OS counters between ticks,
        so values are already per-second. They sum across every disk
        on the host — per-disk breakdown is on the roadmap and will
        land as <code>dim = device name</code>.
      </p>

      <ul class="metric-list">
        <li class="metric-row is-rate">
          <div class="metric-head">
            <span class="metric-names"><code>disk.io.read_bytes_per_s</code></span>
            <span class="metric-tags"><span class="unit-tag is-rate">bytes/s</span></span>
          </div>
          <p class="metric-desc">Total read throughput across every disk.</p>
        </li>

        <li class="metric-row is-rate">
          <div class="metric-head">
            <span class="metric-names"><code>disk.io.write_bytes_per_s</code></span>
            <span class="metric-tags"><span class="unit-tag is-rate">bytes/s</span></span>
          </div>
          <p class="metric-desc">Total write throughput across every disk.</p>
        </li>

        <li class="metric-row is-count">
          <div class="metric-head">
            <span class="metric-names"><code>disk.io.read_iops</code></span>
            <span class="metric-tags"><span class="unit-tag is-count">ops/s</span></span>
          </div>
          <p class="metric-desc">
            Total read operations per second. Catches random-IO spikes
            that don't show up in raw throughput.
          </p>
        </li>

        <li class="metric-row is-count">
          <div class="metric-head">
            <span class="metric-names"><code>disk.io.write_iops</code></span>
            <span class="metric-tags"><span class="unit-tag is-count">ops/s</span></span>
          </div>
          <p class="metric-desc">Total write operations per second.</p>
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
        These metrics are per-mount: one value for each mount point,
        with <code>dim</code> set to the mount path (<code>/</code>,
        <code>/var</code>, <code>/data</code>). On the wire the dim is
        appended after a pipe — <code>disk.percent|/var</code> — and
        Vigil splits them. The
        <RouterLink to="/hub/rules" class="lede-link">rules form</RouterLink>
        handles this for you when you pick a per-mount metric.
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
            How full the mount is, 0–100. The recommended target —
            85–90 catches most real concerns without firing on every
            <code>/tmp</code> spike.
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
            Used space on the mount. Use when you want to alert on
            absolute free space (e.g. less than 10 GiB left on a small
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
            Mount size. Doesn't change unless you resize — sent so the
            UI can show free space without an extra request.
          </p>
        </li>
      </ul>

      <p class="example-intro" style="margin-top: 1rem;">
        <strong>Skipped mounts.</strong> Vigil ignores three prefixes
        that produce a lot of noise without telling you anything
        useful: <code>/snap/</code> (Ubuntu snap loops),
        <code>/var/lib/docker/</code>, and <code>/run/docker/</code>.
        Mounts under these aren't reported and can't be alerted on.
      </p>
    </section>

    <!-- ─── Network ────────────────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-blue"><font-awesome-icon icon="fa-solid fa-tower-broadcast" /></span>
        <div>
          <div class="help-title">Network</div>
          <div class="help-sub">RATES · TOTAL ACROSS EVERY INTERFACE</div>
        </div>
      </header>

      <p class="example-intro">
        Network throughput is the total across every non-loopback
        interface, computed from OS counters between ticks. Per-interface
        breakdown is on the roadmap — when it lands, existing rules
        will keep working against the total.
      </p>

      <ul class="metric-list">
        <li class="metric-row is-rate">
          <div class="metric-head">
            <span class="metric-names"><code>net.rx_bytes_per_s</code></span>
            <span class="metric-tags"><span class="unit-tag is-rate">bytes/s</span></span>
          </div>
          <p class="metric-desc">Total inbound traffic across every non-loopback interface.</p>
        </li>

        <li class="metric-row is-rate">
          <div class="metric-head">
            <span class="metric-names"><code>net.tx_bytes_per_s</code></span>
            <span class="metric-tags"><span class="unit-tag is-rate">bytes/s</span></span>
          </div>
          <p class="metric-desc">Total outbound traffic across every non-loopback interface.</p>
        </li>
      </ul>
    </section>

    <!-- ─── Cadence & freshness ─────────────────────────────────── -->
    <section class="help-section">
      <header class="help-header">
        <span class="icon-tile tone-rose"><font-awesome-icon icon="fa-solid fa-stopwatch" /></span>
        <div>
          <div class="help-title">Sampling cadence and freshness</div>
          <div class="help-sub">1 HZ DEFAULT · 90 S BEFORE A SAMPLE IS TOO OLD TO ALERT ON</div>
        </div>
      </header>

      <dl class="ds-list">
        <dt><code>interval</code></dt>
        <dd>
          How often hosts push. Each Collector connects, the hub
          replies with an <code>interval</code>, and the Collector
          pushes at that rate. Defaults to 1 second. The hub can lower
          it for noisy fleets but won't go below the Collector's own
          sampling rate.
        </dd>
        <dt>Alert freshness</dt>
        <dd>
          Vigil's alert engine ignores samples older than
          <strong>90&nbsp;s</strong>. A silent host stops being
          evaluated, so a stale value can't keep an old alert firing.
          The <RouterLink to="/hub/help/deployment" class="lede-link">Hub Deployment</RouterLink>
          page has the matching host status windows.
        </dd>
        <dt>Retention</dt>
        <dd>
          Raw 1 Hz samples are kept for 6 hours, then rolled up into
          1-minute, 5-minute, and 1-hour averages for longer windows.
          The host page picks the right tier for the chart window
          automatically.
        </dd>
      </dl>
    </section>

    <!-- ─── Pointer to alert rules ──────────────────────────────── -->
    <section class="help-section">
      <div class="help-cta">
        <div class="help-cta-eyebrow">— USING METRICS IN RULES</div>
        <p>
          Every metric here is a valid alert target. The
          <RouterLink to="/hub/help/rules" class="lede-link">Alert Rules</RouterLink>
          page walks through how to write a rule; the
          <RouterLink to="/hub/rules" class="lede-link">Alert rules</RouterLink>
          view is where you'll author them.
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
