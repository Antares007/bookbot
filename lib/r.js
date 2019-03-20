"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.String = String;
exports.Number = Number;
exports.Boolean = Boolean;
exports.KV = KV;
exports.Pith = Pith;
exports.RPith = exports.RKV = exports.RBoolean = exports.RNumber = exports.RString = void 0;

var S = _interopRequireWildcard(require("./S"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class RString {
  constructor(r) {
    this.r = r;
  }

}

exports.RString = RString;

function String(r) {
  return new RString(r);
}

class RNumber {
  constructor(r) {
    this.r = r;
  }

}

exports.RNumber = RNumber;

function Number(r) {
  return new RNumber(r);
}

class RBoolean {
  constructor(r) {
    this.r = r;
  }

}

exports.RBoolean = RBoolean;

function Boolean(r) {
  return new RBoolean(r);
} //export class RObject<A: { [string]: mixed }> {
//  r: mixed => A
//  constructor(
//    a: A,
//    pith: (
//      (SS<RKV<string, RString | RNumber | RBoolean | RObject | RArray>>) => void
//    ) => void
//  ) {
//    this.r = n => {
//      if (n) {
//        n.b
//      }
//      return { a: 1 }
//    }
//  }
//}
//export function Object(pith: $PropertyType<RObject, 'pith'>): RObject {
//  return new RObject(pith)
//}
//
//export class RArray {
//  pith: S.S<RPith<number, mixed>>
//  constructor(pith: $PropertyType<RArray, 'pith'>) {
//    this.pith = pith
//  }
//}
//export function Array(pith: $PropertyType<RArray, 'pith'>): RArray {
//  return new RArray(pith)
//}


S.at(n => n).map(r => s => ({ ...s,
  z: r(s.z)
})).map(r => s => ({ ...s,
  b: r(s.b)
})).scan((s, r) => r(s), {
  a: 43,
  b: {
    o: '1',
    z: true
  }
});
Pith(o => {
  o(S.at(KV('a', S.at(Number(n => n || 0)))));
  o(S.at(KV('o', S.at(Pith(o => {
    const see = S.at(KV(1, S.at(Number(n => n || 0))));
    o(see);
  })))));
});

class RKV {
  constructor(k, v) {
    this.k = k;
    this.v = v;
  }

}

exports.RKV = RKV;

function KV(k, v) {
  return new RKV(k, v);
}

class RPith {
  constructor(pith) {
    this.pith = pith;
  }

}

exports.RPith = RPith;

function Pith(pith) {
  return new RPith(pith);
}