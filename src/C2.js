// @flow strict
import type { P, N } from "./NP";
import * as E from "./E.js";

var state = { n: 0 };

const o = E.make((document.body = document.createElement("body")));

type str_api_nar_t = (str_api_pith_t) => void;
const C = (r, d: number = 2) =>
  E.element(reduce<{ n: number }>(r))("div", (o) => {
    o("button", (o) => {
      o((s) => ({ ...s, n: s.n + 1 }));
      o("+");
      d > 0 && o(C(rmap("+", { n: 0 + d })(r), d - 1));
    });
    o("button", (o) => {
      o((s) => ({ ...s, n: s.n - 1 }));
      o("-");
      d > 0 && o(C(rmap("-", { n: 0 - d })(r), d - 1));
    });
    o((s) => (o(s.n + ""), s));
  });
var state = { n: 9 };
o(
  C((r) => {
    state = r(state);
    console.log(state);
  })
);
o({ t: "end" });
//Object.assign(window, { o, C, E, str_api });

type reduce_api_pith_t<S> = (
  ((S) => S) | string | E.o_t,
  void | ((reduce_api_pith_t<S>) => void),
  void | string
) => void;
function reduce<S>(
  or: P<(S) => S>
): ((reduce_api_pith_t<S>) => void) => N<E.o_t> {
  return (nar) =>
    str_api((o) =>
      nar((r, s, t) =>
        "function" === typeof r ? or(r) : o(r, s ? reduce(or)(s) : s, t)
      )
    );
}
function rmap<A: { ... }, B>(
  key: string,
  init: B
): (P<(A) => A>) => P<(B) => B> {
  return (o) => (rb) =>
    o((a) => {
      const ob = a[key] || init;
      const nb = rb(ob);
      if (ob === nb) return a;
      return { ...a, [key]: nb };
    });
}
type str_api_pith_t = (
  string | E.o_t,
  void | ((str_api_pith_t) => void),
  void | string
) => void;
function str_api(nar: (str_api_pith_t) => void): N<E.o_t> {
  return (o) =>
    nar((r, s, t) =>
      "string" === typeof r
        ? s
          ? o(E.element(str_api)(r, s, t))
          : o(E.text(r))
        : o(r)
    );
}
