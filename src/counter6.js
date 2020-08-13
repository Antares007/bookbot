// @flow strict
import { on, elm, ext, makeElementPith } from "./elm_pith";

// prettier-ignore
function counter(o, d = 1) {
  const ob = o;
  o(elm("button", (o) => {
    o("+");
    o(on.click((e) => {
      o(function (s) {
        return { ...s, n: s.n + 1 };
      });
      counter(ob, d);
    }));
    if (d > 0) o(elm("div", ext("+", { n: 0 }, (o) => counter(o, d - 1))));
    o()
  }));
  o(elm("button", (o) => {
    o("-");
    o(on.click((e) => {
      o(function (s) {
        return { ...s, n: s.n - 1 };
      });
      counter(ob, d);
    }));
    if (d > 0) o(elm("div", ext("-", { n: 0 }, (o) => counter(o, d - 1))));
    o()
  }));
  o(function (s) {
    o(s.n + "");
    return s;
  });
  o();
}

const root = document.querySelector("#root-node");
if (!root) throw new Error("root");

var state = { n: 0 };
console.info(state);

const o = makeElementPith((r) => {
  const os = state;
  state = r(state);
  if (os !== state) console.info(state);
}, root);

counter(o);
