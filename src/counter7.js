// @flow strict
import * as E from "./elm_pith";
const { dispose, action, elm, ext, makeElementPith } = E;
function act<S>(
  name: string,
  b: ((E.O<S>) => void, Element, Event) => void
): E.Oaction<S> {
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
    //
  })))
  // o(on((o, a) => {
  //   o(function ({ n }) {
  //     return { n: n + a };
  //   });
  //   counter(o, depth)
  // }));
  o(elm("button", (o) => {
    o("+");
    o(act("click", (o, elm, e) => {
      e.preventDefault();
      //o(E.a(1));
    }));
    if (depth > 0)
      o(elm("div", ext("+", { n: 0 }, (o) => counter(o, depth - 1))));
    o();
  }));
  o(function (s) {
    o(s.n + "");
    return s;
  });
  o();
}
const root = (document.body = document.createElement("body"));

var state = { n: 369 };

const o = makeElementPith<{| n: number |}, *>((r) => {
  if (typeof r === "function") {
    state = r(state);
  } else {
    console.log("A", r.a);
  }
}, root);

counter(o);

Object.assign(window, {
  o,
  act,
  action,
  ext: E.ext,
  elm,
  dispose,
  makeElementPith,
  c: counter,
});
