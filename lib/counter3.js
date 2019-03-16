"use strict";

var S = _interopRequireWildcard(require("./stream"));

var P = _interopRequireWildcard(require("./pnode"));

var M = _interopRequireWildcard(require("./m"));

var _scheduler = require("./scheduler");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// flow strict-local
const elm = (tag, pith) => P.node(() => document.createElement(tag), n => n.nodeName === tag.toUpperCase(), P.bark(pith));

const text = stext => P.node(() => document.createTextNode(''), n => n.nodeName === '#text', stext.map(text => P.patch(n => {
  n.textContent = text;
})));

const counter = d => elm('div', o => {
  o(elm('button', o => {
    o(text(S.at('+')));
    d > 0 && o(counter(d - 1));
  }));
  o(elm('button', o => {
    o(text(S.at('-')));
    d > 0 && o(counter(d - 1));
  }));
});

const rootNode = document.getElementById('root-node');
if (!rootNode) throw new Error('cant find root-node');
const patches = [];
P.bark(o => o(counter(3))).run(e => {
  if (e instanceof Error) throw e;else if (e instanceof S.End) {
    const t0 = (0, _scheduler.now)();

    const run = () => {
      const p = patches.shift();

      if (p) {
        p.value.v(rootNode);
        (0, _scheduler.delay)(run, 100);
      }
    };

    (0, _scheduler.delay)(run);
  } else {
    patches.push(e);
  }
});