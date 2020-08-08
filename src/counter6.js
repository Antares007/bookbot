// @flow strict
import * as E from "./elm_pith";

function counter(o, d = 1) {
  o(
    E.elm("button", (o) => {
      o("+");
      if (d > 0) o(E.elm("div", (o) => counter(o, d - 1)));
    })
  );
  o(
    E.elm("button", (o) => {
      o("-");
      if (d > 0) o(E.elm("div", (o) => counter(o, d - 1)));
    })
  );
  o(
    E.reduce((s) => {
      o(d + "");
      return s;
    })
  );
}

const root = document.querySelector("#root-node");
if (!root) throw new Error("root");

var state = { n: 1, v: "o" };

const ob = E.mk_state_pith((r) => {
  state = r(state);
}, E.mkElementPith(root));

counter(ob);
ob();
window.E = E;
window.c = counter;
window.o = ob;
