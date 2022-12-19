import type { InjectionKey } from "vue";
import type { Http } from "./http";
import type { ChartMaker } from "./chart";

export const httpInjectionSymbol: InjectionKey<Http> = Symbol('http');
export const chartInjectionSymbol: InjectionKey<ChartMaker> = Symbol('chart');