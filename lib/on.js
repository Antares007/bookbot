"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.On = void 0;

var S = _interopRequireWildcard(require("./stream"));

var D = _interopRequireWildcard(require("./disposable"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class On {
  constructor(ets) {
    this.ets = ets;
  }

  event(name) {
    return this.ets.flatMap(et => S.s(o => {
      const handler = e => o(S.event(e));

      et.addEventListener(name, handler);
      o(D.disposable(() => et.removeEventListener(name, handler)));
    }));
  }

  click() {
    return this.ets.flatMap(et => S.s(o => {
      const handler = e => o(S.event(e));

      et.addEventListener('click', handler);
      o(D.disposable(() => et.removeEventListener('click', handler)));
    }));
  }

}

exports.On = On;