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

export function pmap<O, P>(
  f: ((P) => void) => (O) => void,
  o: ((O) => void) => void
): ((P) => void) => void {
  return (p) => o(f(p));
}
// prettier-ignore
function counter(o, depth = 1): void {
  o(elm("button", pmap(o => p => {
    if(typeof p === 'number') {
      o(p + '<-number')
    } else {
      o(p);
    }
  }, (o) => {
    o(1)
    o('')
    o()
  })))
  o(elm("button", (o) => {
    o("+");
    o(act("click", (o, elm, e) => {
      e.preventDefault();
      //o(E.a(1));
    }));
    if (depth > 0)
      o(elm("div", (o) => counter(o, depth - 1)));
    o();
  }));
  o(0 + "");
  o();
}
const root = (document.body = document.createElement("body"));

var state = { n: 369 };

const o = makeElementPith(root);

counter(o);

Object.assign(window, {
  o,
  act,
  action,
  elm,
  dispose,
  makeElementPith,
  c: counter,
});
