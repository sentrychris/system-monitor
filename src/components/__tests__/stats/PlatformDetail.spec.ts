import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PlatformDetail from "../../stats/PlatformDetail.vue";

describe("PlatformDetail", () => {
  const testProps = {
    detail: {
      distro: "distribution info",
      kernel: "here is the kernel",
      uptime: "test the uptime pls",
    },
  };

  const getWrapper = () =>
    mount(PlatformDetail, {
      props: testProps,
    });

  it("renders properly", () => {
    const testHtml =
      `<p class="small"><strong>OS</strong> ${testProps.detail.distro}</p>\n` +
      `<p class="small"><strong>Kernel</strong> ${testProps.detail.kernel}</p>\n` +
      `<p class="small"><strong>Uptime</strong> ${testProps.detail.uptime}</p>`;

    const testSubject = getWrapper();

    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.props()).toEqual(testProps);
    expect(testSubject.html()).toEqual(testHtml);
  });
});
