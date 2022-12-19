import { describe, vi, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DonutChart from "../../charts/DonutChart.vue";
import { httpInjectionSymbol } from "@/injection";

describe("DonutChart", () => {
  const testProps = {
    label: 'CPU',
    data: 30,
  }
  
  const getWrapper = () => mount(DonutChart, {
    global: {
      provide: {
        'chart': vi.fn
      },
    },
    props: testProps
  });
  
  it("renders properly", () => { 
    const testSubject = getWrapper();
    
    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.props()).toEqual(testProps);
  });
});
