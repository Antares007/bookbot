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
    dispose: () => {
      if (disposed) return;
      f();
      disposed = true;
    }
  };
}

function mappend(l, r) {
  return {
    dispose: () => {
      l.dispose();
      r.dispose();
    }
  };
}

const empty = {
  dispose: () => {}
};
exports.empty = empty;