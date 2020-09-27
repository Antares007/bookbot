// @flow strict
import type { N } from "./p";
const p = require("./p");
const E = require("./E3");
const document = require("./document");
const o = document.pith(reduce);
var state;
try {
  state = JSON.parse(localStorage.getItem("B") || "");
} catch (e) {
  state = { n: 0 };
}
function opring<S: { ... }>(
  key: string
): (N<E.r_pith_t<S>>) => N<E.r_pith_t<S>> {
  return (nar) => (op) =>
    E.mmap(
      "op",
      {}
    )(function mainnar(o) {
      const b = E.bark(o);
      o.reduce((s) => {
        if (s[key])
          o.element(
            "table",
            (o) => {
              o.element("tr", (o) => {
                o.element("td", (o) =>
                  o.element("button", (o) => {
                    o.text("- " + key);
                    o.on("click", (e) => {
                      o.reduce((s) => {
                        const ns = { ...s, [key]: void 0 };
                        delete ns[key];
                        return ns;
                      });
                      b(mainnar);
                    });
                  })
                );
                o.element("td", (o) => {
                  E.rring(op.reduce)(nar)(o);
                });
              });
            },
            key
          );
        else
          o.element(
            "button",
            (o) => {
              o.text("+ " + key);
              o.on("click", (e) => {
                o.reduce((s) => ({ ...s, [key]: true }));
                b(mainnar);
              });
            },
            key
          );

        return s;
      });
    })(op);
}
const { C } = require("./C3");
const D = (o) => {
  o.element("div", opring("c0")(E.mmap("C(0)", { n: 0 })(C(0))));
  o.element("div", opring("c1")(E.mmap("C(1)", { n: 0 })(C(1))));
  o.element("div", opring("c2")(E.mmap("C(2)", { n: 0 })(C(2))));
  o.element("div", opring("c3")(E.mmap("C(3)", { n: 0 })(C(3))));
};
const fs = require("fs");
const { join } = require("path");
const B = (pth) => (o) => {
  o.text("Loading...");
  p.purry(p.liftcb1(fs.readdir)(pth), (ns) => {
    const names = ns.filter((n) => !n.startsWith("."));
    return p.purry(
      p.all(names.map((n) => join(pth, n)).map(p.liftcb1(fs.stat))),
      (stats) => () => {
        var i = 0;
        for (let n of names)
          o.element(
            "div",
            stats[i++][0].isDirectory()
              ? opring(n)(E.mmap(n, {})(B(join(pth, n))))
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
o.body(B("/"));
const css = `
td {
  vertical-align: top;
  padding: 0px;
}
table {
    border-spacing: 0px;
    border-color: grey;
}
`;
o.head((o) => o.text(css));
Object.assign(window, { o, B, C, D, E });
function reduce(r) {
  const newstate = r(state);
  localStorage.setItem("B", JSON.stringify(newstate));
  if (newstate !== state) {
    state = newstate;
    console.info(state);
  }
}
//
