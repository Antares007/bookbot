// @flow strict
import * as E from "./E3";

const C = (d: number = 2) =>
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

const o = E.pith((document.body = document.createElement("body")));
var state = { n: 0 };
const b = (nar) =>
  E.bark(o)(
    E.rring(function reduce(r) {
      const newstate = r(state);
      if (newstate !== state) {
        state = newstate;
        console.info(state);
      }
    })(nar)
  );
const ds = [0, 2, 2, 2, 3, 0];
setTimeout(function fib() {
  b(C(ds.shift()));
  ds.length && setTimeout(fib, 16.6);
}, 1000);
Object.assign(window, { o, b, C, E });
