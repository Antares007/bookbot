"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disposable = disposable;
exports.empty = exports.Disposable = void 0;

class Disposable {
  constructor(dispose) {
    this.dispose = dispose;
  }

  dispose() {
    this.dispose();
  }

}

exports.Disposable = Disposable;

function disposable(dispose) {
  return new Disposable(dispose);
}

const empty = new Disposable(() => {});
exports.empty = empty;