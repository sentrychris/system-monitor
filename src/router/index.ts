import { createRouter, createWebHistory } from "vue-router";
import { config } from "@/config";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(config.app.base_url),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/network",
      name: "network",
      // route level code-splitting
      // this generates a separate chunk (Network.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/NetworkView.vue"),
    },
  ],
});

export default router;
