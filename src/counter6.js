// @flow strict
import { dispose, action, on, elm, ext, makeElementPith } from "./elm_pith";
const div = (b) => elm("div", b);
const button = (b) => elm("button", b);

const action0 = {
  _: "action",
  a: (o, elm) => {
    const h = (e: MouseEvent) => {
      console.log("m");
    };
    elm.addEventListener("click", h);
    o(
      dispose(() => {
        elm.removeEventListener("click", h);
        console.log("d");
      })
    );
  },
};
// prettier-ignore
function counter(o, d = 1) {
  const ob = o;
  const counterDminus1 = (o) => counter(o, d - 1);

  o(action0); 

  o(button((o) => {
    o("+");
    o(on.click((e) => {
      o(function (s) {
        return { ...s, n: s.n + 1 };
      });
      counter(ob, d);
    }));
    if (d > 0) o(div(ext("+", { n: 0 }, counterDminus1)));
    o()
  }));
  o(button((o) => {
    o("-");
    o(on.click((e) => {
      o(function (s) {
        return { ...s, n: s.n - 1 };
      });
      counter(ob, d);
    }));
    if (d > 0) o(div(ext("-", { n: 0 }, counterDminus1)));
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
Object.assign(window, { o, on, elm, div, button, c: counter });
