import { defineStore } from "pinia";
import { inject } from "vue";
import { useLoadingStore } from "./loading";
import { HttpMaker } from "@/plugins/http";
import { httpInjectionSymbol } from "@/injection";
import type { SystemResponse, RealtimeSystemResponse } from "@/interfaces/SystemResponse";

export const useSystemStore = defineStore("system", {
  state: () => ({
    data: <SystemResponse>{},
    realtime: <RealtimeSystemResponse>{},
    connection: <WebSocket | null> null,
    ready: false,
  }),
  actions: {
    async connect({websocket = false}: {websocket: boolean}) {
      const loader = useLoadingStore();
      const http = inject(httpInjectionSymbol, new HttpMaker);

      loader.setMessage('Connecting to monitor, please wait...')
      http.get("system").then((response) => {
        const { data }: { data: SystemResponse } = response.data;
        this.staticUpdate(data)
        if (websocket) {
          this.websocket()
        }
        loader.toggle(true)
      }).catch(() => {
        loader.setError('An unexpected error has occurred')
      });
    },
    async websocket() {
      const client = await fetch('http://192.168.1.100:4200', {
        method: 'POST',
        body: JSON.stringify({ connection: 'monitor' })
      })
    
      const worker = await client.json()
      const url = `ws://192.168.1.100:4200/ws?id=${worker.id}`
      
      this.connection = this.connection ?? new WebSocket(url)
      this.connection.onopen = () => {
        console.log('Connected to websocket')
        this.ready = true
      }
      this.connection.onmessage = (response) => {
        try {
          const data = (JSON.parse(response.data) as RealtimeSystemResponse)
          this.liveUpdate(data)
        } catch (error) {
          console.log({error})
        }
      }
      this.connection.onclose = () => {
        this.ready = false
        this.connection = null
      }
    },
    staticUpdate(data: SystemResponse) {
      this.$patch({data})
    },
    liveUpdate(realtime: RealtimeSystemResponse) {
      this.$patch({realtime})
    }
  },
});
