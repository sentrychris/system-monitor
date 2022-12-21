<script setup lang="ts">
import { onMounted } from "vue";
import { useLoadingStore } from "@/stores/loading";
import { useSystemStore } from "@/stores/system";
import PageHeader from "@/components/PageHeader.vue";
import StatCard from "@/components/stats/StatCard.vue";
import PlatformDetail from "@/components/stats/PlatformDetail.vue";
import CpuDetail from "@/components/stats/CpuDetail.vue";
import UsageDetail from "@/components/stats/UsageDetail.vue";
import DataTable from "@/components/DataTable.vue";
import RealtimeLineChart from "@/components/charts/RealtimeLineChart.vue";
import GaugeChart from "@/components/charts/GaugeChart.vue"

const loader = useLoadingStore();
const system = useSystemStore();

onMounted(() => {
  system.connect({
    // set this to true if you would like realtime data
    // obtained through a websocket connection
    websocket: true
  })
});
</script>

<template>
  <Transition name="fade">
    <div v-if="loader.loaded" class="container-fluid px-5 py-4">
      <PageHeader decor-title="Raspbian Monitor" title="Dashboard" />
      <section id="statistics" class="page-section mt-0">
        <div class="row mt-3">
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Platform" bg="dark" icon="fa-solid fa-server">
              <template #detail>
                <PlatformDetail :detail="system.data.platform" :uptime="system.realtime.uptime" />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="CPU" bg="success" icon="fa-solid fa-tachometer-alt">
              <template #detail>
                <CpuDetail v-if="system.live" :detail="system.realtime.cpu" />
                <CpuDetail v-else :detail="system.data.cpu" />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Memory" bg="success" icon="fa-solid fa-server">
              <template #detail>
                <UsageDetail v-if="system.live" :detail="system.realtime.mem" />
                <UsageDetail v-else :detail="system.data.mem" />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Disk" bg="dark" icon="fa-solid fa-hard-drive">
              <template #detail>
                <UsageDetail :detail="system.data.disk" />
              </template>
            </StatCard>
          </div>
        </div>
      </section>

      <section id="usage" class="page-section">
        <div class="row">
          <div class="col">
            <div class="card border-0 shadow-lg">
              <div class="card-header bg-transparent border-0 d-flex justify-content-center py-4">
                <h2 class="header">Usage Overview</h2>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col mt-3 mt-md-0">
                    <GaugeChart title="Temperature" id="temp" :metric="system.realtime.cpu.temp" format="{y}°C" />
                  </div>
                  <div class="col mt-3 mt-md-0">
                    <GaugeChart title="CPU Usage" id="cpu" :metric="system.realtime.cpu.usage" format="{y}%" />
                  </div>
                  <div class="col mt-3 mt-md-0">
                    <GaugeChart title="Memory Usage" id="mem" :metric="system.data.mem.percent" format="{y}%" />
                  </div>
                  <div class="col mt-3 mt-md-0">
                    <GaugeChart title="Disk Usage" id="disk" :metric="system.data.disk.percent" format="{y}%" />
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
              <div class="card-header bg-transparent border-0 d-flex justify-content-center">
                <h2 class="header mb-0">CPU Usage %</h2>
              </div>
              <div class="card-body">
                <RealtimeLineChart :data-point="system.realtime.cpu.usage" :y-range="[0, 100]" />
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 shadow-lg">
              <div class="card-header bg-transparent border-0 d-flex justify-content-center">
                <h2 class="header mb-0">Memory Usage</h2>
              </div>
              <div class="card-body">
                <RealtimeLineChart :data-point="system.realtime.mem.used" :y-range="[0, 4]" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section id="processes" class="page-section">
        <div class="row">
          <div class="col">
            <div class="card border-0 shadow-lg">
              <div class="card-header bg-transparent border-0 d-flex justify-content-center py-4">
                <h2 class="header">Top Processes</h2>
              </div>
              <div class="card-body">
                <DataTable type="horizontal" :data="system.data.processes" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>
