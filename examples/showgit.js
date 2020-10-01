// @flow strict
const p = require("../src/purry");
const git = require("../src/git");
const { yfs } = require("../src/yfs");
const { resolve } = require("path");
const element = require("../src/element");

var state = {};
const b = require("../src/document").bark((r) => {
  state = r(state);
});
const opring = require("./opring");
const B = (hash) => (o) => {
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
    (function rec(hash: git.hash_t) {
      return (o) => {
        o.text("Loading...");
        p.purry(
          p.purry(
            git.read(yfs, resolve(__dirname, "../.git"), hash),
            (b, t) => (o) => {
              if (b.type === "tree") o.value(b.value);
            }
          ),
          (ns) => () => {
            const names = Object.keys(ns);
            for (let n of names)
              o.element(
                "div",
                ns[n].mode === "40000"
                  ? (o) => opring(n)(element.mmap(n, {})(rec(ns[n].hash)))(o)
                  : (o) => o.text(n)
              );
            o.end();
          }
        )({
          error: (e) => (o.text(e.message), o.end()),
          value: () => {},
        });
      };
    })(hash),
    "browser-" + hash.toString("hex", 0, 4)
  );
};

b(B(git.hashFrom("3cdd739c0afcde3ccac7b6879fe78b69c875b1e2")));
