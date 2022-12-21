import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PageHeader from "../PageHeader.vue";

const testProps = {
  decorTitle: "Lorem ipsum",
  title: "Dolor sit amet",
};

describe("PageHeader", () => {
  const getWrapper = () =>
    mount(PageHeader, {
      props: testProps,
    });

  it("renders properly", () => {
    const testSubject = getWrapper();

    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.props()).toEqual(testProps);
    expect(testSubject.html()).toContain(
      `<p class="text-muted decor small">${testProps.decorTitle}</p>`
    );
    expect(testSubject.html()).toContain(
      `<h1 class="header">${testProps.title}</h1>`
    );
  });
});
