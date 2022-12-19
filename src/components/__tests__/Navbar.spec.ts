import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Navbar from "../Navbar.vue";

describe("Navbar", () => {
  const getWrapper = () => mount(Navbar, {
    global: {
      stubs: {
        'router-link': { template: '<div/>' },
      },
    },
  });

  it("renders properly", () => {
    const testSubject = getWrapper();
    
    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.text()).toContain("Pi Monitor");
  });
});
