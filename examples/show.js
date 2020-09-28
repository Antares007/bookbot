// @flow strict
import type { N } from "../src/purry";
import type { pith_t as document_pith_t } from "../src/document";
const p = require("../src/purry");
const E = require("../src/element");
const document = require("../src/document");
const b = document.bark(reduce);
var state;
try {
  state = JSON.parse(localStorage.getItem("B") || "");
} catch (e) {
  state = { n: 0 };
}
const counter = require("./counter");
const opring = require("./opring");
const B = require("./browser");
const counters = (o) => {
  o.element("div", opring("c0")(E.mmap("C(0)", { n: 0 })(counter(0))));
  o.element("div", opring("c1")(E.mmap("C(1)", { n: 0 })(counter(1))));
  o.element("div", opring("c2")(E.mmap("C(2)", { n: 0 })(counter(2))));
  o.element("div", opring("c3")(E.mmap("C(3)", { n: 0 })(counter(3))));
};
b(B(process.platform === "win32" ? "c:\\Users" : "/"));
Object.assign(window, { b, B, C: counter, counters, E });
function reduce(r) {
  const newstate = r(state);
  localStorage.setItem("B", JSON.stringify(newstate));
  if (newstate !== state) {
    state = newstate;
    console.info(state);
  }
}
//
