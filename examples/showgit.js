// @flow strict
import type { N } from "../src/purry";
const p = require("../src/purry");
const git = require("../src/git");
const { yfs } = require("../src/yfs");
const { resolve, join } = require("path");
const element = require("../src/element");
const ast = require("./ast");

var state = JSON.parse(localStorage.getItem("B") || "{}");
const document = require("../src/document");
const b = document.bark(function reduce(r) {
  const newstate = r(state);
  localStorage.setItem("B", JSON.stringify(newstate));
  if (newstate !== state) {
    state = newstate;
    console.info(state);
  }
});
const opring = require("./opring");
const gitdir = resolve(__dirname, "../.git");
const opr = (n, nar) => opring(n)(element.mmap(n, {})(nar));

const B = (hash: git.hash_t): N<document.pith_t<{}>> => (o) => {
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
        p.purry(git.read(yfs, gitdir, hash), (obj) => () => {
          if (obj.type === "commit") {
            o.element(
              "div",
              opr(
                "tree(" + obj.value.tree.slice(0, 4) + ")",
                rec(git.hashFrom(obj.value.tree))
              )
            );
            for (var hash of obj.value.parents)
              o.element(
                "div",
                opr("parent(" + hash.slice(0, 4) + ")", rec(git.hashFrom(hash)))
              );
          } else if (obj.type === "tree") {
            const names = Object.keys(obj.value);
            for (let n of names)
              o.element(
                "div",
                opr(
                  obj.value[n].mode.slice(-3) + " " + n,
                  rec(obj.value[n].hash)
                )
              );
          } else if (obj.type === "blob") {
            o.element("pre", (o) => {
              o.element("code", (o) => {
                ast(obj.value.toString("utf8"))(o);
              });
            });
          }
          o.end();
        })({
          error: (e) => (o.text(e.message), o.end()),
          value: () => {},
        });
      };
    })(hash),
    "browser-" + hash.toString("hex", 0, 4)
  );
};
git.readRef(
  yfs,
  gitdir,
  "refs/heads/master"
)({
  error(e) {
    console.error(e);
  },
  value(hash) {
    b((o) => {
      B(git.hashFrom(hash))(o);
    });
  },
});
