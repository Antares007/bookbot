"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
exports.bark = bark;
exports.text = exports.ringOn = exports.elm = exports.node = exports.patch = exports.T = exports.Patch = void 0;

var S = _interopRequireWildcard(require("./S"));

var SPith = _interopRequireWildcard(require("./SPith"));

var D = _interopRequireWildcard(require("./disposable"));

var M = _interopRequireWildcard(require("./M"));

var On = _interopRequireWildcard(require("./on"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class Patch {
  constructor(patch) {
    this.patch = patch;
  }

}

exports.Patch = Patch;

class T extends SPith.T {
  constructor(create, eq, pith) {
    super(pith);
    this.create = create;
    this.eq = eq;
  }

}

exports.T = T;

function run(node, n) {
  const elm = n.eq(node) || node.insertBefore(n.create(), null);
  const patches = bark(n.pith);
  return patches.filter2(x => x instanceof Patch ? x.patch(elm) : x);
}

const patch = patch => new Patch(patch);

exports.patch = patch;

const node = (create, eq, pith) => new T(create, eq, pith);

exports.node = node;

const elm = (tag, pith, key) => {
  const TAG = tag.toUpperCase();
  return node(() => document.createElement(tag), n => n instanceof HTMLElement && n.nodeName === TAG && (key == null || n.dataset.key === key) ? n : null, pith);
};

exports.elm = elm;

const ringOn = pith => o => {
  var node;
  o(S.at(patch(n => (node = n, void 0))));
  const ref = S.s(os => {
    os(S.delay(function rec() {
      if (node) {
        os(S.event(node));
        os(S.delay(() => os(S.end)));
      } else os(S.delay(rec));
    }));
  });
  pith(o, {
    on: new On.On(ref),
    ref
  });
};

exports.ringOn = ringOn;

const text = texts => node(() => document.createTextNode(''), n => n instanceof Text ? n : null, o => o((texts instanceof S.T ? texts : S.at(texts)).map(text => patch(n => {
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
      if (v instanceof S.T) o(v);else {
        const index = pnodes.length;
        pnodes.push(v);
        const patches = v.pith instanceof S.T ? v.pith.flatMapLatest(ring) : ring(v.pith);
        o(patches.map(p => p instanceof Patch ? patch(parent => p.patch(parent.childNodes[index])) : p));
      }
    });
  });

  return pith instanceof S.T ? pith.flatMapLatest(ring) : ring(pith);
}