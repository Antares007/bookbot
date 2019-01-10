"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rtrn = rtrn;
exports.mappend = mappend;

function rtrn(f) {
  var disposed = false;
  return function () {
    if (disposed) return;
    f();
    disposed = true;
  };
}

function mappend(l, r) {
  return function () {
    l();
    r();
  };
}