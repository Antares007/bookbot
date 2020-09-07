// @flow strict
import type { P, N } from "./NP";
import * as E from "./E.js";

export type reduce_api_pith_t<S> = (
  ((S) => S) | string | E.o_t,
  void | ((reduce_api_pith_t<S>) => void),
  void | string
) => void;
export function reduce<S>(
  or: P<(S) => S>
): ((reduce_api_pith_t<S>) => void) => N<E.o_t> {
  return (nar) =>
    str_api((o) =>
      nar((r, s, t) =>
        "function" === typeof r ? or(r) : o(r, s ? reduce(or)(s) : s, t)
      )
    );
}
export function rmap<A: { ... }, B>(
  o: P<(A) => A>
): (string, B) => P<(B) => B> {
  return (key, init) => (rb) =>
    o((a) => {
      const ob = a[key] || init;
      const nb = rb(ob);
      if (ob === nb) return a;
      return { ...a, [key]: nb };
    });
}
x_api((o) => {
  o("button", (o) => {
    o("on", "click", (e: MouseEvent) => {});
    o("+");
  });
  o("button", (o) => {
    o("on", "click", (e: MouseEvent) => {});
    o("-");
  });

  o("a", "value", "11");
  o("s", "backgraund", "white");
  o("s", "backgraund", "white");
});
export type x_api_pith_t = (
  string | E.o_t,
  void | P<x_api_pith_t> | string,
  void | string | ((Event) => void) | ((MouseEvent) => void)
) => void;
export function x_api(nar: (x_api_pith_t) => void): N<E.o_t> {
  return str_api((o) => {
    nar((r, s, t) => {
      if ("on" === r && "string" === typeof s && "function" === typeof t) {
        r, s, t;
      } else if ("a" === r && "string" === typeof s && "string" === typeof t) {
        r, s, t;
      } else if ("s" === r && "string" === typeof s && "string" === typeof t) {
        r, s, t;
      } else if ("string" === typeof s || "function" === typeof t) {
        o(
          r,
          "string" === typeof s ? (o) => o(s) : s ? x_api(s) : s,
          "function" === typeof t ? t.toString() : t
        );
      } else o(r, s ? x_api(s) : s, t);
    });
  });
}

export type str_api_pith_t = (
  string | E.o_t,
  void | ((str_api_pith_t) => void),
  void | string
) => void;
export function str_api(nar: (str_api_pith_t) => void): N<E.o_t> {
  return (o) =>
    nar(function pith(r, s, t) {
      if ("string" === typeof r) {
        if (s) o(E.element(str_api)(r, s, t));
        else if (t) o(E.text(r + t));
        else o(E.text(r));
      } else {
        o(r);
        s && o(E.text(s.toString()));
        t && o(E.text(t));
      }
    });
}
export function on(type: string): (EventHandler) => E.action_t {
  return (l: EventHandler) =>
    E.action((elm) => (o) => {
      elm.addEventListener(type, l);
      o(E.disposable(() => elm.removeEventListener(type, l)));
    });
}
