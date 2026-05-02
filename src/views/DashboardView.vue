<script setup lang="ts">
import { onBeforeMount } from "vue";
import { config } from "@/config";
import { useLoadingStore } from "@/stores/loading";
import { useSystemStore } from "@/stores/system";
import SectionHeader from "@/components/SectionHeader.vue";
import StatCard from "@/components/stats/StatCard.vue";
import PlatformDetail from "@/components/stats/PlatformDetail.vue";
import CpuDetail from "@/components/stats/CpuDetail.vue";
import UsageDetail from "@/components/stats/UsageDetail.vue";
import GaugeChart from "@/components/charts/GaugeChart.vue";
import RealtimeLineChart from "@/components/charts/RealtimeLineChart.vue";
import BarChart from "@/components/charts/BarChart.vue";
import PieChart from "@/components/charts/PieChart.vue";
import ServiceStatus from "@/components/ServiceStatus.vue";

const loader = useLoadingStore();
const system = useSystemStore();

onBeforeMount(() => {
  const connection = system.connectionType ?? config.api.connection;
  system.connect({ websocket: connection === "websocket", refresh: false });
});
</script>

<template>
  <Transition name="fade">
    <div v-if="loader.loaded" class="container py-0 py-md-2 dashboard-root">
      <!-- Top stat cards -->
      <section id="statistics" class="page-section mt-0">
        <div class="row mt-0 mt-md-3 g-3">
          <div class="col-sm-12 col-md-6 col-lg-3 d-flex align-items-stretch">
            <StatCard title="Platform" icon="fa-solid fa-server" tone="blue">
              <template #detail>
                <PlatformDetail
                  :detail="system.data.platform"
                  :uptime="system.realtime.uptime"
                />
              </template>
            </StatCard>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 d-flex align-items-stretch">
            <StatCard title="CPU" icon="fa-solid fa-microchip" tone="purple">
              <template #detail>
                <CpuDetail
                  :detail="system.live ? system.realtime.cpu : system.data.cpu"
                />
              </template>
            </StatCard>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 d-flex align-items-stretch">
            <StatCard title="Memory" icon="fa-solid fa-memory" tone="amber">
              <template #detail>
                <UsageDetail
                  :detail="system.live ? system.realtime.mem : system.data.mem"
                />
              </template>
            </StatCard>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 d-flex align-items-stretch">
            <StatCard title="Disk" icon="fa-solid fa-hard-drive" tone="green">
              <template #detail>
                <UsageDetail
                  :detail="system.live ? system.realtime.disk : system.data.disk"
                />
              </template>
            </StatCard>
          </div>
        </div>
      </section>

      <!-- Service status -->
      <section id="services" class="page-section">
        <div class="row">
          <div class="col">
            <ServiceStatus />
          </div>
        </div>
      </section>

      <!-- Resource gauges -->
      <section id="usage" class="page-section">
        <div class="row">
          <div class="col">
            <div class="card panel-card border-0 shadow-lg">
              <SectionHeader
                title="System Resources"
                subtitle="Real-time utilization"
                icon="fa-solid fa-gauge-high"
                tone="blue"
              />
              <div class="panel-body">
                <div class="row">
                  <div class="col-sm-12 col-md-6 col-lg-4 mt-3 mt-md-0">
                    <GaugeChart
                      title="CPU Usage"
                      id="cpu"
                      :metric="
                        system.live
                          ? system.realtime.cpu.usage
                          : system.data.cpu.usage
                      "
                      format="{y}%"
                    />
                  </div>
                  <div class="col-sm-12 col-md-6 col-lg-4 mt-3 mt-md-0">
                    <GaugeChart
                      title="Memory Usage"
                      id="mem"
                      :metric="
                        system.live
                          ? system.realtime.mem.percent
                          : system.data.mem.percent
                      "
                      format="{y}%"
                    />
                  </div>
                  <div class="col-sm-12 col-md-6 col-lg-4 mt-3 mt-md-0">
                    <GaugeChart
                      title="Disk Space Used"
                      id="disk"
                      :metric="
                        system.live
                          ? system.realtime.disk.percent
                          : system.data.disk.percent
                      "
                      format="{y}%"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Realtime line charts (live mode only) -->
      <section id="d3-line-charts" v-if="system.live" class="page-section">
        <div class="row g-4">
          <div class="col-sm-12 col-md-6">
            <div class="card panel-card border-0 shadow-lg">
              <SectionHeader
                title="CPU Usage"
                subtitle="Last 60 seconds · %"
                icon="fa-solid fa-wave-square"
                tone="purple"
              />
              <div class="panel-body p-0">
                <RealtimeLineChart
                  :data-point="system.realtime.cpu.usage"
                  :y-axis-range="[0, 100]"
                  tone="purple"
                  unit="%"
                  :decimals="0"
                />
              </div>
            </div>
          </div>
          <div class="col-sm-12 col-md-6">
            <div class="card panel-card border-0 shadow-lg">
              <SectionHeader
                title="Memory Usage"
                subtitle="Last 60 seconds · GB"
                icon="fa-solid fa-wave-square"
                tone="amber"
              />
              <div class="panel-body p-0">
                <RealtimeLineChart
                  :data-point="system.realtime.mem.used"
                  :y-axis-range="[0, 16]"
                  tone="amber"
                  unit="GB"
                  :decimals="1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Top processes -->
      <section id="processes-information" class="page-section">
        <div class="row">
          <div class="col">
            <div class="card panel-card border-0 shadow-lg">
              <SectionHeader
                title="Top Processes"
                subtitle="By memory usage"
                icon="fa-solid fa-list-ul"
                tone="green"
              />
              <div class="panel-body">
                <div class="row align-items-center">
                  <div class="col-sm-12 col-md-6 col-lg-8">
                    <BarChart
                      metric="system"
                      id="processes"
                      title=""
                      :series="
                        system.live && system.realtime.processes.length > 0
                          ? system.formatBarChartDataForSystem(
                              system.realtime.processes,
                              'mem',
                            )
                          : system.formatBarChartDataForSystem(
                              system.data.processes,
                              'mem',
                            )
                      "
                      sort-key="data"
                      sort-order="desc"
                      y-axis-text="Memory Used"
                      x-axis-text="System Process"
                    />
                  </div>
                  <div class="col-sm-12 col-md-6 col-lg-4">
                    <PieChart
                      id="system-processes"
                      title=""
                      :series="
                        system.live && system.realtime.processes.length > 0
                          ? system.formatPieChartDataForProcesses(
                              system.realtime.processes,
                            )
                          : system.formatPieChartDataForProcesses(
                              system.data.processes,
                            )
                      "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
@media (max-width: 575.98px) {
  .dashboard-root { padding-top: 1rem !important; padding-bottom: 1rem !important; }
}
</style>
