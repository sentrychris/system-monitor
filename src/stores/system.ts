import { defineStore } from "pinia";
import { inject } from "vue";
import { useLoadingStore } from "./loading";
import { HttpMaker } from "@/plugins/http";
import { httpInjectionSymbol } from "@/injection";
import type {
  SystemResponse,
  RealtimeSystemResponse,
} from "@/interfaces/SystemResponse";

export const useSystemStore = defineStore("system", {
  state: () => ({
    data: <SystemResponse>{},
    realtime: <RealtimeSystemResponse>{
      cpu: {
        freq: 0,
        temp: 0,
        usage: 0,
      },
      mem: {
        total: 0,
        used: 0,
        free: 0,
        percent: 0,
      },
      disk: {
        total: 0,
        used: 0,
        free: 0,
        percent: 0,
      },
      uptime: null,
    },
    connection: <WebSocket | null>null,
    live: false,
  }),
  actions: {
    async connect({ websocket = false }: { websocket: boolean }) {
      const loader = useLoadingStore();
      const http = inject(httpInjectionSymbol, new HttpMaker());

      loader.setMessage("Requesting new monitor connection...");
      http
        .get("system")
        .then((response) => {
          const { data }: { data: SystemResponse } = response.data;
          this.staticUpdate(data);
          if (websocket) {
            this.websocket();
          } else {
            loader.toggle(true);
          }
        })
        .catch(() => {
          loader.setError("An unexpected error has occurred");
        });
    },
    async websocket() {
      const loader = useLoadingStore();
      loader.setMessage("Connecting to websocket...");

      const client = await fetch("http://192.168.1.100:4200", {
        method: "POST",
        body: JSON.stringify({ connection: "monitor" }),
      });

      const worker = await client.json();
      const url = `ws://192.168.1.100:4200/ws?id=${worker.id}`;

      this.connection = this.connection ?? new WebSocket(url);
      this.connection.onopen = () => {
        loader.setMessage("Websocket connected, loading dashboard...");
        loader.toggle(true);
        this.live = true;
      };
      this.connection.onerror = () => {
        loader.toggle(false);
        loader.setMessage("Error! Unable to connect to websocket...");
      };
      this.connection.onmessage = (response) => {
        try {
          const data = JSON.parse(response.data) as RealtimeSystemResponse;
          this.liveUpdate(data);
        } catch (error) {
          console.log({ error });
        }
      };
      this.connection.onclose = () => {
        this.live = false;
        this.connection = null;
        console.log('websocket connection closed');
      };
    },
    async close() {
      if (this.connection instanceof WebSocket) {
        this.connection.close();
        this.connect({ websocket: false });
      }
    },
    async reconnect() {
      if (this.connection instanceof WebSocket) {
        this.connection.close();
        this.connect({ websocket: true });
      }
    },
    staticUpdate(data: SystemResponse) {
      this.$patch({ data });
    },
    liveUpdate(realtime: RealtimeSystemResponse) {
      this.$patch({ realtime });
    },
  },
});
