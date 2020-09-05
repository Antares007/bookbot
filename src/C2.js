// @flow strict
import type { P, N } from "./NP";
import * as E from "./E.js";
import * as R from "./R.js";

const C = (r, d: number = 2) =>
  E.element(R.reduce<{ n: number }>(r))("div", (o) => {
    o("button", (o) => {
      o(R.on("click")(() => (o((s) => ({ ...s, n: s.n + 1 })), redraw())));
      o("+");
      d > 0 && o(C(R.rmap(r)("+", { n: 0 }), d - 1));
    });
    o("button", (o) => {
      o(R.on("click")(() => (o((s) => ({ ...s, n: s.n - 1 })), redraw())));
      o("-");
      d > 0 && o(C(R.rmap(r)("-", { n: 0 }), d - 1));
    });
    var op;
    o("div", (o) => {
      op = o;
    });
    const redraw = () => (o((s) => (op(s.n + ""), s)), op(E.end));
    redraw();
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
Object.assign(window, { o, C, E, R });
