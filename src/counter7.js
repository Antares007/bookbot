// @flow strict
import * as E from "./elm_pith";
import type { O, P, N, N1 } from "./elm_pith";
const { dispose, element, makeElementPith, cb } = E;
function button(nar: N<O>, n: number): N<O | number> {
  return (op) => {
    element("button", (o, elm) => {
      const listener = (e: MouseEvent) => {
        op(n);
      };
      elm.addEventListener("click", listener);
      dispose(() => elm.removeEventListener("click", listener))(o);
      nar(o);
    })(op);
  };
}

function C(i: number): N<O> {
  var n = 0;
  var op;
  return (ob) =>
    element(
      "div",
      (o) => {
        const xxx = cb<O, number>(
          (x) => x == null,
          (x) => {}
        );
        button((o) => {
          o("+");
          if (i > 0) C(i - 1)(o);
        }, 1)((x) => (typeof x === "number" ? void 0 : o(x)));
        element("div", (o) => {
          op = o;
          o(n + "");
        })(o);
      },
      "C" + i
    )(ob);
}
const o = makeElementPith((document.body = document.createElement("body")));
o((o) => C(1)((x) => (typeof x === "number" ? console.log(x) : o(x))));
Object.assign(window, {
  o,
  element,
  dispose,
  makeElementPith,
  C,
});
