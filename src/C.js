// @flow strict
import { static_cast } from "./static_cast.js";
import type { P, N } from "./NP";
import * as E from "./E.js";
import * as R from "./R.js";
import type { Ro, Relement } from "./R.js";

var state = { n: 9, "+": { n: 3 }, "-": { n: 6 } };

const o = R.make((r) => {
  const oldstate = state;
  state = r.v(state);
  if (state !== oldstate) console.info(state);
}, (document.body = document.createElement("body")));
const button = <S>(nar: N<Ro<S>>, l: MouseEventHandler): N<Relement<S>> =>
  R.element("button", function (o) {
    E.get((elm) => {
      elm.addEventListener("click", l);
      E.dispose(() => elm.removeEventListener("click", l));
    })(o);
    nar(o);
  });
const C = (depth: number = 2, init: {| n: number |} = { n: 0 }): N<Ro<*>> =>
  R.element(
    "div",
    function (o) {
      var op;
      const l = (n) =>
        R.reduce((s) => {
          const ns = { ...s, n: s.n + n };
          E.text(ns.n + "")(op);
          E.end()(op);
          return ns;
        })(op);
      button(
        function (o, elm) {
          E.text("+")(o);
          depth > 0 && R.map("+", init)(C(depth - 1))(o);
        },
        () => l(1)
      )(o);
      button(
        function (o, elm) {
          E.text("-")(o);
          depth > 0 && R.map("-", init)(C(depth - 1))(o);
        },
        () => l(-1)
      )(o);
      R.element("div", (o) => {
        R.reduce((s) => {
          op = o;
          E.text(s.n + "")(o);
          return s;
        })(o);
      })(o);
    },
    "C" + depth
  );

o(C());

Object.assign(window, { o, C, E, R });
