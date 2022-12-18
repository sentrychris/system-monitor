import { createApp } from "vue";
import { createPinia } from "pinia";
import { HttpClient } from "@/api/HttpClient";

import App from "./App.vue";
import router from "./router";

import "bootstrap";
import "./assets/main.scss";

const app = createApp(App);
app.provide('http', new HttpClient)

app.use(createPinia());
app.use(router);

app.mount("#app");
