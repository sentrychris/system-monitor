import { defineStore } from "pinia";

const body = <HTMLBodyElement>document.querySelector("body");

export const useThemeStore = defineStore("theme", {
  state: () => ({
    body,
    theme: "",
    active: body.dataset.theme,
  }),
  actions: {
    toggle() {
      this.theme = this.theme === "light" ? "dark" : "light";
      body.dataset.theme = this.theme;

      this.active = this.getActiveTheme();
    },
    getActiveTheme() {
      return body.dataset.theme;
    },
  },
});
