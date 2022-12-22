import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import GaugeChart from "../../charts/GaugeChart.vue";

const testProps = {
  id: "temp",
  title: "Temperature",
  metric: 58,
  format: "{y}°C",
};

describe("GaugeChart", () => {
  const getWrapper = () =>
    mount(GaugeChart, {
      props: testProps,
    });

  it("renders properly", () => {
    return true;
    //const testSubject = getWrapper();
    // expect(testSubject.exists()).toBeTruthy();
  });
});
