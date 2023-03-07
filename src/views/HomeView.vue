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
import DataTable from "@/components/DataTable.vue";
import RealtimeLineChart from "@/components/charts/RealtimeLineChart.vue";
import GaugeChart from "@/components/charts/GaugeChart.vue";
import BarChart from "@/components/charts/BarChart.vue";

const loader = useLoadingStore();
const system = useSystemStore();

onBeforeMount(() => {
  const websocket = config.api.connection === "websocket";
  system.connect({ websocket });
});
</script>

<template>
  <Transition name="fade">
    <div v-if="loader.loaded" class="container-fluid px-5 py-4">
      <PageHeader
        decor-title="Raspberry Pi Monitor"
        title="System Monitoring"
      />
      <section id="statistics" class="page-section mt-0">
        <div class="row mt-3">
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Platform" bg="dark" icon="fa-solid fa-server">
              <template #detail>
                <PlatformDetail
                  :detail="system.data.platform"
                  :uptime="system.realtime.uptime"
                />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard
              title="CPU"
              bg="success"
              icon="fa-solid fa-tachometer-alt"
            >
              <template #detail>
                <CpuDetail
                  :detail="system.live ? system.realtime.cpu : system.data.cpu"
                />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Memory" bg="success" icon="fa-solid fa-server">
              <template #detail>
                <UsageDetail
                  :detail="system.live ? system.realtime.mem : system.data.mem"
                />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Disk" bg="dark" icon="fa-solid fa-hard-drive">
              <template #detail>
                <UsageDetail
                  :detail="
                    system.live ? system.realtime.disk : system.data.disk
                  "
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
              <div
                class="card-header bg-transparent border-0 d-flex justify-content-center py-4"
              >
                <h2 class="lead header">System Overview</h2>
              </div>
              <div class="card-body p-0">
                <div class="row">
                  <div class="col mt-3 mt-md-0">
                    <GaugeChart
                      title="Temperature"
                      id="temp"
                      :metric="
                        system.live
                          ? system.realtime.cpu.temp
                          : system.data.cpu.temp
                      "
                      format="{y}°C"
                    />
                  </div>
                  <div class="col mt-3 mt-md-0">
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
                  <div class="col mt-3 mt-md-0">
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
                  <div class="col mt-3 mt-md-0">
                    <GaugeChart
                      title="Disk Usage"
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

      <section id="d3-line-charts" v-if="system.live">
        <div class="row">
          <div class="col-6">
            <div class="card border-0 shadow-lg">
              <div
                class="card-header bg-transparent border-0 d-flex justify-content-center py-4"
              >
                <h2 class="lead header">CPU Usage %</h2>
              </div>
              <div class="card-body">
                <RealtimeLineChart
                  :data-point="system.realtime.cpu.usage"
                  :y-range="[0, 100]"
                />
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 shadow-lg">
              <div
                class="card-header bg-transparent border-0 d-flex justify-content-center py-4"
              >
                <h2 class="lead header">Memory Usage GB</h2>
              </div>
              <div class="card-body">
                <RealtimeLineChart
                  :data-point="system.realtime.mem.used"
                  :y-range="[0, 4]"
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
              <div
                class="card-header bg-transparent border-0 d-flex justify-content-center py-4"
              >
                <h2 class="lead header">Process Information</h2>
              </div>
              <div class="card-body">
                <BarChart
                  metric="system"
                  id="processes"
                  title="Top Processes"
                  :series="system.data.processes"
                  y-axis-text="Memory Used"
                />
                <DataTable type="horizontal" :data="system.data.processes" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>
