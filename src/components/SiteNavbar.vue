<script setup lang="ts">
import { useThemeStore } from "@/stores/theme";
import { useSystemStore } from "@/stores/system";
import SiteLogo from "./SiteLogo.vue";

const theme = useThemeStore();
const system = useSystemStore();
</script>

<template>
  <nav class="navbar navbar-expand-lg site-navbar shadow-lg">
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
            class="d-flex align-items-center justify-content-start justify-content-md-end gap-3"
          >
            <!-- Theme toggle -->
            <label class="nav-toggle">
              <input
                type="checkbox"
                @change="theme.toggle"
                :checked="theme.active === 'dark'"
              />
              <span class="nav-toggle-track">
                <font-awesome-icon
                  icon="fa-solid fa-sun"
                  class="track-icon track-icon-left"
                />
                <font-awesome-icon
                  icon="fa-solid fa-moon"
                  class="track-icon track-icon-right"
                />
                <span class="nav-toggle-thumb"></span>
              </span>
            </label>

            <!-- Connection mode toggle -->
            <label class="nav-toggle">
              <input
                type="checkbox"
                @change="system.toggle"
                :checked="system.connectionType === 'websocket'"
              />
              <span class="nav-toggle-track">
                <font-awesome-icon
                  icon="fa-solid fa-bolt"
                  class="track-icon track-icon-left"
                />
                <font-awesome-icon
                  icon="fa-solid fa-pause"
                  class="track-icon track-icon-right"
                />
                <span class="nav-toggle-thumb"></span>
              </span>
            </label>
          </div>
          <div
            class="d-flex align-items-center justify-content-start justify-content-md-end mt-2"
          >
            <span class="conn-pill" :class="`conn-${system.connectionType}`">
              <span class="conn-dot"></span>
              {{ system.connectionType === "websocket" ? "Live" : "Static" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.site-navbar {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1030;
  overflow: hidden;
}
.site-navbar::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(700px circle at 0% 0%, rgba(59, 130, 246, 0.1), transparent 40%),
    radial-gradient(500px circle at 100% 100%, rgba(168, 85, 247, 0.08), transparent 40%);
  pointer-events: none;
}
.site-navbar .container { position: relative; z-index: 1; }

.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.15);
}
.navbar-toggler-icon {
  filter: invert(1);
  opacity: 0.8;
}

/* ---------- Custom toggle ---------- */
.nav-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.nav-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.nav-toggle-track {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 56px;
  height: 26px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: background 0.2s ease;
}
.nav-toggle:hover .nav-toggle-track {
  background: rgba(255, 255, 255, 0.12);
}

.track-icon {
  font-size: 0.65rem;
  z-index: 1;
  transition: color 0.2s ease;
}
.track-icon-left  { color: #fbbf24; }
.track-icon-right { color: #94a3b8; }

.nav-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #f9fafb;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-toggle input:checked ~ .nav-toggle-track .nav-toggle-thumb {
  transform: translateX(30px);
}
.nav-toggle input:checked ~ .nav-toggle-track .track-icon-left  { color: #6b7280; }
.nav-toggle input:checked ~ .nav-toggle-track .track-icon-right { color: #c084fc; }

/* ---------- Connection pill ---------- */
.conn-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.conn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}
.conn-websocket { color: #34d399; }
.conn-http      { color: #94a3b8; }
.conn-websocket .conn-dot { animation: live-pulse 1.6s ease-in-out infinite; }

@keyframes live-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
}
</style>
