"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
exports.r = exports.pith = exports.str = exports.elm = exports.RT = exports.PithT = exports.StrT = exports.ElmT = void 0;

var S = _interopRequireWildcard(require("./stream"));

var P = _interopRequireWildcard(require("./pnode"));

var _on = require("./on");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// flow strict
class ElmT {
  constructor(tag, piths, key) {
    this.tag = tag.toUpperCase();
    this.key = key;
    this.piths = piths;
  }

}

exports.ElmT = ElmT;

class StrT {
  constructor(texts) {
    this.texts = texts;
  }

}

exports.StrT = StrT;

class PithT {
  constructor(pith) {
    this.pith = pith;
  }

}

exports.PithT = PithT;

class RT {
  constructor(r) {
    this.r = r;
  }

}

exports.RT = RT;

const elm = (tag, piths, key) => new ElmT(tag, (piths instanceof S.T ? piths : S.at(piths)).map(x => x instanceof PithT ? x : pith(x)), key);

exports.elm = elm;

const str = texts => new StrT(texts instanceof S.T ? texts : S.at(texts));

exports.str = str;

const pith = pith => new PithT(pith);

exports.pith = pith;

const r = r => new RT(r);

exports.r = r;

function run(piths) {
  const ring = pith => P.pith((o, ns) => {
    pith.pith(v => {
      if (v instanceof StrT) {
        o(P.node(() => document.createTextNode(''), n => n.nodeName === '#text', S.at(P.pith(o => o(v.texts.map(text => P.patch(n => {
          n.textContent = text;
        })))))));
      } else if (v instanceof ElmT) {
        o(P.node(() => {
          const elm = document.createElement(v.tag);
          if (v.key) elm.dataset.key = v.key;
          return elm;
        }, n => n.nodeName === v.tag && (v.key == null || n instanceof HTMLElement && n.dataset.key === v.key), v.piths.map(ring)));
      } else {
        o(v);
      }
    }, new _on.On(ns), S.s(() => {}));
  });

  return P.run(piths.map(ring));
}