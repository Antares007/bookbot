"use strict";

var _scheduler = require("./scheduler");

// flow strict
let t = 0;
const schedule = (0, _scheduler.makeScheduler)(() => Date.now(), (f, d) => {
  setTimeout(f, d);
});
schedule(0, t => {
  const offset = 0 - t;

  const rec = (tag, d) => t => {
    console.log(tag);
    if (d > 0) schedule(0, rec(`A${tag}`, d - 1));
    if (d > 0) schedule(0, rec(`B${tag}`, d - 1));
  };

  schedule(0, rec('O', 3));
  schedule(1, rec('O', 3));
  schedule(2, rec('O', 3));
});