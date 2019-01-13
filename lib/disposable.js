"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rtrn = rtrn;
exports.mappend = mappend;
exports.empty = void 0;

function rtrn(f) {
  var disposed = false;
  return {
    dispose: function dispose() {
      if (disposed) return;
      f();
      disposed = true;
    }
  };
}

function mappend(l, r) {
  return {
    dispose: function dispose() {
      l.dispose();
      r.dispose();
    }
  };
}

var empty = {
  dispose: function dispose() {}
};
exports.empty = empty;