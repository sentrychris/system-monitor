import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StatCard from "../StatCard.vue";

describe("StatCard", () => {
  const getWrapper = () => mount(StatCard, {
    props: {
      title: 'Lorem Ipsum',
      bg: 'dark'
    }
  });
  
  it("renders properly", () => {
    const testSubject = getWrapper();
    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.text()).toContain("Lorem Ipsum");
    expect(testSubject.classes()).toContain("bg-dark");
    expect(testSubject.classes()).toContain("text-white");
  });
});
