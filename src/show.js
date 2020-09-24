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
var state = { n: 0 };
const b = (nar) => E.bark(o)(E.rring(reduce)(nar));

function openclose<S>(nar: N<E.r_pith_t<S>>): N<E.r_pith_t<S>> {
  return (o) => o.element("table", (o) => {});
}
b((o) => o.text("hello"));

Object.assign(window, { o, b, E });

function reduce(r) {
  const newstate = r(state);
  if (newstate !== state) {
    state = newstate;
    console.info(state);
  }
}
