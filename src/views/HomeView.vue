<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import { httpInjectionSymbol } from "@/injection";
import { useLoadingStore } from "@/stores/loading";

import type { SystemResponse } from "@/interfaces/SystemResponse";

import PageHeader from "@/components/PageHeader.vue";
import StatCard from "@/components/stats/StatCard.vue";
import PlatformDetail from "@/components/stats/PlatformDetail.vue";
import CpuDetail from "@/components/stats/CpuDetail.vue";
import UsageDetail from "@/components/stats/UsageDetail.vue";
import DonutChart from "@/components/charts/DonutChart.vue";
import DataTable from "@/components/DataTable.vue";
import ResponsiveLineChart from "@/components/charts/ResponsiveLineChart.vue";

const loading = useLoadingStore();
const http = inject(httpInjectionSymbol);
const system = ref<SystemResponse>();

onMounted(() => {
  http?.get("system").then((response) => {
    const { data }: { data: SystemResponse } = response.data;
    system.value = data;
    loading.toggle(false);
  });
});
</script>

<template>
  <main>
    <div class="container-fluid px-5 py-4">
      <PageHeader decor-title="Raspbian Monitor" title="Dashboard" />
      <section id="statistics" class="page-section mt-0">
        <div class="row mt-3">
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Platform" bg="dark" icon="fa-solid fa-server">
              <template #detail>
                <PlatformDetail v-if="system" :detail="system.platform" />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="CPU" bg="success" icon="fa-solid fa-tachometer-alt">
              <template #detail>
                <CpuDetail v-if="system" :detail="system.cpu" />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Memory" bg="success" icon="fa-solid fa-server">
              <template #detail>
                <UsageDetail v-if="system" :detail="system.mem" />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Disk" bg="dark" icon="fa-solid fa-hard-drive">
              <template #detail>
                <UsageDetail v-if="system" :detail="system.disk" />
              </template>
            </StatCard>
          </div>
        </div>
      </section>

      <section id="d3">
        <div class="row">
          <div class="col">
            <div class="card">
              <div class="card-body p-5">
                <ResponsiveLineChart :data="[20, 40, 15, 25, 60, 10]" />
              </div>
            </div>
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
                <div v-if="system" class="row">
                  <div class="col mt-3 mt-md-0">
                    <DonutChart :data="system.cpu.temp" label="Temp" />
                  </div>
                  <div class="col mt-3 mt-md-0">
                    <DonutChart :data="system.cpu.usage" label="CPU" />
                  </div>
                  <div class="col mt-3 mt-md-0">
                    <DonutChart :data="system.mem.percent" label="Memory" />
                  </div>
                  <div class="col mt-3 mt-md-0">
                    <DonutChart :data="system.disk.percent" label="Disk" />
                  </div>
                </div>
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
                <DataTable v-if="system" type="horizontal" :data="system.processes" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
