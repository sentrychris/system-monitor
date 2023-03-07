<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useThemeStore } from "@/stores/theme";

const theme = useThemeStore();
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-lg">
    <div class="container-fluid px-5 py-2">
      <a class="navbar-brand" href="#">Pi Monitor</a>
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
      </div>
    </div>
  </nav>
</template>
