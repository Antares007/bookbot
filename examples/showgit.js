// @flow strict
const p = require("../src/purry");
const git = require("../src/git");
const { yfs } = require("../src/yfs");
const { resolve } = require("path");
const element = require("../src/element");

var state = JSON.parse(localStorage.getItem("B") || "{}");
const b = require("../src/document").bark(function reduce(r) {
  const newstate = r(state);
  localStorage.setItem("B", JSON.stringify(newstate));
  if (newstate !== state) {
    state = newstate;
    console.info(state);
  }
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
          git.read(yfs, resolve(__dirname, "../.git"), hash),
          (obj) => () => {
            if (obj.type === "commit") {
              o.element(
                "div",
                opring("tree(" + obj.value.tree.slice(0, 4) + ")")((o) => {
                  element.mmap(
                    obj.value.tree,
                    {}
                  )(rec(git.hashFrom(obj.value.tree)))(o);
                })
              );
              for (var hash of obj.value.parents)
                o.element(
                  "div",
                  opring("parent(" + hash.slice(0, 4) + ")")((o) => {
                    element.mmap(hash, {})(rec(git.hashFrom(hash)))(o);
                  })
                );
            } else if (obj.type === "tree") {
              const names = Object.keys(obj.value);
              for (let n of names)
                o.element(
                  "div",
                  opring(obj.value[n].mode.slice(-3) + " " + n)(
                    element.mmap(n, {})(rec(obj.value[n].hash))
                  )
                );
            } else if (obj.type === "blob") {
              o.element("pre", (o) => {
                o.element("code", (o) => {
                  o.text(obj.value.toString("utf8"));
                });
              });
            }
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

b(B(git.hashFrom("48ff71803e1ffb3f19fa1dee57a3cf9ab4dc95c1")));
