// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N } from "./NP";
import * as E from "./E.js";
import type { Eo, Eend, Etext, Eelement, Edispose } from "./E.js";

export type Ro<S> = Rreduce<S> | Relement<S> | Eo | N<Ro<S>>;

export type Rreduce<S> = {| _: "Rreduce", v: (S) => S |};
export type Relement<S> = {|
  _: "Relement",
  v: {
    tag: string,
    key?: string,
    nar: N<Ro<S>>,
  },
|};
export function reduce<S>(v: (S) => S): N<Rreduce<S>> {
  const vRreduce = { _: "Rreduce", v };
  return (o) => o(vRreduce);
}
export function element<S>(
  tag: string,
  nar: N<Ro<S>>,
  key?: string
): N<Relement<S>> {
  const vRelement = { _: "Relement", v: { tag, nar, key } };
  return (o) => o(vRelement);
}
export function ring<S>(Rreduceo: P<Rreduce<S>>): (N<Ro<S>>) => N<Eo> {
  return (nar: N<Ro<S>>) => (Eo: P<Eo>) => {
    nar(function Ro(x: Ro<S>) {
      if ("function" === typeof x) {
        Eo(function nar(o) {
          x(Ro);
        });
      } else if ("Rreduce" === x._) {
        Rreduceo(x);
      } else if ("Relement" === x._) {
        E.element(x.v.tag, ring(Rreduceo)(x.v.nar), x.v.key)(Eo);
      } else {
        Eo(x);
      }
    });
  };
}
export function make<S>(Rreduceo: P<Rreduce<S>>, elm: Element): P<Ro<S>> {
  const Eo = E.make(elm);
  var Ro;
  ring(Rreduceo)(function Rmake_nar(Ro_) {
    Ro = Ro_;
  })(Eo);
  return function (x) {
    Ro(x);
  };
}
export function map<A: { ... }, B>(key: string, b: B): (N<Ro<B>>) => N<Ro<A>> {
  return (nar) => (roa) => {
    nar(function rob(x) {
      if ("function" === typeof x) {
        map(key, b)(x)(roa);
      } else if ("Rreduce" === x._) {
        const { v } = x;
        reduce((a) => {
          const oldb = a[key] || b;
          const newb = v(oldb);
          if (oldb === newb) return a;
          return { ...a, [key]: newb };
        })(roa);
      } else if ("Relement" === x._) {
        const { v } = x;
        element(v.tag, map(key, b)(v.nar), v.key)(roa);
      } else {
        roa(x);
      }
    });
  };
}
