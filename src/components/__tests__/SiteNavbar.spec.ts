import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SiteNavbar from "../SiteNavbar.vue";

describe("SiteNavbar", () => {
  const getWrapper = () =>
    mount(SiteNavbar, {
      global: {
        stubs: {
          "router-link": { template: "<div/>" },
        },
      },
    });

  it("renders properly", () => {
    const testSubject = getWrapper();

    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.text()).toContain("Pi Monitor");
  });
});
