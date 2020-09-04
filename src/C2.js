// @flow strict
import type { P, N } from "./NP";
import * as E from "./E.js";

var state = { n: 0 };

const o = E.make((document.body = document.createElement("body")));

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
    o("0");
  });

o(C());
o({ t: "end" });
Object.assign(window, { o, C, E, api, aelement });

function api(nar) {
  return (o) => {
    nar((r, s, t) => {
      if ("string" === typeof r) {
        if (s) o(E.element(api)(r, s, t));
        else o({ t: "text", v: r });
      } else {
        o(r);
      }
    });
  };
}
