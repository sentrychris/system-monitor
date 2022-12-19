<script setup lang="ts">
import type { SystemResponse } from "@/interfaces/SystemResponse";
import { inject, ref, onMounted } from "vue";
import { httpInjectionSymbol, chartInjectionSymbol } from "@/injection";
import { useLoadingStore } from "@/stores/loading";
import StatCard from "@/components/stats/StatCard.vue";
import PlatformDetail from "@/components/stats/PlatformDetail.vue";
import CpuDetail from "@/components/stats/CpuDetail.vue";
import UsageDetail from "@/components/stats/UsageDetail.vue";

const loading = useLoadingStore()

const http = inject(httpInjectionSymbol);
const chart = inject(chartInjectionSymbol);

const system = ref<SystemResponse>()
const chartCanvas = ref<HTMLCanvasElement>()

onMounted(() => {
  http?.get('system').then((response) => {
    const { data }: {data: SystemResponse} = response.data
    system.value = data

    chart?.configure({
      data: data.cpu.temp,
      labels: 'CPU'
    }).then((config) => {
      chart.donut(chartCanvas, config, { responsive: true });
    })

    loading.toggle(false)
  });
});
</script>

<template>
  <main>
    <div class="container-fluid px-5 py-4">
      <div class="row">
        <div class="col d-flex align-items-stretch">
          <StatCard title="Platform" bg="dark" icon="fa-solid fa-server">
            <template #detail>
              <PlatformDetail v-if="system" :detail="system.platform" />
            </template>
          </StatCard>
        </div>
        <div class="col d-flex align-items-stretch">
          <StatCard title="CPU" bg="success" icon="fa-solid fa-tachometer-alt">
            <template #detail>
              <CpuDetail v-if="system" :detail="system.cpu" />
            </template>
          </StatCard>
        </div>
        <div class="col d-flex align-items-stretch">
          <StatCard title="Memory" bg="success" icon="fa-solid fa-server">
            <template #detail>
              <UsageDetail v-if="system" :detail="system.mem" />
            </template>
          </StatCard>
        </div>
        <div class="col d-flex align-items-stretch">
          <StatCard title="Disk" bg="dark" icon="fa-solid fa-hard-drive">
            <template #detail>
              <UsageDetail v-if="system" :detail="system.disk" />
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
              <div z>
                <canvas ref="chartCanvas"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
