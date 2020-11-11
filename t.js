// @flow strict
const p = require("./src/p");
const { A, B, C } = require("./src/abc");
const { isIdentifierStart, isIdentifierChar } = require("./lib/id");
const pith = B(
  function ({ s: [t = "error", ...ss], ...rest }) {
    console.error(this);
  },
  function () {
    console.info(require("util").inspect(this, { depth: 10 }));
  }
);
const curry = B(({ f: [f, ...fs], ...rs }) =>
  B(function () {
    return A(f, ...fs, rs, this);
  })
);
const purry = C(curry, p, "purry");

const openBrace = C(curry, p, "anyOf", "{");
const closeBrace = C(curry, p, "anyOf", "}");
const colon = C(curry, p, "anyOf", ":");
const whitespace = C(curry, p, "anyOf", "\r\n\t ");

const Identifier: mixed = B(({ s: [input], f: [o] }) => {
  if (!isIdentifierStart(input.charCodeAt(0)))
    return C(o, "error", `not identifier start [${input[0]}]`);
  let len = 1;
  while (len < input.length && isIdentifierChar(input.charCodeAt(len))) len++;
  C(o, "Identifier", input.slice(0, len), len);
});

//identifier:
//  identifier_nondigit
//  identifier identifier_nondigit
//  identifier digit
//identifier_nondigit:
//  nondigit
//  universal_character_name
//  other implementation_defined characters
//nondigit: one of
//  _ a b c d e f g h i j k l m
//    A B C D E F G H I J K L M
//    n o p q r s t u v w x y z
//    N O P Q R S T U V W X Y Z
//digit: one of
//  0 1 2 3 4 5 6 7 8 9

({ a, b = 1, c: o, d: {}, ...r }) => {};

const ObjectProperty = B(({ s: [input], f: [o] }) => {});

const ObjectPattern = B(({ s: [input], f: [o] }) => {
  //const p = C(
  //  purry,
  //  C(curry, openBrace, input),
  //  ({ n, ...r }) => C(curry, closeBrace, input.slice(n[0]))
  //);
  //C(p, o);
  C(p, "and", openBrace, closeBrace, input, o);
});
console.log("________");
//C(ObjectPattern, pith, "{}");

C(
  purry,
  (o) => C(o, 1),
  ({ n: [v] }) => (o) => C(o, v * v + ""),
  ({ s: [v] }) => (o) => C(o, v + v)
)(pith);
