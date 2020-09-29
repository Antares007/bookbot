// @flow strict
import type { N } from "../src/purry";
import type { pith_t as document_pith_t } from "../src/document";
const p = require("../src/purry");
const document = require("../src/document");
const b = document.bark(reduce);
var state;
try {
  state = JSON.parse(localStorage.getItem("B") || "");
} catch (e) {
  state = {};
}
const counter = require("./counter");
const opring = require("./opring");
const browser = require("./browser");
const todo = require("./todo");
const counters = (o) => {
  o.element("div", opring("c0")(counter(0)));
  o.element("div", opring("c1")(counter(1)));
  o.element("div", opring("c2")(counter(2)));
  o.element("div", opring("c3")(counter(3)));
};
b(browser(process.platform === "win32" ? "c:\\Users" : "/"));
Object.assign(window, { b, browser, counter, counters, todo });
function reduce(r) {
  const newstate = r(state);
  localStorage.setItem("B", JSON.stringify(newstate));
  if (newstate !== state) {
    state = newstate;
    console.info(state);
  }
}
//
