"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
exports.r = exports.elm = exports.T = exports.R = void 0;

var S = _interopRequireWildcard(require("./S"));

var D = _interopRequireWildcard(require("./disposable"));

var N = _interopRequireWildcard(require("./N"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class R {
  constructor(r) {
    this.r = r;
  }

}

exports.R = R;

class T extends N.T {
  constructor(create, eq, pith) {
    super(create, eq, pith);
  }

}

exports.T = T;

const elm = (tag, pith, key) => {
  const TAG = tag.toUpperCase();
  return new T(() => document.createElement(tag), n => n instanceof HTMLElement && n.nodeName === TAG && (key == null || n.dataset.key === key) ? n : null, pith);
};

exports.elm = elm;

function run(node, s, n) {
  return N.run(node, n).scan((s, r) => r.r(s), s);
}

const r = f => new R(f);

exports.r = r;