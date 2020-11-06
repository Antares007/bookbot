// @flow strict
const { A, B, C } = require("./src/abc");
const id = require("./lib/id");

export type n3<OT: {} = {}> = {
  n: number[],
  s: string[],
  b: boolean[],
  u: void[],
  f: mixed[],
  o: OT[],
};
const pstr = B(({ s: [match] }: n3<>) =>
  B(({ s: [input], f: [o] }: n3<>) => {
    let i = 0;
    while (i < match.length && match[i] === input[i]) i++;
    if (i === match.length) C(o, "pstr", i);
    else C(o, "error", "cant match", match);
  })
);
const purry = B(
  ({ f: [f] }) => f,
  ({ f: funs }) =>
    B(({ f: [o] }) => {
      var i = 0;
      const pith = B(
        function ({ s: [t = "error", ...ss], ...rest }) {
          A(o, this);
        },
        function () {
          A(funs[i++], this, i < funs.length ? pith : o);
        }
      );
      C(funs[i++], pith);
    })
);
C(
  C(
    purry,
    B(({ f: [o] }) => C(o, "hello")),
    B(({ s: [s], f: [o] }) => C(o, s.length)),
    B(({ n: [n], f: [o] }) => C(o, n + n + "")),
    B(({ s: [s], f: [o] }) => C(o, s + "okeeey")),
    B(({ s: [s], f: [o] }) => C(o, s + "babe"))
  ),
  B(function () {
    console.log(this.s);
  })
);
const pid = B(({ s: [input], f: [o] }) => {
  if (!id.isIdentifierStart(input.charCodeAt(0)))
    return C(o, "error", "not identifier start", input[0]);
  let i = 1;
  while (i < input.length && id.isIdentifierChar(input.charCodeAt(i))) i++;
  C(o, "pid", i);
});
const pspace = B(function ({ s: [input], f: [o] }) {
  if (input[0] === " ") C(o, "pspace", 1);
  else C(o, "error", "not a space", input[0]);
});
const pand = B(
  ({ f: [f] }) => f,
  ({ f: funs }) =>
    B(function ({ s: [input], f: [o] }) {
      var i = 0;
      var length = 0;
      const toks = [];
      const lens = [];
      const pith = B(
        function ({ s: [t = "error", ...ss], ...rest }) {
          o(this);
        },
        function ({ s: [tok, ...subtoks], n: [len, ...sublens] }) {
          length += len;
          toks.push(tok);
          lens.push(len);
          if (i < funs.length) C(funs[i++], input.slice(length), pith);
          else C(o, "pand", length, ...toks, ...lens);
        }
      );
      C(funs[i++], input, pith);
    })
);
const por = B(
  ({ f: [f] }) => f,
  ({ f: funs }) =>
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
);

const pith = B(
  function ({ s: [t = "error", ...ss], ...rest }) {
    console.error(this);
  },
  function ({ s: [...toks], n: [...lens], ...rest }) {
    console.log(toks, lens, rest);
    console.info(this);
  }
);
C(
  C(por, C(pand, pid, pspace, pid, pspace), C(pand, pspace, pid, pspace, pid)),
  pith,
  " aaa bbb ccc ddd eee{_ა9d"
);
C(C(pstr, "abo"), pith, "abo");
