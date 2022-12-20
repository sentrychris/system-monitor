import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
  state: () => ({ status: true }),
  actions: {
    toggle(value: boolean) {
      this.status = value;
    },
  },
});
