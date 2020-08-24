// @flow strict
import { static_cast } from "./static_cast.js";
import * as E from "./E";
import type { Eo as O, P, N, N1 } from "./E";
const { dispose, element, makeElementPith, text } = E;
type ORA<S = *, T = *> = O | Relement<S> | R<S> | A<T> | On<S, T>;
type On<S, T> = {| _: "on", v: N1<ORA<S, T>, A<T>> |};
type A<+T> = {| _: "a", +v: T |};
type R<S = *> = {| _: "r", v: (S) => S |};
type Relement<S = *, T = *> = {|
  _: "relm",
  v: {
    tag: string,
    key?: string,
    nar: N1<ORA<S, T>, Element>,
  },
|};
function on<S, T>(v: N1<ORA<S, T>, A<T>>): N<On<S, T>> {
  const on = { _: "on", v };
  return (o) => o(on);
}
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
function ring<S, T>(or: P<R<S>>, oa: P<A<T>>): (N<ORA<S, T>>) => N<O> {
  return (nar) => (o) => {
    const ons = [];
    nar(function pith(x) {
      if (x == null || typeof x !== "object") {
        ons.splice(0, ons.length);
        o(x);
      } else if (x._ === "on") {
        ons.push(x);
      } else if (x._ === "a") {
        oa(x);
      } else if (x._ === "r") {
        or(x);
      } else if (x._ === "relm") {
        element(
          x.v.tag,
          (o, elm) =>
            ring(or, (a) => {
              if (ons.length) ons.forEach((n) => n.v(pith, a));
              else oa(a);
            })((o) => x.v.nar(o, elm))(o),
          x.v.key
        )(o);
      } else {
        o(x);
      }
    });
  };
}
function button<S, T>(nar: N<ORA<S, T>>, n: T): N<Relement<S, T>> {
  return relement("button", (o, elm) => {
    const listener = () => action(n)(o);
    elm.addEventListener("click", listener);
    dispose(() => elm.removeEventListener("click", listener))(o);
    nar(o);
  });
}
function C(
  depth: number = 0,
  key: string = "C",
  init: {| n: number |} = { n: 9 }
): N<ORA<{| n: number |}, *>> {
  var n = 0;
  var op;
  return (ob) =>
    relement(
      "div",
      (o) => {
        button((o) => {
          text("+")(o);
          depth > 0 && C(depth - 1, key, init)(o);
        }, 1)(o);
        on((o, a) => {
          reduce((s) => ({ n: s.n + 1 }))(o);
          reduce((s) => {
            //op(s.n + "");
            return s;
          })(op);
          E.end()(op);
        })(o);
        relement("div", (o) => {
          op = o;
          reduce((s) => {
            text(s.n + "")(o);
            return s;
          })(o);
        })(o);
      },
      "C" + depth
    )(ob);
}
var state = { n: 9 };
const o = makeElementPith((document.body = document.createElement("body")));

const addstate = ring(
  (r) => {
    state = r.v(state);
  },
  (a) => console.log(a)
);
E.render(addstate(C(3)))(o);

Object.assign(window, {
  ls() {
    console.log(state);
  },
  o,
  element,
  dispose,
  makeElementPith,
  C,
});
function rmap<A: { ... }, B, T>(
  key: string,
  b: B
): (P<ORA<A, T>>) => P<ORA<B, T>> {
  return (o) => (x) => {
    if (x == null || typeof x !== "object") {
      o(x);
    } else if (x._ === "relm") {
      x;
    } else if (x._ === "on") {
      x;
    } else if (x._ === "r")
      reduce((a) => {
        const ob = a[key] || b;
        const nb = x.v(ob);
        if (ob === nb) return a;
        return { ...a, [key]: nb };
      })(o);
    else o(x);
  };
}
