// flow strict
const ast = require("./ast");
const element = require("../src/element");
const b = element.bark(
  document.body || (document.body = document.createElement("body"))
);
function a(a1, b2, c3, q, w, e, r, t, y) {
  const a = 1;
  const obj1 = {
      method(a, v, c) {
        return a;
      },
      a: () => 42,
      b: function () {},
      c: function c() {},
      d: { a: 3, b: 4 },
    },
    obj2 = { aa: "bb" };
  function aa(a1, b2, c3) {
    const a = 1,
      b = 2;
  }
}
const code1 = require("fs").readFileSync(
  __dirname + "/../src/element.js",
  "utf8"
);
const code2 = a.toString();
b(ast(code2));
