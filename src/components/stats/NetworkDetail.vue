<script setup lang="ts">
import type {
  NetworkResponse,
  WifiResponse,
} from "@/interfaces/NetworkResponse";

defineProps<{
  wifi: WifiResponse;
  network: NetworkResponse;
}>();
</script>

<template>
  <p class="pt-3"><strong>SSID:</strong> {{ wifi.name }}</p>
  <p><strong>Channel:</strong> {{ wifi.channel }}</p>
  <hr />
  <p><strong>Signal:</strong> {{ wifi.signal }}</p>
  <p><strong>Quality:</strong> {{ wifi.quality }}</p>
  <hr />
  <p><strong>Address:</strong> {{ wifi.address }}</p>
  <p><strong>Encryption:</strong> {{ wifi.encryption }}</p>
  <hr />
  <p>
    <strong>Connections: </strong>
    <span v-if="network.connections">{{ network.connections.ssh.length }}</span>
    clients attached
  </p>
</template>
