import { defineStore } from "pinia";

const body = <HTMLBodyElement>document.querySelector("body");

export const useThemeStore = defineStore("theme", {
  state: () => ({
    body,
    theme: "",
    active: body.dataset.theme,
  }),
  actions: {
    load() {
      this.body.dataset.theme = this.theme;
    },
    toggle() {
      this.theme = this.theme === "light" ? "dark" : "light";
      this.body.dataset.theme = this.theme;
      this.active = this.getActiveTheme();
    },
    getActiveTheme() {
      return body.dataset.theme;
    },
  },
  persist: {
    storage: localStorage,
    paths: ["theme", "active"],
  },
});
