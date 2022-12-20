import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataTable from "../DataTable.vue";

describe("DataTable", () => {
  const testProps = {
    type: "horizontal",
    nested: false,
    data: [
      {
        pid: 634,
        username: "root",
        name: "Xorg",
        mem: 71.37,
      },
      {
        pid: 1493,
        username: "pi",
        name: "node",
        mem: 63.8,
      },
    ],
  };

  const getWrapper = () =>
    mount(DataTable, {
      props: testProps,
      global: {
        stubs: ["FontAwesomeIcon"],
      },
    });

  it("renders properly", () => {
    const testSubject = getWrapper();

    expect(testSubject.exists()).toBeTruthy();
    expect(testSubject.props()).toEqual(testProps);
    expect(testSubject.html()).toContain(`Pid</th>`);
    expect(testSubject.html()).toContain(`<td>634</td>`);
    expect(testSubject.html()).toContain(`Username</th>`);
    expect(testSubject.html()).toContain(`<td>pi</td>`);
    expect(testSubject.html()).toContain(`Name</th>`);
    expect(testSubject.html()).toContain(`<td>Xorg</td>`);
    expect(testSubject.html()).toContain(`Mem</th>`);
    expect(testSubject.html()).toContain(`<td>63.8</td>`);
  });
});
