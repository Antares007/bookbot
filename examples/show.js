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
const opring = require("./opring");
const counter = require("./counter");
const D = (o) => {
  o.element("div", opring("c0")(E.mmap("C(0)", { n: 0 })(counter(0))));
  o.element("div", opring("c1")(E.mmap("C(1)", { n: 0 })(counter(1))));
  o.element("div", opring("c2")(E.mmap("C(2)", { n: 0 })(counter(2))));
  o.element("div", opring("c3")(E.mmap("C(3)", { n: 0 })(counter(3))));
};
const fs = require("fs");
const { join } = require("path");
const B = (path: string) => (o: document_pith_t<{}>) => {
  o.head((o) =>
    o.element(
      "style",
      (o) =>
        o.text(`
        td {
          vertical-align: top;
          padding: 0px;
        }
        table {
            border-spacing: 0px;
            border-color: grey;
        }`),
      "browser"
    )
  );
  o.element(
    "div.browser",
    (function rec(path) {
      return (o) => {
        o.text("Loading...");
        p.purry(p.liftcb1(fs.readdir)(path), (ns) => {
          const names = ns.filter((n) => !n.startsWith("."));
          return p.purry(
            p.all(names.map((n) => join(path, n)).map(p.liftcb1(fs.stat))),
            (stats) => () => {
              var i = 0;
              for (let n of names)
                o.element(
                  "div",
                  stats[i++][0].isDirectory()
                    ? opring(n)(E.mmap(n, {})(rec(join(path, n))))
                    : (o) => o.text(n)
                );
              o.end();
            }
          );
        })({
          error: (e) => (o.text(e.message), o.end()),
          value: () => {},
        });
      };
    })(path),
    "browser-" + path
  );
};
b(B(process.platform === "win32" ? "c:\\Users" : "/"));
Object.assign(window, { b, B, C: counter, D, E });
function reduce(r) {
  const newstate = r(state);
  localStorage.setItem("B", JSON.stringify(newstate));
  if (newstate !== state) {
    state = newstate;
    console.info(state);
  }
}
//
