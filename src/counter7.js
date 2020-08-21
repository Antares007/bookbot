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

function counter(o, e, i = 0): void {
  element("button", (o, elm) => {
    const listener = ((i) => (e: MouseEvent) => {
      o(i + "");
    })(i);
    elm.addEventListener("click", listener);
    dispose(elm.removeEventListener.bind(elm, "click", listener))(o);
    o("+" + i);
    if (i > 0) element("div", (...args) => counter(...args, i - 1))(o);
  })(o);
}
const root = (document.body = document.createElement("body"));

var state = { n: 369 };

const o = makeElementPith(root);

o(counter);

Object.assign(window, {
  o,
  dispose,
  makeElementPith,
  c: counter,
});
