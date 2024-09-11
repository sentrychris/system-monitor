<script setup lang="ts">
import { onBeforeMount } from "vue";
import { config } from "@/config";
import { useLoadingStore } from "@/stores/loading";
import { useSystemStore } from "@/stores/system";
import PageHeader from "@/components/PageHeader.vue";
import StatCard from "@/components/stats/StatCard.vue";
import PlatformDetail from "@/components/stats/PlatformDetail.vue";
import CpuDetail from "@/components/stats/CpuDetail.vue";
import UsageDetail from "@/components/stats/UsageDetail.vue";
import GaugeChart from "@/components/charts/GaugeChart.vue";
import RealtimeLineChart from "@/components/charts/RealtimeLineChart.vue";
import BarChart from "@/components/charts/BarChart.vue";
import PieChart from "@/components/charts/PieChart.vue";
import DataTable from "@/components/DataTable.vue";

const loader = useLoadingStore();
const system = useSystemStore();

onBeforeMount(() => {
  const connection = system.type ?? config.api.connection;
  system.connect({ websocket: connection === "websocket", refresh: false });
});
</script>

<template>
  <Transition name="fade">
    <div v-if="loader.loaded" class="container py-4">
      <PageHeader :decor-title="config.app.name" :title="config.app.title" />
      <section id="statistics" class="page-section mt-0">
        <div class="row mt-3">
          <div class="col-sm-12 col-md-6 col-lg-3 d-flex align-items-stretch">
            <StatCard title="Platform" bg="dark" icon="fa-solid fa-server">
              <template #detail>
                <PlatformDetail
                  :detail="system.data.platform"
                  :uptime="system.realtime.uptime"
                />
              </template>
            </StatCard>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 d-flex align-items-stretch mt-4 mt-md-0">
            <StatCard title="CPU" bg="dark" icon="fa-solid fa-tachometer-alt">
              <template #detail>
                <CpuDetail
                  :detail="system.live
                    ? system.realtime.cpu
                    : system.data.cpu"
                />
              </template>
            </StatCard>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 d-flex align-items-stretch mt-4 mt-lg-0">
            <StatCard title="Memory" bg="dark" icon="fa-solid fa-server">
              <template #detail>
                <UsageDetail
                  :detail="system.live
                    ? system.realtime.mem
                    : system.data.mem"
                />
              </template>
            </StatCard>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 d-flex align-items-stretch mt-4 mt-lg-0">
            <StatCard title="Disk" bg="dark" icon="fa-solid fa-hard-drive">
              <template #detail>
                <UsageDetail
                  :detail="system.live
                    ? system.realtime.disk
                    : system.data.disk"
                />
              </template>
            </StatCard>
          </div>
        </div>
      </section>

      <section id="usage" class="page-section">
        <div class="row">
          <div class="col">
            <div class="card border-0 shadow-lg">
              <div class="card-body pt-4">
                <div class="row">
                  <div class="col-sm-12 col-md-6 col-lg-4 mt-3 mt-md-0">
                    <GaugeChart
                      title="CPU Usage"
                      id="cpu"
                      :metric="system.live
                        ? system.realtime.cpu.usage
                        : system.data.cpu.usage"
                      format="{y}%"
                    />
                  </div>
                  <div class="col-sm-12 col-md-6 col-lg-4 mt-3 mt-md-0">
                    <GaugeChart
                      title="Memory Usage"
                      id="mem"
                      :metric="system.live
                        ? system.realtime.mem.percent
                        : system.data.mem.percent"
                      format="{y}%"
                    />
                  </div>
                  <div class="col-sm-12 col-md-6 col-lg-4 mt-3 mt-md-0">
                    <GaugeChart
                      title="Disk Space Used"
                      id="disk"
                      :metric="system.live
                        ? system.realtime.disk.percent
                        : system.data.disk.percent"
                      format="{y}%"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="d3-line-charts" v-if="system.live">
        <div class="row">
          <div class="col-sm-12 col-md-6">
            <div class="card border-0 shadow-lg">
              <div class="card-header pb-0 bg-transparent border-0 d-flex justify-content-center py-4">
                <h3 class="lead header">CPU Usage %</h3>
              </div>
              <div class="card-body p-0">
                <RealtimeLineChart
                  :data-point="system.realtime.cpu.usage"
                  :y-axis-range="[0, 100]"
                />
              </div>
            </div>
          </div>
          <div class="col-sm-12 col-md-6 mt-4 mt-md-0">
            <div class="card border-0 shadow-lg">
              <div class="card-header pb-0 bg-transparent border-0 d-flex justify-content-center py-4">
                <h3 class="lead header">Memory Usage GB</h3>
              </div>
              <div class="card-body p-0">
                <RealtimeLineChart
                  :data-point="system.realtime.mem.used"
                  :y-axis-range="[0, 16]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="processes-information" class="page-section">
        <div class="row">
          <div class="col">
            <div class="card border-0 shadow-lg">
              <div class="card-header bg-transparent border-0 d-flex justify-content-center py-4">
                <h3 class="lead header">Top Processes by Memory</h3>
              </div>
              <div class="card-body pt-0">
                <div class="row">
                  <div class="col-sm-12 col-md-6 col-lg-8">
                    <BarChart
                      metric="system"
                      id="processes"
                      title=""
                      :series="
                        (system.live && system.realtime.processes.length > 0)
                          ? system.formatBarChartDataForSystem(system.realtime.processes, 'mem')
                          : system.formatBarChartDataForSystem(system.data.processes, 'mem')"
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
                      (system.live && system.realtime.processes.length > 0)
                        ? system.formatPieChartDataForProcesses(system.realtime.processes)
                        : system.formatPieChartDataForProcesses(system.data.processes)"
                    />
                  </div>
                </div>
                <DataTable type="horizontal"
                  :data="(system.live && system.realtime.processes.length > 0)
                    ? system.realtime.processes
                    : system.data.processes"
                  :exclude-columns="['memory_info']"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>
