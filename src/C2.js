// @flow strict
import type { P, N } from "./NP";
import * as E from "./E.js";

const C = (r, d: number = 2) =>
  E.element(reduce<{ n: number }>(r))("div", (o) => {
    var op;
    o("button", (o) => {
      o(on("click")((e) => (o((s) => ({ ...s, n: s.n + 1 })), redraw())));
      o("+");
      d > 0 && o(C(rmap(r)("+", { n: 0 }), d - 1));
    });
    o("button", (o) => {
      o(on("click")((e) => (o((s) => ({ ...s, n: s.n - 1 })), redraw())));
      o("-");
      d > 0 && o(C(rmap(r)("-", { n: 0 }), d - 1));
    });
    const redraw = () => {
      o((s) => (op(s.n + ""), s));
      op(E.end);
    };
    o("div", (o) => {
      op = o;
      o((s) => (o(s.n + ""), s));
    });
  });

const o = E.make((document.body = document.createElement("body")));

var state = { n: 0 };
o(
  C((r) => {
    const oldstate = state;
    state = r(state);
    if (oldstate !== state) console.log(state);
  })
);
o({ t: "end" });

Object.assign(window, { o, C, E, str_api });

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
function rmap<A: { ... }, B>(o: P<(A) => A>): (string, B) => P<(B) => B> {
  return (key, init) => (rb) =>
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
function on(type) {
  return (l: EventHandler) =>
    E.action((elm) => {
      elm.addEventListener(type, l);
      return () => elm.removeEventListener(type, l);
    });
}
