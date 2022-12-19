import { createApp } from "vue";
import { createPinia } from "pinia";

import { http } from "./http";
import { chart } from "./chart";
import { httpInjectionSymbol, chartInjectionSymbol } from "./injection";

import App from "./App.vue";
import router from "./router";

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import "./icons";
import "bootstrap";
import "./assets/main.scss";

createApp(App)
    .provide(httpInjectionSymbol, http)
    .provide(chartInjectionSymbol, chart)
    .use(createPinia())
    .use(router)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount("#app");
