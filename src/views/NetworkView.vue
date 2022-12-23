<script setup lang="ts">
import { onMounted } from "vue";
import { useLoadingStore } from "@/stores/loading";
import { useNetworkStore } from "@/stores/network";
import PageHeader from "@/components/PageHeader.vue";
import StatCard from "@/components/stats/StatCard.vue";
import BarChart from "@/components/charts/BarChart.vue";

const loader = useLoadingStore();
const network = useNetworkStore();

onMounted(() => {
  network.get({
    wifi: true
  })
});
</script>

<template>
  <Transition name="fade">
    <div v-if="loader.loaded" class="container-fluid px-5 py-4">
      <PageHeader decor-title="Raspbian Monitor" title="Network Monitoring" />
      <section id="statistics" class="page-section mt-0">
        <div class="row mt-3">
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Wireless Network" bg="dark" icon="fa-solid fa-wifi">
              <template #detail>
                <strong>{{ network.wifi.name }}</strong>
              </template>
            </StatCard>
          </div>
          <!-- <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Wireless Network" bg="dark" icon="fa-solid fa-wifi">
              <template #detail>
                <strong>{{ network.wifi.name }}</strong>
              </template>
            </StatCard>
          </div>
          <div class="col d-flex align-items-stretch mt-3 mt-md-0">
            <StatCard title="Wireless Network" bg="dark" icon="fa-solid fa-wifi">
              <template #detail>
                <strong>{{ network.wifi.name }}</strong>
              </template>
            </StatCard>
          </div> -->
        </div>
      </section>


      <section v-for="(idx, inet) in network.data.interfaces" :key="inet">
        <div v-if="(typeof network.data.interfaces[inet] !== undefined && network.data.interfaces[inet].mb_received > 0)">
          <div class="row mt-3">
            <div class="col">
              <div class="card border-0 shadow-lg">
                <div class="card-header bg-transparent border-0 d-flex justify-content-center py-4">
                  <h2 class="lead header">Interface {{ inet }}</h2>
                </div>
                <div class="card-body">
                  <BarChart 
                    metric="network"
                    :id="(inet as string)"
                    :title="`Interface ${inet}`"
                    :series="[network.data.interfaces[inet].mb_sent, network.data.interfaces[inet].mb_received]">
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