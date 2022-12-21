import type { SystemResponse, RealtimeSystemResponse } from "@/interfaces/SystemResponse";
import { defineStore } from "pinia";
import { useLoadingStore } from "./loading";

export const useSystemStore = defineStore("system", {
  state: () => ({
    data: <SystemResponse>{},
    realtime: <RealtimeSystemResponse>{},
    connection: <WebSocket | null> null,
    ready: false,
  }),
  actions: {
    async connect() {
      const loader = useLoadingStore()

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
        loader.toggle(true)
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
