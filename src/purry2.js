const { A, B, C } = require("./abc");
const purry = B(
  ({ f: [onar] }) => onar,
  ({ f: [onar, ...bnars] }) => (o) => {
    var i = 0;
    const pith = B(
      function ({ s: [t = "error", ...ss], ...rest }) {
        o(this);
      },
      function () {
        bnars[i++](this)(i < bnars.length ? pith : o);
      }
    );
    onar(pith);
  },
  ({ s: [t = "catch"], f: [onar] }) => onar,
  ({ s: [t = "catch"], f: [onar, cnar, ...bnars] }) => (o) => {
    var i = 0;
    const pith = B(
      function ({ s: [t = "error", ...ss], ...rest }) {
        C(purry, cnar(this), ...bnars)(o);
      },
      function () {
        C(purry, (o) => o(this), ...bnars)(o);
      }
    );
    onar(pith);
  },
  ({ s: [t = "all"], f: [onar] }) => onar,
  ({ s: [t = "all"], f: funs }) => (o) => {
    var done = false;
    var l = funs.length;
    const rs = Array(l);
    funs.forEach((nar, i) => {
      if (done) return;
      nar(
        B(
          function ({ s: [t = "error", ...ss], ...rest }) {
            if (done) return;
            done = true;
            o(this);
          },
          function () {
            if (done) return;
            rs[i] = this;
            if (--l === 0) C(o, ...rs);
          }
        )
      );
    });
  },
  ({ s: [t = "race"], f: [f] }) => f,
  ({ s: [t = "race"], f: funs }) => (o) => {
    var done = false;
    var l = funs.length;
    const pith = B(
      function ({ s: [t = "error", ...ss], ...rest }) {
        if (done) return;
        if (--l === 0) o(this);
      },
      function () {
        if (done) return;
        done = true;
        o(this);
      }
    );
    funs.forEach((nar) => {
      if (done) return;
      nar(pith);
    });
  }
);
module.exports = purry;
