// flow strict
import { dispose, action, on, elm, ext, makeElementPith } from "./elm_pith";
const div = (b) => elm("div", b);
const h1 = (b) => elm("h1", b);
const h2 = (b) => elm("h2", b);
const h3 = (b) => elm("h3", b);
const h4 = (b) => elm("h4", b);
const ul = (b) => elm("ul", b);
const li = (b) => elm("li", b);
const br = (b) => elm("br");
const button = (b) => elm("button", b);

function c(o) {
  var id;
  const d = dispose(() => clearTimeout(id));
  (function rec(o) {
    o(function (s) {
      o(s.n + "");
      return { n: s.n + 1 };
    });
    id = setTimeout(() => rec(o), 1000);
    o(d);
    o();
  })(o);
}
const action0 = action((o, elm) => {
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
});
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
  if (typeof r !== "function") return;
  const os = state;
  state = r(state);
  if (os !== state) console.info(state);
}, root);

counter(o);
c(o);
Object.assign(window, {
  o,
  on,
  elm,
  dispose,
  div,
  button,
  counter,
  c,
  makeElementPith,
  h1,
  h2,
  h3,
  h4,
  ul,
  li,
  br,
});
