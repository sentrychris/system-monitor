<script setup lang="ts">
import { inject, ref, onMounted } from "vue";
import { httpInjectionSymbol, chartInjectionSymbol } from "@/injection";
import type { SystemResponse } from "@/interfaces/SystemResponse";
import type { ChartItem } from "chart.js";
import StatCard from "@/components/stats/StatCard.vue";
import PlatformDetail from "@/components/stats/PlatformDetail.vue";
import CpuDetail from "@/components/stats/CpuDetail.vue";
import UsageDetail from "@/components/stats/UsageDetail.vue";

const http = inject(httpInjectionSymbol);
const chart = inject(chartInjectionSymbol);

const loading = ref(true) // todo move to store
const system = ref<SystemResponse>()
const chartCanvas = ref<ChartItem>()

onMounted(() => {
  http?.get('system').then((response) => {
    loading.value = false
    
    const { data }: {data: SystemResponse} = response.data
    system.value = data
    
    const config = {
      labels: ['CPU'],
      datasets: [{
        data: [data.cpu.temp, 100],
        backgroundColor: [
          'rgb(255, 99, 132)',
          '#e6e6e6',
        ],
        hoverOffset: 4
      }],
    }

    chart?.donut(chartCanvas, config, {
      responsive: true,
      cutout: 20,
    });
  });
});
</script>

<template>
  <main>
    <div class="container-fluid px-5 py-4">
      <div class="row" v-if="system">
        <div class="col d-flex align-items-stretch">
          <StatCard title="Platform" bg="dark" :loading="loading">
            <template #detail>
              <PlatformDetail :detail="system.platform"></PlatformDetail>
            </template>
          </StatCard>
        </div>
        <div class="col d-flex align-items-stretch">
          <StatCard title="CPU" bg="success" :loading="loading">
            <template #detail>
              <CpuDetail :detail="system.cpu"></CpuDetail>
            </template>
          </StatCard>
        </div>
        <div class="col d-flex align-items-stretch">
          <StatCard title="Memory" bg="success" :loading="loading">
            <template #detail>
              <UsageDetail :detail="system.mem"></UsageDetail>
            </template>
          </StatCard>
        </div>
        <div class="col d-flex align-items-stretch">
          <StatCard title="Disk" bg="dark" :loading="loading">
            <template #detail>
              <UsageDetail :detail="system.disk"></UsageDetail>
            </template>
          </StatCard>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col">
          <div class="card">
            <div class="card-header">
              <p>Hello</p>
            </div>
            <div class="card-body">
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
