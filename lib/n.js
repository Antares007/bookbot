"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.text = exports.elm = exports.node = exports.patch = exports.N = exports.Patch = void 0;

var S = _interopRequireWildcard(require("./stream"));

var D = _interopRequireWildcard(require("./disposable"));

var M = _interopRequireWildcard(require("./m"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class Patch {
  constructor(patch) {
    this.patch = patch;
  }

}

exports.Patch = Patch;

class N {
  constructor(create, eq, pith) {
    this.create = create;
    this.eq = eq;
    this.patches = pith instanceof S.S ? S.switchLatest(pith.map(bark)) : bark(pith);
  }

}

exports.N = N;

function bark(pith) {
  return M.bark(o => {
    const pnodes = [];
    o(S.at(patch(parent => {
      const pnodesLength = pnodes.length;
      const childNodes = parent.childNodes;

      for (var index = 0; index < pnodesLength; index++) {
        const pi = pnodes[index];
        var li;

        for (var i = index, l = childNodes.length; i < l; i++) if (li = pi.eq(parent.childNodes[i])) break;

        if (li == null) parent.insertBefore(pi.create(), childNodes[index]);else if (i !== index) parent.insertBefore(li, childNodes[index]);
      }

      for (var i = childNodes.length - 1; i >= pnodesLength; i--) parent.removeChild(childNodes[i]);
    })));
    pith(v => {
      if (v instanceof S.S) o(v);else {
        const index = pnodes.length;
        pnodes.push(v);
        o(v.patches.map(p => patch(parent => p.patch(parent.childNodes[index]))));
      }
    });
  });
}

const patch = patch => new Patch(patch);

exports.patch = patch;

const node = (create, eq, pith) => new N(create, eq, pith);

exports.node = node;

const elm = (tag, pith, key) => {
  const TAG = tag.toUpperCase();
  return node(() => document.createElement(tag), n => n instanceof HTMLElement && n.nodeName === TAG && (key == null || n.dataset.key === key) ? n : null, pith);
};

exports.elm = elm;

const text = texts => node(() => document.createTextNode(''), n => n instanceof Text ? n : null, o => o((texts instanceof S.S ? texts : S.at(texts)).map(text => patch(n => {
  n.textContent = text;
}))));

exports.text = text;