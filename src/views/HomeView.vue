<script setup lang="ts">
import StatCard from "@/components/StatCard.vue";
</script>


<template>
  <main>
    <div class="container py-4">
      <div class="row">
        <div class="col">
          <StatCard title="Platform" bg="dark">
            <template #detail>
              <p><strong>OS</strong> Raspbian GNU/Linux 11 (bullseye)</p>
              <p><strong>Kernel</strong> 5.15.61-v71+</p>
              <p><strong>Up</strong> 21 hours, 28 minutes, 19 seconds</p>
            </template>
          </StatCard>
        </div>
        <div class="col">
          <StatCard title="CPU" bg="success">
            <template #detail>
              <p><strong>OS</strong> Raspbian GNU/Linux 11 (bullseye)</p>
              <p><strong>Kernel</strong> 5.15.61-v71+</p>
              <p><strong>Up</strong> 21 hours, 28 minutes, 19 seconds</p>
            </template>
          </StatCard>
        </div>
        <div class="col">
          <StatCard title="Memory" bg="success">
            <template #detail>
              <p><strong>OS</strong> Raspbian GNU/Linux 11 (bullseye)</p>
              <p><strong>Kernel</strong> 5.15.61-v71+</p>
              <p><strong>Up</strong> 21 hours, 28 minutes, 19 seconds</p>
            </template>
          </StatCard>
        </div>
        <div class="col">
          <StatCard title="Disk" bg="warning">
            <template #detail>
              <p><strong>OS</strong> Raspbian GNU/Linux 11 (bullseye)</p>
              <p><strong>Kernel</strong> 5.15.61-v71+</p>
              <p><strong>Up</strong> 21 hours, 28 minutes, 19 seconds</p>
            </template>
          </StatCard>
        </div>
      </div>
      <div class="row mt-3">
        <div class="card">
          <div class="card-header">
            <p>Hello</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
