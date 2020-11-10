// @flow strict
const { A, B, C } = require("../src/abc");
const makePith = require("../src/element2");

const o = C(makePith, document.body, 0);

const counter = B(({ n: [depth], f: [o] }) => {
  //C(o, "element", "button", ({ f: [o] }) => {
  //  C(o, '+');
  //});
  C(o, depth + '');
});

C(counter, 3, o);
Object.assign(window, {o,A,B,C})
