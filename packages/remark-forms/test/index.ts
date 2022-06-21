import {remark} from "remark"
import {remarkForms} from "../src"


test("remarkForms()", () => {
  expect(() => {
    remark().use(remarkForms).freeze()
  }).not.toThrowError();
});


test("snapshots", (t) => {
  // TODO ...
});
