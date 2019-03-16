"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bark = bark;
exports.StrT = exports.ElmT = exports.SDR = void 0;

var S = _interopRequireWildcard(require("./stream"));

var P = _interopRequireWildcard(require("./pnode"));

var _on = require("./on");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// flow strict
class SDR {
  constructor(r) {
    this.r = r;
  }

}

exports.SDR = SDR;

class ElmT {
  constructor(tag, ray, key) {
    this.tag = tag.toUpperCase();
    this.key = key;
    this.ray = ray;
  }

}

exports.ElmT = ElmT;

class StrT {
  constructor(texts) {
    this.texts = texts;
  }

}

exports.StrT = StrT;

function bark(s, pith) {
  let see = P.bark((o, ref) => {});
  return see; //.map(x => x)
}