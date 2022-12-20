import type { InjectionKey } from "vue";
import type { HttpMaker } from "./plugins/http";
import type { ChartMaker } from "./plugins/chart";

export const httpInjectionSymbol: InjectionKey<HttpMaker> = Symbol("http");
export const chartInjectionSymbol: InjectionKey<ChartMaker> = Symbol("chart");
