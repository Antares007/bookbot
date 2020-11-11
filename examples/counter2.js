// @flow strict
const { A, B, C } = require("../src/abc");
const makePith = require("../src/element2");

const o = C(makePith, document.body, 0);

const id = (a) => a;

const ring = B(({ f: [reduce, onar] }) => (o) => {
  const pith = B(
    ({ s: [t = "relement", tag], f: [onar] }) => C(pith, t, tag, "", onar),
    ({ s: [t = "relement", tag, key], f: [onar] }) =>
      C(o, "element", tag, key, C(ring, reduce, onar)),
    function ({ s: [t = "reduce"], f: [r] }) {
      reduce(this);
    },
    function () {
      o(this);
    }
  );
  onar(pith);
});

const counter = B(({ n: [depth] }) =>
  C(id, "relement", "div", "counter" + depth, (o) => {
    C(o, "relement", "button", (o) => {
      C(o, "+");
      C(o, "get", (elm) => console.log(elm));
      depth && o(C(counter, depth - 1));
    });
    C(o, "relement", "button", (o) => {
      C(o, "-");
      depth && o(C(counter, depth - 1));
    });
    C(o, depth + "");
  })
);

C(
  ring,
  B(({ s: [t = "reduce"], f: [r] }) => {
    console.log(r);
  }),
  (o) => {
    o(C(counter, 3));
  }
)(o);

Object.assign(window, { o, A, B, C });
