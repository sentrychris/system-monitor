import { createRouter, createWebHistory } from "vue-router";
import { config } from "@/config";
import DashboardView from "../views/DashboardView.vue";
import HubFleetView from "../views/HubFleetView.vue";
import HubHostView from "../views/HubHostView.vue";
import HubHelpView from "../views/HubHelpView.vue";
import HubHelpAlerts from "../views/help/HubHelpAlerts.vue";
import HubHelpDeployment from "../views/help/HubHelpDeployment.vue";
import HubRulesView from "../views/HubRulesView.vue";

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
    // Docs section — HubHelpView is the layout (sidebar + <router-view>);
    // each article is a child route. /hub/help redirects to the alerts
    // article so existing deep links keep working.
    {
      path: "/hub/help",
      component: HubHelpView,
      children: [
        { path: "", redirect: { name: "hub-help-alerts" } },
        {
          path: "alerts",
          name: "hub-help-alerts",
          component: HubHelpAlerts,
        },
        {
          path: "deployment",
          name: "hub-help-deployment",
          component: HubHelpDeployment,
        },
      ],
    },
    {
      path: "/hub/rules",
      name: "hub-rules",
      component: HubRulesView,
    },
  ],
});

export default router;
