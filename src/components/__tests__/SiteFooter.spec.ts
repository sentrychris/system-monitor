import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SiteFooter from "../SiteFooter.vue";

describe("SiteFooter", () => {
  const getWrapper = () =>
    mount(SiteFooter, {
      global: {
        stubs: {
          "router-link": { template: "<div/>" },
        },
      },
    });

  it("renders properly", () => {
    const testSubject = getWrapper();

    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.text()).toContain(
      "Copyright © Chris Rowles 2022. All Rights Reserved."
    );
  });
});
