// @flow strict
const { B, C } = require("./src/abc");
const id = require("./lib/id");
const tokens: mixed = B(

  function () {
    console.log("cant handle this ->", this);
  }
);
module.exports = tokens;
