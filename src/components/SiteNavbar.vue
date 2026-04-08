<script setup lang="ts">
import { useThemeStore } from "@/stores/theme";
import { useSystemStore } from "@/stores/system";
import SiteLogo from "./SiteLogo.vue";

const theme = useThemeStore();
const system = useSystemStore();
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-lg">
    <div class="container py-2">
      <a class="navbar-brand d-flex align-items-center gap-3" href="#">
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
        <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>
        <div class="d-block">
          <div
            class="d-flex align-items-center justify-content-start justify-content-md-end gap-4"
          >
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
                @change="system.toggle"
                :checked="system.connectionType === 'websocket'"
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDesfault"
              />
              <label class="form-check-label" for="flexSwitchCheckDesfault">
                <font-awesome-icon
                  class="text-muted"
                  v-if="system.connectionType === 'websocket'"
                  icon="fa-solid fa-pause"
                />
                <font-awesome-icon
                  class="text-success"
                  v-if="system.connectionType === 'http'"
                  icon="fa-solid fa-play"
                />
              </label>
            </div>
          </div>
          <div
            class="d-flex align-items-center justify-content-start justify-content-md-end mt-2"
          >
            <small class="ms-0 ms-md-2 text-muted fw-bold"
              >(Connection:
              <span class="text-success"
                >{{ system.connectionType }})</span
              ></small
            >
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
