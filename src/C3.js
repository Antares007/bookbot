// @flow strict
import type { N } from "./p";
import * as E from "./E3";

export const C = (d: number = 2): N<E.r_pith_t<{| n: number |}>> =>
  function Cnar(o: E.r_pith_t<{| n: number |}>) {
    return o.element("div", function mainNar(o) {
      const b = E.bark(o);
      o.element(
        "button",
        function plusButtonNar(o) {
          o.text("+");
          o.on("click", () => {
            o.reduce((s) => ({ ...s, n: s.n + 1 })), b(mainNar);
          });
          d && E.mmap("+", { n: 0 })(C(d - 1))(o);
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
          d && E.mmap("-", { n: 0 })(C(d - 1))(o);
        },
        "minus" + d
      );
      o.reduce((s) => (o.text(s.n + ""), s));
    });
  };
