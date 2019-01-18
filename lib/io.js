"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.omap = omap;

function omap(f) {
  return function (io) {
    return function (o) {
      return function (i) {
        return io(function (a) {
          return o(f(a));
        })(i);
      };
    };
  };
}