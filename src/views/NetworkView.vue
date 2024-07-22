<script setup lang="ts">
import { onMounted } from "vue";
import { useLoadingStore } from "@/stores/loading";
import { useNetworkStore } from "@/stores/network";
import PageHeader from "@/components/PageHeader.vue";
import StatCard from "@/components/stats/StatCard.vue";
import NetworkDetail from "@/components/stats/NetworkDetail.vue";
import GaugeChart from "@/components/charts/GaugeChart.vue";
import BarChart from "@/components/charts/BarChart.vue";

const loader = useLoadingStore();
const network = useNetworkStore();

onMounted(() => {
  network
    .get()
    .then(() => {
      if (!network.speedtestInProgress) {
        network.speedtest({ timeout: true });
      }
    });
});
</script>

<template>
  <Transition name="fade">
    <div v-if="loader.loaded" class="container py-4">
      <PageHeader
        decor-title="Raspberry Pi Monitor"
        title="Network Monitoring"
      />
      <section id="statistics" class="page-section mt-0">
        <div class="row mt-3">
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard
              title="Wireless Network"
              bg="dark"
              icon="fa-solid fa-wifi"
            >
              <template #detail>
                <NetworkDetail :wifi="network.data.wireless" :network="network.data" />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard
              title="Download Speed"
              bg="dark"
              icon="fa-solid fa-arrow-circle-down"
            >
              <template #detail>
                <GaugeChart
                  id="download"
                  :metric="parseInt(network.speed.download ?? '0')"
                  format="{y} Mb/s"
                />
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard
              title="Upload Speed"
              bg="dark"
              icon="fa-solid fa-arrow-circle-up"
            >
              <template #detail>
                <GaugeChart
                  id="upload"
                  :metric="parseInt(network.speed.upload ?? '0')"
                  format="{y} Mb/s"
                />
              </template>
            </StatCard>
          </div>
        </div>
      </section>

      <section v-for="(idx, inet) in network.data.statistics" :key="inet">
        <div
          v-if="
            typeof network.data.statistics[inet] !== undefined &&
            network.data.statistics[inet].mb_received > 0
          "
        >
          <div class="row mt-3">
            <div class="col">
              <div class="card border-0 shadow-lg">
                <div
                  class="card-header bg-transparent border-0 d-flex justify-content-center py-4"
                >
                  <h2 class="lead header">Interface {{ inet }}</h2>
                </div>
                <div class="card-body">
                  <BarChart
                    metric="network"
                    :id="(inet as string)"
                    :title="`Interface ${inet}`"
                    :series="network.formatBarChartDataForNetwork([
                      network.data.statistics[inet].mb_sent,
                      network.data.statistics[inet].mb_received,
                    ], ['mb_received', 'mb_sent'])"
                  >
                  </BarChart>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>
