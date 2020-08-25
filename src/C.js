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
  state = r.v(state);
}, (document.body = document.createElement("body")));

const C = (depth = 1, key: string = "C", init? = { n: 9 }): N<Ro<*>> => (Ro) =>
  R.element("div", function (o) {
    R.element(
      "div",
      A.ring(console.log.bind(console))((o) => {
        A.value(1)(o);
      })
    )(o);
    R.element("button", function (o) {
      E.text("+")(o);
      depth > 0 && C(depth - 1, key + "+")(o);
    })(o);
    R.element("button", function (o) {
      E.text("-")(o);
      depth > 0 && C(depth - 1, key + "-")(o);
    })(o);
    R.reduce((s) => {
      R.element("div", E.text(s.n + ""))(o);
      return s;
    })(o);
  })(function map({ v }) {
    R.element(v.tag, v.nar, key + depth)(Ro);
  });

o(C());

Object.assign(window, { o, C, E, R, A });
