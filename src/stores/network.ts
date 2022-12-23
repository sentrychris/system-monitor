import { defineStore } from "pinia";
import { inject } from "vue";
import { useLoadingStore } from "./loading";
import { HttpMaker } from "@/plugins/http";
import { httpInjectionSymbol } from "@/injection";
import type {
  NetworkResponse,
  WifiResponse
} from "@/interfaces/NetworkResponse";

export const useNetworkStore = defineStore("network", {
  state: () => ({
    data: <NetworkResponse>{},
    wifi: <WifiResponse>{}
  }),
  actions: {
    async get({ wifi = false }: { wifi: boolean }) {
      const loader = useLoadingStore();
      const http = inject(httpInjectionSymbol, new HttpMaker());

      loader.setMessage("Requesting new monitor connection...");
      http
        .get("network")
        .then(async (response) => {
          const { data }: { data: NetworkResponse } = response.data;
          this.updateNetwork(data);

          if (wifi) {
            const response = await http.get("network/wifi")
            const { data }: { data: WifiResponse } = response.data
            this.updateWifi(data)
          }

          loader.toggle(true);
        })
        .catch(() => {
          loader.setError("An unexpected error has occurred");
        });
    },
    updateNetwork(data: NetworkResponse) {
      this.$patch({ data });
    },
    updateWifi(wifi: WifiResponse) {
      this.$patch({ wifi });
    }
  },
});
