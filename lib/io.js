"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.omap = omap;

function omap(f) {
  return io => o => i => io(a => o(f(a)))(i);
}