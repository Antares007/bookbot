// @flow strict
import { static_cast } from "./static_cast.js";
import * as E from "./elm_pith";
import type { O, P, N, N1 } from "./elm_pith";
const { dispose, element, makeElementPith, cbn } = E;
function button<S, T>(nar: N<ORA<S, T>>, n: T): N<Relement<S, T>> {
  return relement("button", (o, elm) => {
    const listener = () => action(n)(o);
    elm.addEventListener("click", listener);
    dispose(() => elm.removeEventListener("click", listener))(o);
    nar(o);
  });
}
type Relement<S = *, T = *> = {|
  _: "relm",
  v: {
    tag: string,
    key?: string,
    nar: N1<ORA<S, T>, Element>,
  },
|};
type ORA<S = *, T = *> = O | Relement<S> | R<S> | A<T>;
type A<T> = {| _: "a", v: T |};
type R<S = *> = {| _: "r", v: (S) => S |};

function action<T>(v: T): N<A<T>> {
  const a = { _: "a", v };
  return (o) => o(a);
}
function relement<S, T>(
  tag: string,
  nar: N1<ORA<S, T>, Element>,
  key?: string
): N<Relement<S, T>> {
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
): N<ORA<{| n: number |}, *>> {
  var n = 0;
  var op;
  return relement(
    "div",
    (o) => {
      button((o) => {
        o("+");
        depth > 0 && C(depth - 1, key, init)(o);
      }, 1)(o);
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
const o = makeElementPith((document.body = document.createElement("body")));

const addstate = ring(
  (r) => {
    state = r.v(state);
  },
  (a) => console.log(a)
);
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
function ring<S, T>(or: P<R<S>>, oa: P<A<T>>): (N<ORA<S, T>>) => N<O> {
  return (nar) => (o) => {
    nar(function pith(x) {
      if (x == null || typeof x !== "object") {
        o(x);
      } else if (x._ === "a") {
        oa(x);
      } else if (x._ === "r") {
        or(x);
      } else if (x._ === "relm") {
        element(
          x.v.tag,
          (o, elm) => ring(or, oa)((o) => x.v.nar(o, elm))(o),
          x.v.key
        )(o);
      } else {
        o(x);
      }
    });
  };
}
