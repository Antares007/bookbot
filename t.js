// @flow strict
const p = require("./src/p");
const { A, B, C } = require("./src/abc");
const { isIdentifierStart, isIdentifierChar } = require("./lib/id");
const pid: mixed = B(({ s: [input], f: [o] }) => {
  if (!isIdentifierStart(input.charCodeAt(0)))
    return C(o, "error", "not identifier start", input[0]);
  let len = 1;
  while (len < input.length && isIdentifierChar(input.charCodeAt(len))) len++;
  C(o, "pid", len);
});
const pith = B(
  function ({ s: [t = "error", ...ss], ...rest }) {
    console.error(this);
  },
  function ({ s: [...toks], n: [...lens], ...rest }) {
    console.log(toks, lens, rest);
    console.info(this);
  }
);
const curry = B(({ f: [f, ...fs], ...rs }) =>
  B(function () {
    return A(f, ...fs, rs, this);
  })
);
//const openBrace = C(curry, pany)
const ObjectProperty = B();
const ObjectPattern = B(({ s: [input], f: [o] }) => {
  //const p = C(
  //  purry,
  //  ({ f: [o] }) => C(and, openbrace, C(many, whitespace)),
  //  ({ n, ...r }) => ({ f: [o] }) => C(many, ObjectProperty)
  //);
  //C(p, o);
});
console.log("________");
C(C(
  p,
  "purry",
  ({ f: [o] }) => C(o, 9),
  ({n:[v]})=>({ f: [o] }) => C(o, v*v),
),function(a){console.log(a)});
const f = B(
  ({ s: [m = "str", match, input], f: [o] }) => 1,
  ({ s: [m = "str", nan], f: [o] }) => 2,
  ({ s: [m = "anyof"], n: [n], f: [o] }) => 3,
  () => 9
);
const zmuki = C(curry, f, "str", "zmuki");
console.log(C(zmuki, "in", B()));
console.log(C(zmuki, B()));
C(ObjectPattern, pith, "{}");

//
// ns = { s:[''], n:[1] }
// {n[1]o[{n[1]},{},...]}
//
//
///C(
///  C(
///    purry,
///    B(({ f: [o] }) => C(o, "hello")),
///    B(({ s: [s], f: [o] }) => C(o, s.length)),
///    B(({ n: [n], f: [o] }) => C(o, n + n + "")),
///    B(({ s: [s], f: [o] }) => C(o, s + "okeeey")),
///    B(({ s: [s], f: [o] }) => C(o, s + "babe"))
///  ),
///  B(function () {
///    console.log(this.s);
///  })
///);
//C(
//  C(por, C(pand, pid, pspace, pid, pspace), C(pand, pspace, pid, pspace, pid)),
//  pith,
//  " aaa bbb ccc ddd eee{_ა9d"
//);
///C(C(pstr, "abo"), pith, "abo");
