// @flow strict
import * as E from "./elm_pith";
const { dispose, element, makeElementPith } = E;
function button(label, listener: (e: MouseEvent) => void) {
  return element("button", (o, elm) => {
    o(label);
    elm.addEventListener("click", listener);
    dispose(elm.removeEventListener.bind(elm, "click", listener))(o);
  });
}
const C = (i: number) => {
  var n = 0;
  var op;
  return element(
    "div",
    (o) => {
      element("button", (o, elm) => {
        const listener = ((i) => (e: MouseEvent) => {
          n++;
          op((o) => {
            o(n + "");
          });
        })(i);
        elm.addEventListener("click", listener);
        dispose(elm.removeEventListener.bind(elm, "click", listener))(o);
        o("+");
        if (i > 0) C(i - 1)(o);
      })(o);
      element("button", (o, elm) => {
        const listener = ((i) => (e: MouseEvent) => {
          n--;
          op((o) => {
            o(n + "");
          });
        })(i);
        elm.addEventListener("click", listener);
        dispose(elm.removeEventListener.bind(elm, "click", listener))(o);
        o("-");
        if (i > 0) C(i - 1)(o);
      })(o);
      element("div", (o) => {
        op = o;
        o(n + "");
      })(o);
    },
    i + ""
  );
};
const o = makeElementPith((document.body = document.createElement("body")));
o(C(1));
Object.assign(window, {
  o,
  dispose,
  makeElementPith,
  C,
});
