// @flow strict
const E = require("./E3");
const { C } = require("./C3");

const o = E.pith((document.body = document.createElement("body")));
var state = { n: 0 };
const b = (nar) =>
  E.bark(o)(
    E.rring(function reduce(r) {
      const newstate = r(state);
      if (newstate !== state) {
        state = newstate;
        console.info(state);
      }
    })(nar)
  );
const ds = [0, 2, 2, 2, 3, 0];
setTimeout(function fib() {
  b(C(ds.shift()));
  ds.length && setTimeout(fib, 16.6);
}, 1000);
Object.assign(window, { o, b, C, E });

