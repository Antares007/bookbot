// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N, N1 } from "./NP";
import * as E from "./E.js";
import type { Eo } from "./E.js";
import * as R from "./R.js";
import type { Ro } from "./R.js";
import * as A from "./A.js";
import type { Ao } from "./A.js";

var state = { n: 9 };

const o = R.make((r) => {
  const oldstate = state;
  state = r.v(state);
  if (state !== oldstate) console.info(state);
}, (document.body = document.createElement("body")));
const button = (nar, l: MouseEventHandler) =>
  R.element("button", function (o, elm) {
    elm.addEventListener("click", l);
    E.dispose(() => elm.removeEventListener("click", l));
    nar(o, elm);
  });
const C = (depth = 2, key: string = "C", init = { n: 9 }): N<Ro<*>> =>
  R.element(
    "div",
    function (o) {
      var op;
      const l = (n) => {
        var ns = init;
        R.reduce((s) => (ns = { n: s.n + n }))(op);
        E.text(ns.n + "")(op);
        E.end()(op);
      };
      button(
        function (o, elm) {
          E.text("+")(o);
          depth > 0 && R.map("+", { n: 2 })(C(depth - 1, key))(o, elm);
        },
        () => l(1)
      )(o);
      R.reduce((s) => {
        R.element("div", (o) => {
          op = o;
          E.text(s.n + "")(o);
        })(o);
        return s;
      })(o);
    },
    key + depth
  );

o(C());

Object.assign(window, { o, C, E, R, A });
