import { createRouter, createWebHistory } from "vue-router";
import { config } from "@/config";
import DashboardView from "../views/DashboardView.vue";
import HubFleetView from "../views/HubFleetView.vue";
import HubHostView from "../views/HubHostView.vue";

const router = createRouter({
  history: createWebHistory(config.app.base_url),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    // Hub-mode routes — registered unconditionally so deep links don't
    // 404 when VITE_HUB_URL is added later. The view itself surfaces a
    // friendly "hub mode disabled" message when not configured.
    {
      path: "/hub",
      name: "hub-fleet",
      component: HubFleetView,
    },
    {
      path: "/hub/hosts/:id(\\d+)",
      name: "hub-host",
      component: HubHostView,
    },
  ],
});

export default router;
