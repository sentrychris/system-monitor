import { defineStore } from "pinia";
import { inject } from "vue";
import { useLoadingStore } from "./loading";
import { HttpMaker } from "@/plugins/http";
import { httpInjectionSymbol } from "@/injection";
import type {
  NetworkResponse,
  WifiResponse,
  WifiSpeedtestResponse,
} from "@/interfaces/NetworkResponse";
import type { WifiMetric } from "@/interfaces/NetworkInformation";

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
      const http = inject(httpInjectionSymbol, new HttpMaker());

      loader.setMessage("Requesting new monitor connection...");
      http
        .get("network")
        .then(async (response) => {
          const { data }: { data: NetworkResponse } = response.data;
          this.updateNetwork(data);

          if (wifi) {
            const response = await http.get("network/wifi");
            const { data }: { data: WifiResponse } = response.data;
            this.updateWifi(data);
          }

          loader.toggle(true);
        })
        .catch(() => {
          loader.setError("An unexpected error has occurred");
        });
    },
    async speedtest() {
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

      this.speedtestInProgress = true;

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

      const http = new HttpMaker(); // TODO figure out why inject does not work here... it works above...
      http.get("network/wifi/speed").then((response) => {
        const { data }: { data: WifiSpeedtestResponse } = response.data;
        for (const key in this.speed) {
          const metric = <WifiMetric>key;
          if (progress[metric]) {
            //@ts-ignore the frustration is so damn real
            clearInterval(progress[metric]);
          }
          this.speed[metric] = data[metric];
        }

        this.speedtestInProgress = false;
      });
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
