import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
  state: () => ({
    loaded: false,
    error: false,
    message: ''
  }),
  actions: {
    toggle(value: boolean) {
      this.loaded = value;
    },
    setError(message?: string) {
      this.error = true
      if (message) {
        this.setMessage(message)
      }
    },
    setMessage(value: string) {
      this.message = value;
    }
  },
});
