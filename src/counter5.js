// @flow strict
import { mkpith } from "./mkpith";

const elm = (tag, bark) => ({ _: ("elm": "elm"), tag, bark });
const click = (f) => ({ _: ("click": "click"), f });
const reduce = (g) => ({ _: ("reduce": "reduce"), g });
const button = (pith) => elm("BUTTON", pith);
const div = (pith) => elm("DIV", pith);
var di = 0;
const c3 = (o) => counter(o, 2);
function counter(o, d: number) {
  const ob = o;
  o(
    button((o) => {
      o("+");
      o(
        click((e) => {
          console.log("+" + d);
          o(
            reduce((s) => {
              return { ...s, n: s.n + 1 };
            })
          );
          ob((o) => counter(o, d));
        })
      );
      if (d > 0) o(div((o) => counter(o, d - 1)));
    })
  );
  o(
    button((o) => {
      o("-");
      o(
        click((e) => {
          console.log("-" + d);
          o(
            reduce((s) => {
              return { ...s, n: s.n - 1 };
            })
          );
          ob((o) => counter(o, d));
        })
      );
      if (d > 0) o(div((o) => counter(o, d - 1)));
    })
  );
  o(
    reduce((s) => {
      o(s.n + "");
      return s;
    })
  );
}

const rootNode = document.getElementById("root-node");
if (!rootNode) throw new Error("cant find root-node");

var state: { n: number } = { n: 0 };
console.info(JSON.stringify(state));

const bark = mkpith((r) => {
  const os = state;
  state = r(state);
  if (os !== state) console.info(JSON.stringify(state));
}, rootNode);
bark(c3);
bark(c3);

// function page1(o, p) {
//   o("page 1");
//   o(div({ d: 1 }, switcher));
// }
// function page2(o, p) {}
// function switcher(o, p) {}
