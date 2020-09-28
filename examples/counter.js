// @flow strict
import type { N } from "../src/purry";
const element = require("../src/element");

module.exports = function C(
  d: number = 2
): N<element.r_pith_t<{| n: number |}>> {
  return function Cnar(o: element.r_pith_t<{| n: number |}>) {
    return o.element("div", function mainNar(o) {
      const b = (nar) => (nar(o), o.end());
      o.element(
        "button",
        function plusButtonNar(o) {
          o.text("+");
          o.on("click", () => {
            o.reduce((s) => ({ ...s, n: s.n + 1 })), b(mainNar);
          });
          d && element.mmap("+", { n: 0 })(C(d - 1))(o);
        },
        "plus" + d
      );
      o.element(
        "button",
        function minusButtonNar(o) {
          o.text("-");
          o.on("click", () => {
            o.reduce((s) => ({ ...s, n: s.n - 1 })), b(mainNar);
          });
          d && element.mmap("-", { n: 0 })(C(d - 1))(o);
        },
        "minus" + d
      );
      o.reduce((s) => (o.text(s.n + ""), s));
    });
  };
};
