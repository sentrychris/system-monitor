import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StatCard from "../../stats/StatCard.vue";

describe("StatCard", () => {
  const testProps = {
    title: 'Lorem Ipsum',
    bg: 'dark',
    loading: false,
  }

  const getWrapper = () => mount(StatCard, {
    props: testProps
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
