"use strict";

var S = _interopRequireWildcard(require("./stream"));

var P = _interopRequireWildcard(require("./pnode"));

var D = _interopRequireWildcard(require("./dom"));

var _scheduler = require("./scheduler");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// flow
const pmap = (key, b, pith) => D.pith((o, on, s) => pith.pith(v => {
  if (v instanceof S.T) o(v.map(x => x instanceof D.RT ? D.r(a => ({ ...a,
    [key]: x.r(a[key] || b)
  })) : x));else if (v instanceof D.ElmT) o(D.elm(v.tag, v.piths.map(pith => pmap(key, b, pith)), v.key));else o(v);
}, on, s.map(x => {
  if (typeof x[key] === 'object') return x[key];
  return b;
})));

const emap = (key, b, elm) => D.elm(elm.tag, elm.piths.map(pith => pmap(key, b, pith)), elm.key);

const Counter = d => D.elm('div', D.pith((o, on, s) => {
  o(D.elm('button', (o, on, s) => {
    o(D.str('+'));
    o(on.click().map(_ => D.r(s => ({ ...s,
      n: s.n + 1
    }))));
    d > 0 && o(emap('+', {
      n: 0
    }, Counter(d - 1)));
  }));
  o(D.elm('button', (o, on, s) => {
    o(D.str('-'));
    o(on.click().map(_ => D.r(s => ({ ...s,
      n: s.n - 1
    }))));
    d > 0 && o(emap('-', {
      n: 0
    }, Counter(d - 1)));
  }));
  o(D.str('0'));
}));

const rootNode = document.getElementById('root-node');
if (!rootNode) throw new Error('cant find root-node');
D.run(S.at(D.pith(o => o(Counter(1))))).scan((s, x) => {
  if (x instanceof P.PatchT) {
    x.v(rootNode);
    return s;
  }

  return x.r(s);
}, {
  n: 0
}).skipEquals().run(e => {
  if (e instanceof Error) console.error(e);else if (e instanceof S.End) console.log('The end');else console.log(JSON.stringify(e.value, null, '  '));
});