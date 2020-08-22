// @flow strict
import * as E from "./elm_pith";
import type { O, P, N, N1 } from "./elm_pith";
const { dispose, element, makeElementPith } = E;

function C(i: number): N<O | number> {
  var n = 0;
  var op;
  return (ob) =>
    element(
      "div",
      (o) => {
        element("button", (o, elm) => {
          const listener = (e: MouseEvent) => {
            ob(1);
            n++;
            op((o) => o(n + ""));
          };
          elm.addEventListener("click", listener);
          dispose(() => elm.removeEventListener("click", listener))(o);
          o("+");
          if (i > 0) C(i - 1)((x) => (typeof x === "number" ? ob(x) : o(x)));
        })(o);
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
