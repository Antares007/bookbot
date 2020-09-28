// @flow strict
import type { N } from "../src/purry";
import type { pith_t as document_pith_t } from "../src/document";
const p = require("../src/purry");
const element = require("../src/element");
const opring = require("./opring");
const fs = require("fs");
const { join } = require("path");
module.exports = (path: string): N<document_pith_t<{}>> => (o) => {
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
                    ? opring(n)(element.mmap(n, {})(rec(join(path, n))))
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
