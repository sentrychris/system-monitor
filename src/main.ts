import { createApp } from "vue";
import { createPinia } from "pinia";

import { http } from "./http";
import { httpInjectionSymbol } from "./injection";

import App from "./App.vue";
import router from "./router";

import "bootstrap";
import "./assets/main.scss";

const app = createApp(App);
app.provide(httpInjectionSymbol, http)

app.use(createPinia());
app.use(router);

app.mount("#app");
