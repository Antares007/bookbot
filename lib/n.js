"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
exports.bark = bark;
exports.text = exports.onelm = exports.elm = exports.node = exports.patch = exports.N = exports.Patch = void 0;

var S = _interopRequireWildcard(require("./stream"));

var D = _interopRequireWildcard(require("./disposable"));

var M = _interopRequireWildcard(require("./m"));

var On = _interopRequireWildcard(require("./on"));

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
    this.pith = pith;
  }

}

exports.N = N;

function run(node, n) {
  const elm = n.eq(node) || node.insertBefore(n.create(), null);
  const patches = bark(n.pith);
  return patches.filter2(x => x instanceof Patch ? x.patch(elm) : x);
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

const onelm = (tag, pith, key) => {
  const ring = pith => o => {
    var thisN;
    const p = patch(n => {
      thisN = n;
    });
    o(S.s(o => o(S.delay(() => {
      o(S.event(p));
      o(S.delay(() => o(S.end)));
    }))));
    const on = new On.On(S.s(o => o(S.delay(() => {
      o(S.event(thisN));
      o(S.delay(() => o(S.end)));
    }))));
    const p0 = pith(on);
  };

  return elm(tag, pith instanceof S.S ? pith.flatMapLatest(ring) : ring(pith), key);
};

exports.onelm = onelm;

const text = texts => node(() => document.createTextNode(''), n => n instanceof Text ? n : null, o => o((texts instanceof S.S ? texts : S.at(texts)).map(text => patch(n => {
  n.textContent = text;
}))));

exports.text = text;

function bark(pith) {
  const ring = pith => M.bark(o => {
    const pnodes = [];
    o(S.at(patch(parent => {
      const pnodesLength = pnodes.length;
      const childNodes = parent.childNodes;

      for (var index = 0; index < pnodesLength; index++) {
        const n = pnodes[index];
        var li;

        for (var i = index, l = childNodes.length; i < l; i++) if (li = n.eq(parent.childNodes[i])) break;

        if (li == null) parent.insertBefore(n.create(), childNodes[index]);else if (i !== index) parent.insertBefore(li, childNodes[index]);
      }

      for (var i = childNodes.length - 1; i >= pnodesLength; i--) parent.removeChild(childNodes[i]);
    })));
    pith(v => {
      if (v instanceof S.S) o(v);else {
        const index = pnodes.length;
        pnodes.push(v);
        const patches = v.pith instanceof S.S ? v.pith.flatMapLatest(ring) : ring(v.pith);
        o(patches.map(p => p instanceof Patch ? patch(parent => p.patch(parent.childNodes[index])) : p));
      }
    });
  });

  return pith instanceof S.S ? pith.flatMapLatest(ring) : ring(pith);
}