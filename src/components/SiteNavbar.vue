<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useThemeStore } from "@/stores/theme";
import { useSystemStore } from "@/stores/system";
import { config } from "@/config";
import SiteLogo from "./SiteLogo.vue";

const theme = useThemeStore();
const system = useSystemStore();
const connection = ref(config.api.connection);

const toggleConnection = () => {
  connection.value = connection.value === "websocket" ? "http" : "websocket";
  const websocket = connection.value === "websocket";
  system.refresh(websocket);
};
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-lg">
    <div class="container-fluid px-5 py-2">
      <a class="navbar-brand" href="#">
        <SiteLogo />
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link active" :to="{ name: 'home' }"
              >System</RouterLink
            >
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'network' }"
              >Network</RouterLink
            >
          </li>
        </ul>
        <div class="d-block">
          <div class="d-flex align-items-center justify-content-end gap-4">
            <div class="form-check form-switch">
              <input
                @change="theme.toggle"
                :checked="theme.active === 'dark'"
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
              />
              <label class="form-check-label" for="flexSwitchCheckDefault">
                <font-awesome-icon
                  icon="fa-solid fa-moon"
                  :class="{
                    'text-warning': theme.active === 'dark',
                    'text-muted': theme.active === 'light',
                  }"
                />
              </label>
            </div>
            <div class="form-check form-switch">
              <input
                @change="toggleConnection"
                :checked="connection === 'websocket'"
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDesfault"
              />
              <label class="form-check-label" for="flexSwitchCheckDesfault">
                <font-awesome-icon
                  class="text-primary"
                  v-if="connection === 'websocket'"
                  icon="fa-solid fa-pause"
                />
                <font-awesome-icon
                  class="text-success"
                  v-if="connection === 'http'"
                  icon="fa-solid fa-play"
                />
              </label>
            </div>
          </div>
          <div class="d-flex align-items-center justify-content-end mt-2">
            <small class="ms-2 text-muted fw-bold"
              >(Connection: {{ connection }})</small
            >
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
