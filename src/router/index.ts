import { createRouter, createWebHistory } from "vue-router";
import { config } from "@/config";
import DashboardView from "../views/DashboardView.vue";
import HubChannelsView from "../views/HubChannelsView.vue";
import HubFleetView from "../views/HubFleetView.vue";
import HubHostView from "../views/HubHostView.vue";
import HubHelpView from "../views/HubHelpView.vue";
import HubHelpAlerts from "../views/help/HubHelpAlerts.vue";
import HubHelpChannels from "../views/help/HubHelpChannels.vue";
import HubHelpDeployment from "../views/help/HubHelpDeployment.vue";
import HubHelpFundamentals from "../views/help/HubHelpFundamentals.vue";
import HubHelpMetrics from "../views/help/HubHelpMetrics.vue";
import HubHelpOverview from "../views/help/HubHelpOverview.vue";
import HubHelpRules from "../views/help/HubHelpRules.vue";
import HubHelpTroubleshooting from "../views/help/HubHelpTroubleshooting.vue";
import HubHelpUi from "../views/help/HubHelpUi.vue";
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
    // each article is a child route. /hub/help lands on Overview, the
    // 30-second tour that maps the rest of the docs for first-time
    // readers.
    {
      path: "/hub/help",
      component: HubHelpView,
      children: [
        { path: "", redirect: { name: "hub-help-overview" } },
        {
          path: "overview",
          name: "hub-help-overview",
          component: HubHelpOverview,
        },
        {
          path: "fundamentals",
          name: "hub-help-fundamentals",
          component: HubHelpFundamentals,
        },
        {
          path: "ui",
          name: "hub-help-ui",
          component: HubHelpUi,
        },
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
        {
          path: "rules",
          name: "hub-help-rules",
          component: HubHelpRules,
        },
        {
          path: "metrics",
          name: "hub-help-metrics",
          component: HubHelpMetrics,
        },
        {
          path: "channels",
          name: "hub-help-channels",
          component: HubHelpChannels,
        },
        {
          path: "troubleshooting",
          name: "hub-help-troubleshooting",
          component: HubHelpTroubleshooting,
        },
      ],
    },
    {
      path: "/hub/rules",
      name: "hub-rules",
      component: HubRulesView,
    },
    {
      path: "/hub/channels",
      name: "hub-channels",
      component: HubChannelsView,
    },
  ],
});

export default router;
