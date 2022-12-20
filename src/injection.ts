import type { InjectionKey } from "vue";
import type { HttpMaker } from "./plugins/http";
import type { WebsocketMaker } from "./plugins/websocket";
import type { ChartMaker } from "./plugins/chart";

export const httpInjectionSymbol: InjectionKey<HttpMaker> = Symbol("http");
export const websocketInjectionSymbol: InjectionKey<WebsocketMaker> = Symbol("websocket");
export const chartInjectionSymbol: InjectionKey<ChartMaker> = Symbol("chart");
