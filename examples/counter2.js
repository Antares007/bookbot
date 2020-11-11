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

const counter = B(({ n: [depth] }) =>
  C(id, "relement", "div", "counter" + depth, (o) => {
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
      depth &&
        C(ring, C(rmap, "+", { n: 0 }, o), (o) => o(C(counter, depth - 1)))(o);
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
      depth &&
        C(ring, C(rmap, "-", { n: 0 }, o), (o) => o(C(counter, depth - 1)))(o);
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
var state = { n: 0 };
C(
  ring,
  B(({ s: [t = "reduce"], f: [r] }) => {
    const oldstate = state;
    state = r(state);
    oldstate !== state && console.log(state);
  }),
  (o) => {
    o(C(counter, 2));
  }
)(o);

Object.assign(window, { o, A, B, C });
