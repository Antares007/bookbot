// @flow strict
import { mkpith } from "./mkpith";
import type { Pith } from "./mkpith";

const elm = (tag, ring) => ({ _: ("elm": "elm"), tag, ring });
const onClick = (f: (MouseEvent) => mixed) => ({
  _: ("handler": "handler"),
  f,
});
const reduce = (g) => ({ _: ("reduce": "reduce"), g });
const button = (pith) => elm("BUTTON", pith);
const div = (pith) => elm("DIV", pith);
var di = 0;
function counter(o: (Pith<{ n: number }>) => void, d: number = 1) {
  o(
    button((o) => {
      o("+");
      if (d > 0) o(div((o) => counter((r) => o(r), d - 1)));
    })
  );
  o(
    button((o) => {
      o("-");
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

bark(counter);

// function page1(o, p) {
//   o("page 1");
//   o(div({ d: 1 }, switcher));
// }
// function page2(o, p) {}
// function switcher(o, p) {}
