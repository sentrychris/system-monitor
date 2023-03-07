import { defineStore } from "pinia";

const body = <HTMLBodyElement>document.querySelector("body");

export const useThemeStore = defineStore("theme", {
  state: () => ({
    body,
    theme: <string | null>null,
    active: body.dataset.theme,
  }),
  actions: {
    load() {
      const theme = this.theme ?? "light";
      this.body.dataset.theme = theme;

      this.theme = theme;
      this.active = this.getActiveTheme();
    },
    toggle() {
      this.theme = this.theme === "light" ? "dark" : "light";
      this.body.dataset.theme = this.theme;
      this.active = this.getActiveTheme();
    },
    getActiveTheme() {
      return this.body.dataset.theme;
    },
  },
  persist: {
    storage: localStorage,
    paths: ["theme", "active"],
  },
});
