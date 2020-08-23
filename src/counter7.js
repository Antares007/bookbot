// @flow strict
import * as E from "./elm_pith";
import type { O, P, N, N1 } from "./elm_pith";
const { dispose, element, makeElementPith, cbn } = E;
function button(nar: N<O>, n: number): N<O | number> {
  return (op) => {
    element("button", (o, elm) => {
      const listener = () => op(n);
      elm.addEventListener("click", listener);
      dispose(() => elm.removeEventListener("click", listener))(o);
      nar(o);
    })(op);
  };
}

function C(depth: number): N<O> {
  var n = 0;
  var op;
  return (ob) =>
    element(
      "div",
      (o) => {
        const on = cbn((x) => {
          n += x;
          op((o) => o(n + ""));
        })(o);
        button((o) => {
          o("+");
          depth > 0 && C(depth - 1)(o);
        }, 1)(on);
        button((o) => {
          o("-");
          depth > 0 && C(depth - 1)(o);
        }, -1)(on);
        element("div", (o) => {
          op = o;
          o(n + "");
        })(o);
      },
      "C" + depth
    )(ob);
}
const o = makeElementPith((document.body = document.createElement("body")));
o((o) => C(1)(cbn((x) => console.log(x))(o)));
Object.assign(window, {
  o,
  element,
  dispose,
  makeElementPith,
  C,
});
