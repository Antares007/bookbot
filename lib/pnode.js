"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.elm = exports.node = exports.patch = exports.N = exports.R = void 0;

var S = _interopRequireWildcard(require("./stream"));

var D = _interopRequireWildcard(require("./disposable"));

var M = _interopRequireWildcard(require("./m"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class R {
  constructor(v) {
    this.v = v;
  }

}

exports.R = R;

class N {
  constructor(create, eq, pith) {
    this.create = create;
    this.eq = eq;
    this.rs = pith instanceof S.S ? S.switchLatest(pith.map(pith => bark(ring(pith)))) : bark(ring(pith));

    function ring(pith) {
      return o => {
        pith(v => {
          o(v);
        });
      };
    }
  }

} // function makeStore(storeClass: Class<NodeT>) {
//   return new storeClass()
// }


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

        for (var i = index, l = childNodes.length; i < l; i++) if (pi.eq(li = parent.childNodes[i])) break;else li = null;

        if (li == null) parent.insertBefore(pi.create(), childNodes[index]);else if (i !== index) parent.insertBefore(li, childNodes[index]);
      }

      for (var i = childNodes.length - 1; i >= pnodesLength; i--) parent.removeChild(childNodes[i]);
    })));
    pith(v => {
      if (v instanceof S.S) o(v);else {
        const index = pnodes.length;
        pnodes.push(v);
        o(v.rs.map(p => patch(parent => p.v(parent.childNodes[index]))));
      }
    });
  });
}

const patch = v => new R(v);

exports.patch = patch;

const node = (create, eq, pith) => new N(create, eq, pith);

exports.node = node;

const elm = (tag, pith) => {
  return node(() => document.createElement(tag), n => n instanceof HTMLElement && n.nodeName === tag.toUpperCase() ? n : null, pith);
};

exports.elm = elm;

const text = texts => node(() => document.createTextNode(''), n => n instanceof Text ? n : null, o => o(texts.map(text => patch(n => {
  n.textContent = text;
}))));

elm('div', o => {
  o(elm('button', o => {
    o(S.at(patch(node => {})));
    o(text(S.at('')));
  }));
  o(S.at(patch(node => {})));
  o(text(S.at('')));
});