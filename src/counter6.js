// @flow strict
import { act, on, elm, ext, makeElementPith } from "./elm_pith";
const div = (b) => elm("div", b);
const button = (b) => elm("button", b);

// prettier-ignore
function counter(o, d = 1) {
  const ob = o;
  const counterDminus1 = (o) => counter(o, d - 1);

  const action0 = act((elm) => {
    const h = (e: MouseEvent) => {}
    elm.addEventListener('click', h)
    return () => elm.removeEventListener('click', h)
  });

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
Object.assign(window, { o, on, elm, div, button, counter });
