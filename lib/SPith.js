"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.T = exports.pmap = void 0;

var S = _interopRequireWildcard(require("./S"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const pmap = (f, pith) => pith instanceof S.T ? pith.map(f) : f(pith);

exports.pmap = pmap;

class T {
  constructor(pith) {
    this.pith = pith;
  }

}

exports.T = T;