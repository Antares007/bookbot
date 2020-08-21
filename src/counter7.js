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
var i = 9;
function counter(o, e): void {
  button("+", (e) => {
    i++;
    o(counter);
  })(o);
  o(i + "");
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
