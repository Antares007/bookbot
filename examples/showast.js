// @flow strict
const ast = require("./ast");
const element = require("../src/element");
const b = element.bark(
  document.body || (document.body = document.createElement("body"))
);
b(ast("for(let i =0;i<100;++i) a=(a+b)*o"));
