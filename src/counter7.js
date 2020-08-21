// @flow strict
import * as E from "./elm_pith";
const { dispose, action, elm, makeElementPith } = E;
function act(
  name: string,
  b: ((E.O) => void, Element, Event) => void
): E.Oaction {
  return action((o, elm) => {
    const l = (e: Event) => b.call(this, o, elm, e);
    elm.addEventListener(name, l);
    return () => {
      console.log("d", l);
      elm.removeEventListener(name, l);
    };
  });
}

// prettier-ignore
function counter(o, e, depth = 9): void {
  o(elm("button", (o) => {
    o("+");
    if (depth > 0)
      o(elm("div", (o, e) => counter(o, e, depth - 1)));
  }));
  o(depth + "");
}
const root = (document.body = document.createElement("body"));

var state = { n: 369 };

const o = makeElementPith(root);

o(counter);

Object.assign(window, {
  o,
  act,
  action,
  elm,
  dispose,
  makeElementPith,
  c: counter,
});
