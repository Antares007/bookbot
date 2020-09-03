// @flow strict
import type { P, N } from "./NP";
import * as E from "./E.js";

var state = { n: 0 };

const o = E.make(
  (r) => {
    const oldstate = state;
    state = r.v(state);
    if (state !== oldstate) console.info(state);
  },
  (v) => console.log(v),
  (document.body = document.createElement("body"))
);

const aelement = E.element(api);

const C = (d: number = 2) =>
  aelement("div", (o) => {
    o("button", (o) => {
      o("+");
      d > 0 && o(C(d - 1));
    });
    o("button", (o) => {
      o("-");
      d > 0 && o(C(d - 1));
    });
    o((s) => s);
    o("0");
  });

o(C());
o({ t: "end" });
Object.assign(window, { o, C, E, api, aelement });

function api(nar) {
  return (o) => {
    nar((r, s, t) => {
      if (typeof r === "function") {
        o({ t: "reduce", v: r });
      } else if ("string" === typeof r) {
        if (s) o(E.element(api)(r, s, t));
        else o({ t: "string", v: r });
      } else {
        o(r);
      }
    });
  };
}
