// @flow strict
const { A, B, C } = require("../src/abc");
const makePith = require("../src/element2");

const o = C(makePith, document.body, 0);

const id = (a) => a;

const rmap = B(({ s: [key], o: [init], f: [o] }) =>
  B(function ({ s: [t = "reduce"], f: [rb] }) {
    C(o, "reduce", (a) => {
      const ob = a[key] || init;
      const nb = rb(ob);
      if (ob === nb) return a;
      const ns = { ...a, [key]: nb };
      return ns;
    });
  })
);
const ring = B(({ f: [rpith, onar] }) => (o) => {
  const pith = B(
    ({ s: [t = "relement", tag], f: [onar] }) => C(pith, t, tag, "", onar),
    ({ s: [t = "relement", tag, key], f: [onar] }) =>
      C(o, "element", tag, key, C(ring, rpith, onar)),
    ({ s: [t = "relement", tag, key], f: [onar], o: [init] }) =>
      C(o, "element", tag, key, C(ring, C(rmap, key, init, rpith), onar)),
    function ({ s: [t = "reduce"], f: [r] }) {
      rpith(this);
    },
    function () {
      o(this);
    }
  );
  onar(pith);
});

const counter = B(({ s: [key], n: [depth] }) =>
  C(id, "relement", "div", key, { n: 9 }, (o) => {
    var op;
    C(o, "relement", "button", (o) => {
      C(o, "+");
      C(o, "get", (elm) => {
        elm.addEventListener("click", (e) => {
          C(o, "reduce", (s) => {
            C(op, s.n + 1 + "");
            C(op);
            return { ...s, n: s.n + 1 };
          });
        });
      });
      depth && o(C(counter, "+", depth - 1));
    });
    C(o, "relement", "button", (o) => {
      C(o, "-");
      C(o, "get", (elm) => {
        elm.addEventListener("click", (e) => {
          C(o, "reduce", (s) => {
            C(op, s.n - 1 + "");
            C(op);
            return { ...s, n: s.n - 1 };
          });
        });
      });
      depth && o(C(counter, "-", depth - 1));
    });
    C(o, "relement", "div", (o) => {
      op = o;
      C(o, "reduce", (s) => {
        C(o, s.n + "");
        return s;
      });
    });
  })
);
var state = {};
C(
  ring,
  B(({ s: [t = "reduce"], f: [r] }) => {
    const oldstate = state;
    state = r(state);
    oldstate !== state && console.log(state);
  }),
  (o) => {
    o(C(counter, 2, "counter"));
  }
)(o);

Object.assign(window, { o, A, B, C });
