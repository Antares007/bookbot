// @flow strict
import * as E from "./elm_pith";
import type { O, P, N, N1 } from "./elm_pith";
const { dispose, element, makeElementPith, cbn } = E;
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
        const ss = cbn((x) => {
          n += x;
          op((o) => o(n + ""));
        })(o);
        button((o) => o("1"), 1)(ss);
        button((o) => o("-1"), -1)(ss);
        button((o) => o("-2"), -2)(ss);
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
