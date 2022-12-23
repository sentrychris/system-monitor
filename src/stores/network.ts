import { defineStore } from "pinia";
import { inject } from "vue";
import { useLoadingStore } from "./loading";
import { http } from "@/plugins/http";
import type {
  NetworkResponse,
  WifiResponse,
  WifiSpeedtestResponse,
} from "@/interfaces/NetworkResponse";
import type { WifiMetric } from "@/interfaces/types/NetworkTypes";

export const useNetworkStore = defineStore("network", {
  state: () => ({
    data: <NetworkResponse>{},
    wifi: <WifiResponse>{},
    speed: <WifiSpeedtestResponse>{
      ping: "",
      download: "",
      upload: "",
    },
    speedtestInProgress: false,
  }),
  actions: {
    async get({ wifi = false }: { wifi: boolean }) {
      const loader = useLoadingStore();
      loader.setMessage("Retrieving network information...");

      http
        .get("network")
        .then(async (response) => {
          const { data }: { data: NetworkResponse } = response.data;
          this.updateNetwork(data);
          setTimeout(() => {
            loader.toggle(true);
          }, 1000);

          if (wifi) {
            const response = await http.get("network/wifi");
            const { data }: { data: WifiResponse } = response.data;
            this.updateWifi(data);
          }
        })
        .catch(() => {
          loader.setError("An unexpected error has occurred");
        });
    },
    async speedtest({timeout = false}: {timeout: boolean}) {
      this.speedtestInProgress = true;
      
      const request = () => {
        const waiting = (metric: WifiMetric) => {
          let up = true;
          return setInterval(() => {
            if (up) {
              this.speed[metric] += ".";
            } else {
              this.speed[metric] = this.speed[metric].substring(
                1,
                this.speed[metric].length
              );
              if (this.speed[metric] === ".") {
                up = true;
              }
            }
            if (this.speed[metric].length > 6) {
              up = false;
            }
          }, 100);
        };

        const progress: {
          [key in WifiMetric]: ReturnType<typeof setInterval> | null;
        } = {
          ping: null,
          download: null,
          upload: null,
        };
  
        for (const key in this.speed) {
          const metric = <WifiMetric>key;
          progress[metric] = waiting(metric);
        }

        http.get("network/wifi/speed").then((response) => {
          const { data }: { data: WifiSpeedtestResponse } = response.data;
          for (const key in this.speed) {
            const metric = <WifiMetric>key;
            if (progress[metric]) {
              clearInterval((<ReturnType<typeof setInterval>>progress[metric]));
            }
            this.speed[metric] = data[metric];
          }
  
          this.speedtestInProgress = false;
        });
      }

      if (timeout) {
        setTimeout(() => request(), 5000)
      } else {
        request()
      }
    },
    updateNetwork(data: NetworkResponse) {
      this.$patch({ data });
    },
    updateWifi(wifi: WifiResponse) {
      this.$patch({ wifi });
    },
    updateSpeedTest(speed: WifiSpeedtestResponse) {
      this.$patch({ speed });
    },
  },
});
