import { describe, it, vi, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import StatCard from "../../stats/StatCard.vue";

describe("StatCard", () => {
  const testProps = {
    title: "Lorem Ipsum",
    icon: "fa-solid fa-server",
    bg: "dark",
  };

  const getWrapper = () =>
    mount(StatCard, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
        stubs: ["FontAwesomeIcon"],
      },
      props: testProps,
    });

  it("renders properly", () => {
    const testSubject = getWrapper();

    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.props()).toEqual(testProps);
    expect(testSubject.text()).toContain("Lorem Ipsum");
    expect(testSubject.classes()).toContain("bg-dark");
    expect(testSubject.classes()).toContain("text-white");
  });
});
