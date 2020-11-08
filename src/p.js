// @flow strict
const { A, B, C } = require("./abc");
module.exports = (B(
  ({ s: [t = "purry"], f: [f] }) => f,
  ({ s: [t = "purry"], f: funs }) =>
    B(({ f: [o] }) => {
      var i = 0;
      const pith = B(
        function ({ s: [t = "error", ...ss], ...rest }) {
          A(o, this);
        },
        function () {
          C(A(funs[i++], this), i < funs.length ? pith : o);
        }
      );
      C(funs[i++], pith);
    }),
  ({ s: [t = "all"], f: [f] }) => f,
  ({ s: [t = "all"], f: funs }) =>
    B(({ f: [o] }) => {
      var done = false;
      var l = funs.length;
      const rs = Array(l);
      funs.forEach((nar, i) => {
        if (done) return;
        C(
          nar,
          B(
            function ({ s: [t = "error", ...ss], ...rest }) {
              if (done) return;
              done = true;
              A(o, this);
            },
            function () {
              if (done) return;
              rs[i] = this;
              if (--l === 0) A(o, ...rs);
            }
          )
        );
      });
    }),
  ({ s: [t = "race"], f: [f] }) => f,
  ({ s: [t = "race"], f: funs }) =>
    B(({ f: [o] }) => {
      var done = false;
      var l = funs.length;
      const pith = B(
        function ({ s: [t = "error", ...ss], ...rest }) {
          if (done) return;
          if (--l === 0) A(o, this);
        },
        function () {
          if (done) return;
          done = true;
          A(o, this);
        }
      );
      funs.forEach((nar) => {
        if (done) return;
        C(nar, pith);
      });
    }),

  ({ s: [t = "str", match, input], f: [o] }) => {
    let len = 0;
    while (len < match.length && match[len] === input[len]) len++;
    if (len === match.length) C(o, "pstr", len);
    else C(o, "error", `cant match string "${match}"`);
  },
  ({ s: [t = "anyOf", chars, input], f: [o] }) =>
    chars.includes(input[0])
      ? C(o, 1)
      : C(o, "error", `cant match anyof [${chars}]`),
  ({ s: [t = "noneOf", chars, input], f: [o] }) =>
    !chars.includes(input[0])
      ? C(o, 1)
      : C(o, "error", `cant match noneof [${chars}]`),
  ({ s: [t = "many", input], f: [nar, o] }) => {
    var length = 0;
    const toks = [];
    const pith = B(
      function ({ s: [t = "error", ...ss], ...rest }) {
        C(o, length, ...toks);
      },
      function ({ n, ...rest }) {
        if (n[0] === 0) return A(o, this);
        toks.push(this);
        length += n[0];
        C(nar, input.slice(length), pith);
      }
    );
    C(nar, input.slice(length), pith);
  },
  ({ s: [t = "and"], f: [f] }) => f,
  ({ s: [t = "and"], f: funs }) =>
    B(function ({ s: [input], f: [o] }) {
      var i = 0;
      var length = 0;
      const toks = [];
      const pith = B(
        function ({ s: [t = "error", ...ss], ...rest }) {
          A(o, this);
        },
        function ({ n, ...rest }) {
          length += n[0];
          toks.push(this);
          if (i < funs.length) C(funs[i++], input.slice(length), pith);
          else C(o, length, ...toks);
        }
      );
      C(funs[i++], input, pith);
    }),
  ({ s: [t = "or"], f: [f] }) => f,
  ({ s: [t = "or"], f: funs }) =>
    B(({ s: [input], f: [o] }) => {
      var i = 0;
      const pith = B(
        function ({ s: [t = "error", ...ss], ...rest }) {
          if (i < funs.length) C(funs[i++], input, pith);
          else o(this);
        },
        function ({ s, n }) {
          o(this);
        }
      );
      C(funs[i++], input, pith);
    })
): mixed);
