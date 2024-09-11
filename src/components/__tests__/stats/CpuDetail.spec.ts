import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CpuDetail from "../../stats/CpuDetail.vue";

describe("CpuDetail", () => {
  const testProps = {
    detail: {
      temp: 25,
      usage: 15,
      freq: 1500,
    },
  };

  const getWrapper = () =>
    mount(CpuDetail, {
      props: testProps,
    });

  it("renders properly", () => {
    const testHtml =
      `<p class="small"><strong>Usage:</strong> ${testProps.detail.usage} %</p>\n` +
      `<p class="small"><strong>Freq:</strong> ${testProps.detail.freq} MHz</p>\n`;

    const testSubject = getWrapper();

    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.props()).toEqual(testProps);
    expect(testSubject.html()).toContain(testHtml);
  });
});
