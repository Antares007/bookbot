"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.empty = empty;
exports.cons = cons;

function empty() {
  return null;
}

function cons(a, l) {
  return [a, l];
}