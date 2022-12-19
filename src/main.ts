import { createApp } from "vue";
import { createPinia } from "pinia";

import { http } from "./http";
import { chart } from "./chart";
import { httpInjectionSymbol, chartInjectionSymbol } from "./injection";

import App from "./App.vue";
import router from "./router";

import "bootstrap";
import "./assets/main.scss";

const app = createApp(App);
app.provide(httpInjectionSymbol, http)
app.provide(chartInjectionSymbol, chart)

app.use(createPinia());
app.use(router);

app.mount("#app");
