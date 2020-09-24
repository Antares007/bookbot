// @flow strict
const p = require("./p");
type jsgit_tree_t = { [string]: { mode: number, hash: string } };

function saveAs(a, b) {
  return (o) => {
    o.error(new Error());
    o.value("hash");
  };
}
function loadAs(a, b) {
  return (o) => {
    o.error(new Error());
    o.value(Buffer);
    o.value((o) => {
      o("name", 1, "hash");
    });
  };
}
declare var mode: { ["blob" | "tree"]: number };

type nar_t<A = void, B = void, C = void> = (A, B, C) => void;
type git_pith_t<E> = {
  blob: nar_t<string, nar_t<p.pith_t<E, Buffer>>>,
  tree: nar_t<string, nar_t<p.pith_t<E, nar_t<git_pith_t<E>>>>>,
  end: nar_t<p.pith_t<E, string>>,
};
function pith<E>(): git_pith_t<E> {
  var nar = (o: p.pith_t<E, jsgit_tree_t>) => o.value({});
  return {
    blob(name, nar) {},
    tree(name, nar) {},
    end(o) {},
    error(e) {},
  };
}

function nar(o, i) {
  //  i({
  //    ...o,
  //    value(mode, name, hash) {
  //      //
  //    },
  //  });
  //  o.blob("afsdf", "value");
  //  o.tree("sdfsf", (o, i) => {
  //    o.blob("sdfsdfgfd", "sha");
  //  });
  //  o.tree("sdfsf", "sha");
}

const E = require("./E3");

import type { N } from "./E3";
const o = E.pith((document.body = document.createElement("body")));
var state;
try {
  state = JSON.parse(localStorage.getItem("B") || "");
} catch (e) {
  state = { n: 0 };
}
const b = (nar) => E.bark(o)(E.rring(reduce)(nar));

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
          o.element("table", (o) => {
            o.element("tr", (o) => {
              o.element("td", (o) =>
                o.element("button", (o) => {
                  o.text("- " + key);
                  o.on("click", (e) => {
                    o.reduce((s) => ({ ...s, [key]: false }));
                    b(mainnar);
                  });
                })
              );
              o.element("td", (o) => {
                E.rring(op.reduce)(nar)(o);
              });
            });
          });
        else
          o.element("button", (o) => {
            o.text("+ " + key);
            o.on("click", (e) => {
              o.reduce((s) => ({ ...s, [key]: true }));
              b(mainnar);
            });
          });

        return s;
      });
    })(op);
}
const { C } = require("./C3");
const fs = require("fs");
const { join } = require("path");
b((o) => {
  o.element("div", opring("c0")(E.mmap("C(0)", { n: 0 })(C(0))));
  o.element("div", opring("c1")(E.mmap("C(1)", { n: 3 })(C(1))));
  o.element("div", opring("c2")(E.mmap("C(2)", { n: 6 })(C(2))));
  o.element("div", opring("c3")(E.mmap("C(3)", { n: 9 })(C(3))));
});
const B = (pth) => (o) => {
  o.text("Loading...");
  p.purry(p.liftcb1(fs.readdir)(pth), (names) =>
    p.purry(
      p.all(names.map((n) => p.liftcb1(fs.stat)(join(pth, n)))),
      (stats) => (o) => {
        var i = 0;
        o.value((o) => {
          for (let n of names)
            if (stats[i++][0].isDirectory())
              o.element("div", opring(n)(E.mmap(n, {})(B(join(pth, n)))));
            else o.text(n);
        });
      }
    )
  )({
    error: (e) => b((o) => o.text(e.message)),
    value: E.bark(o),
  });
};
b(B("/"));

Object.assign(window, { o, b, E });
function reduce(r) {
  const newstate = r(state);
  localStorage.setItem("B", JSON.stringify(newstate));
  if (newstate !== state) {
    state = newstate;
    console.info(state);
  }
}
