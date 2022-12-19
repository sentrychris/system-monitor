import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CpuDetail from "../../stats/CpuDetail.vue";

describe("CpuDetail", () => {
  const testProps = {
    detail: {
      temp: 25,
      usage: 15,
      freq: 1500
    }
  }
  
  const getWrapper = () => mount(CpuDetail, {
    props: testProps
  });
  
  it("renders properly", () => {
    const testHtml = `<p><strong>Temp</strong> ${testProps.detail.temp}</p>\n` +
      `<p><strong>Usage</strong> ${testProps.detail.usage}</p>\n` +
      `<p><strong>Frequency</strong> ${testProps.detail.freq}</p>`;
    
    const testSubject = getWrapper();
    
    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.props()).toEqual(testProps);
    expect(testSubject.html()).toEqual(testHtml);
  });
});
