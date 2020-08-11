// @flow strict
import * as E from "./elm_pith";

// prettier-ignore
function counter(o, d = 1) {
  const ob = o;
  o(E.elm("button", (o) => {
    o("+");
    o(E.on.click((e) => {
      o(E.reduce((s) => {
        return { ...s, n: s.n + 1 };
      }));
      counter(ob, d);
    }));
    if (d > 0) o(E.elm("div", E.ext("+", { n: 0 }, (o) => counter(o, d - 1))));
  }));
  o(E.elm("button", (o) => {
      o("-");
      o(E.on.click((e) => {
        o(E.reduce((s) => {
          return { ...s, n: s.n - 1 };
        }));
        counter(ob, d);
      }));
      if (d > 0) o(E.elm("div", E.ext("-", { n: 0 }, (o) => counter(o, d - 1))));
    })
  );
  o(E.reduce((s) => { o(s.n + ""); return s; }));
  o();
}

const root = document.querySelector("#root-node");
if (!root) throw new Error("root");

var state = { n: 0 };
console.info(JSON.stringify(state, null, "  "));

const ob = E.mk_state_pith((r) => {
  const os = state;
  state = r(state);
  if (os !== state) console.info(JSON.stringify(state, null, "  "));
}, E.mkElementPith(root));

counter(ob);
window.E = E;
window.c = counter;
window.o = ob;
