import type { InjectionKey } from "vue";
import type { Http } from "./http";

export const httpInjectionSymbol: InjectionKey<Http> = Symbol('http');