// @flow strict
import * as E from "./E3";
import * as R from "./R";
const C = (r, d = 2) => (o) =>
  o.element(
    "div",
    E.rring(r)(function nar(o) {
      var ob = o;
      o.element(
        "button",
        (o) => {
          o.text("+");
          o.on("click", () => {
            o.reduce((s) => ({ ...s, n: s.n + 1 })), nar(ob), ob.end();
          });
          d && C(R.rmap(r)("+", { n: d }), d - 1)(o);
        },
        "plus"
      );
      o.element(
        "button",
        (o) => {
          o.text("-");
          o.on("click", () => {
            o.reduce((s) => ({ ...s, n: s.n + 1 })), nar(ob), ob.end();
          });
          d && C(R.rmap(r)("-", { n: -d }), d - 1)(o);
        },
        "minus"
      );
      o.reduce((s) => (o.text(s.n + ""), s));
    })
  );

const o = E.make((document.body = document.createElement("body")));
var state = { n: 9 };
C((r) => {
  state = r(state);
})(o);
o.end();

Object.assign(window, { o, C, E });
