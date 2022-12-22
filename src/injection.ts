import type { InjectionKey } from "vue";
import type { HttpMaker } from "./plugins/http";
import type { WebsocketMaker } from "./plugins/websocket";

export const httpInjectionSymbol: InjectionKey<HttpMaker> = Symbol("http");
export const websocketInjectionSymbol: InjectionKey<WebsocketMaker> = Symbol("websocket");