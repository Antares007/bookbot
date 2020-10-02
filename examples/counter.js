// @flow strict
import type { N } from "../src/purry";
const element = require("../src/element");

module.exports = (depth: number = 2): N<element.r_pith_t<{}>> => {
  return element.mmap("counter" + depth, { n: 9 })((o) => {
    return o.element(
      "div",
      (function rec(depth) {
        const dt = (dt) => (e, b) =>
          b((o) => {
            o.reduce((s) => ({ ...s, n: s.n + dt }));
            mainNar(o);
          });
        return mainNar;
        function mainNar(o) {
          o.element("button", (o) => {
            o.text("+");
            o.on("click", dt(+1));
            depth &&
              o.element(
                "div",
                element.mmap("+", { n: 0 })(rec(depth - 1)),
                "plus" + depth
              );
          });
          o.element("button", (o) => {
            o.text("-");
            o.on("click", dt(-1));
            depth &&
              o.element(
                "div",
                element.mmap("-", { n: 0 })(rec(depth - 1)),
                "minus" + depth
              );
          });
          o.reduce((s) => (o.text(s.n + ""), s));
        }
      })(depth)
    );
  });
};
