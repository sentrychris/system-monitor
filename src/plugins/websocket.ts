import type { App } from "vue";
import { websocketInjectionSymbol } from "@/injection";

enum StatusCode {
  ClosedNormal = 1000,
  ClosedProtocolError = 1002,
  ClosedNoStatus = 1005,
  ServerError = 1011,
  BadGateway = 1014,
  HandshakeFailed = 1015,
}

export class WebsocketMaker {
  private instance: WebSocket | null = null;
  
  private get websocket(): WebSocket {
    return this.instance != null
    ? this.instance
    : this.init();
  }
  
  init() {
    const websocket = new WebSocket('ws://192.168.1.100:4200/ws');

    // Logic

    this.instance = websocket;
     
    return websocket;
  }
}

const websocket = new WebsocketMaker;

export const useWebsocket = {
  install(app: App) {
    app.provide(websocketInjectionSymbol, websocket)
  }
}