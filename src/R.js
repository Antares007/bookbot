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
export type str_api_pith_t = (
  string | E.o_t,
  void | ((str_api_pith_t) => void),
  void | string
) => void;
export function str_api(nar: (str_api_pith_t) => void): N<E.o_t> {
  return (o) =>
    nar((r, s, t) =>
      "string" === typeof r
        ? s
          ? o(E.element(str_api)(r, s, t))
          : o(E.text(r))
        : o(r)
    );
}
export function on(type: string): (EventHandler) => E.action_t {
  return (l: EventHandler) =>
    E.action((elm) => (o) => {
      elm.addEventListener(type, l);
      o(E.disposable(() => elm.removeEventListener(type, l)));
    });
}
