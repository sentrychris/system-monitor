import { createApp } from "vue";
import { createPinia } from "pinia";

import { useHttp } from "./plugins/http";
import { useWebsocket } from "./plugins/websocket";

import App from "./App.vue";
import router from "./router";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "./utilities/icons";

import "bootstrap";
import "./assets/main.scss";

createApp(App)
  .use(createPinia())
  .use(router)
  .use(useHttp)
  .use(useWebsocket)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");
