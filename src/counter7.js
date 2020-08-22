// @flow strict
import * as E from "./elm_pith";
const { dispose, element, makeElementPith } = E;

const C = (i: number) => {
  var n = 0;
  var op;
  return element(
    "div",
    (o) => {
      element("button", (o, elm) => {
        const listener = (e: MouseEvent) => {
          n++;
          op((o) => o(n + ""));
        };
        elm.addEventListener("click", listener);
        dispose(() => elm.removeEventListener("click", listener))(o);
        o("+");
        if (i > 0) C(i - 1)(o);
      })(o);
      element("button", (o, elm) => {
        const listener = (e: MouseEvent) => {
          n--;
          op((o) => o(n + ""));
        };
        elm.addEventListener("click", listener);
        dispose(() => elm.removeEventListener("click", listener))(o);
        o("-");
        if (i > 0) C(i - 1)(o);
      })(o);
      element("div", (o) => {
        op = o;
        o(n + "");
      })(o);
    },
    "C" + i
  );
};
const o = makeElementPith((document.body = document.createElement("body")));
o(C(1));
Object.assign(window, {
  o,
  element,
  dispose,
  makeElementPith,
  C,
});
