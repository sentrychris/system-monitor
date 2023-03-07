import { defineStore } from "pinia";

const body = <HTMLBodyElement>document.querySelector('body');

const getActiveTheme = () => {
  return body.dataset.theme;
}

export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: '',
    active: getActiveTheme(),
  }),
  actions: {
    toggle() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      body.dataset.theme = this.theme;
      
      this.active = getActiveTheme();
    },
  },
});
