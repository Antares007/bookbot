// @flow strict
import { static_cast } from "./static_cast.js";
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
type Relement<S = *> = {|
  _: "relm",
  v: {
    tag: string,
    key?: string,
    nar: N1<O | Relement<S> | R<S>, Element>,
  },
|};
type R<S = *> = {| _: "r", v: (S) => S |};
function relement<S>(
  tag: string,
  nar: N1<O | Relement<S> | R<S>, Element>,
  key?: string
): N<Relement<S>> {
  const relm = {
    _: "relm",
    v: {
      tag,
      key,
      nar,
    },
  };
  return (o) => o(relm);
}

function reduce<S>(v: (S) => S): N<R<S>> {
  const r = { _: "r", v };
  return (o) => o(r);
}

function C(
  depth: number = 0,
  key: string = "C",
  init: {| n: number |} = { n: 9 }
): N<O | Relement<> | R<>> {
  var n = 0;
  var op;
  return relement(
    "div",
    (o) => {
      // const on = cbn((x) => {
      //   op((o) => {
      //     reduce((s) => {
      //       return { n: s.n + x };
      //     })(o);
      //     reduce((s) => {
      //       o(s.n + "");
      //       return s;
      //     })(o);
      //   });
      // })(o);

      // button((o) => {
      //   o("+");
      //   depth > 0 && C(depth - 1, key, init)(cbr(ob)(o));
      // }, 1)(on);

      relement("div", (o) => {
        op = o;
        reduce((s) => {
          o(s.n + "");
          return s;
        })(o);
      })(o);
    },
    "C" + depth
  );
}
var state = { n: 9 };
const o = cbr((r) => {
  state = r.v(state);
})(makeElementPith((document.body = document.createElement("body"))));

const addstate = ring((r) => {
  state = r.v(state);
});
o(addstate(C(1)));

Object.assign(window, {
  o,
  element,
  dispose,
  makeElementPith,
  C,
});
function cbr<S>(or: P<R<S>>): (P<O>) => P<O | R<S>> {
  return (o) => (x) =>
    x && typeof x === "object" && x._ === "r" ? or(x) : o(x);
}
function rmap<A: { ... }, B>(key: string, b: B): (P<R<A> | O>) => P<R<B> | O> {
  return (o) => (x) => {
    if (x && typeof x === "object" && x._ === "r")
      reduce((a) => {
        const ob = a[key] || b;
        const nb = x.v(ob);
        if (ob === nb) return a;
        return { ...a, [key]: nb };
      })(o);
    else o(x);
  };
}
function ring<S>(or: P<R<S>>): (N<O | Relement<S> | R<S>>) => N<O> {
  return (nar) => (o) => {
    nar(function (x) {
      if (x == null || typeof x !== "object") {
        o(x);
      } else if (x._ === "r") {
        or(x);
      } else if (x._ === "relm") {
        element(
          x.v.tag,
          (o, elm) => ring(or)((o) => x.v.nar(o, elm))(o),
          x.v.key
        )(o);
      } else {
        o(x);
      }
    });
  };
}
