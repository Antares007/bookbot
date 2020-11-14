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
const ering = B(({ f: [onar] }) => (o) => {
  var count = 0;
  const list = [];
  const pith = B(
    ({ s: [t = "element", tag, key = null], f: [onar] }) =>
      C(o, t, tag, key, C(ering, onar)),
    function ({ s: [t = "on", type], f: [listener], o: [options] }) {
      const index = count++;
      for (let i = index, l = list.length; i < l; i++)
        if (list[i] === this) {
          if (index < i) list.splice(index, 0, ...list.splice(i, 1));
          return;
        }
      C(o, "get", (elm) => elm.addEventListener(type, listener, options));
      list.splice(index, 0, null);
    },
    function ({}) {
      const olist = list.splice(count, list.length - count);
      count = 0;
      C(o, "get", (elm) => {
        for (let e of olist) elm.removeEventListener(e.s[1], e.f[0], e.o[0]);
      });
      o(this);
    },
    function () {
      o(this);
    }
  );
  onar(pith);
});

const ring = B(({ f: [rpith, onar] }) => (o) => {
  const pith = B(
    ({ s: [t = "relement", tag, key = null], f: [onar] }) =>
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
  C(id, "relement", "div", key, { n: depth * 3 + 3 }, (o) => {
    var op;
    C(o, "relement", "button", (o) => {
      C(o, "+");
      C(o, "on", "click", {}, (e) => {
        C(o, "reduce", (s) => {
          C(op, s.n + 1 + "");
          C(op);
          return { ...s, n: s.n + 1 };
        });
      });
      depth && o(C(counter, "+", depth - 1));
    });
    C(o, "relement", "button", (o) => {
      C(o, "-");
      C(o, "on", "click", {}, (e) => {
        C(o, "reduce", (s) => {
          C(op, s.n - 1 + "");
          C(op);
          return { ...s, n: s.n - 1 };
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
  ering,
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
  )
)(o);

Object.assign(window, { o, A, B, C });
