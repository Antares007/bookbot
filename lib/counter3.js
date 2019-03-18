"use strict";

var S = _interopRequireWildcard(require("./stream"));

var N = _interopRequireWildcard(require("./n"));

var SN = _interopRequireWildcard(require("./sn"));

var On = _interopRequireWildcard(require("./on"));

var _scheduler = require("./scheduler");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const ref = o => {
  var node;
  o(S.at(N.patch(n => {
    node = n;
  })));
  return S.s(os => {
    os(S.delay(function rec() {
      if (node) {
        os(S.event(node));
        os((0, _scheduler.delay)(() => os(S.end)));
      } else os(S.delay(rec));
    }));
  });
};

const on = o => new On.On(ref(o));

const counter = d => SN.elm('div', o => {
  o(on(o).click().map(e => SN.r(s => s)).take(3));
  o(N.elm('button', o => {
    o(N.text('+'));
    o(S.at(SN.r(s => ({ ...s,
      n: s.n + 1
    }))));
    d > 0 && o(counter(d - 1));
  }));
  o(N.elm('button', o => {
    o(N.text(S.at('-')));
    d > 0 && o(counter(d - 1));
  }));
});

const n = counter(3);
const rootNode = document.getElementById('root-node');
if (!rootNode) throw new Error('cant find root-node');
const patches = [];
N.run(rootNode, n).run(console.log.bind(console)); // N.bark(n.pith).run(e => {
//   if (e instanceof Error) throw e
//   else if (e instanceof S.End) {
//     const t0 = now()
//     const run = () => {
//       const p = patches.shift()
//       if (p) {
//         p.value.patch(rootNode)
//         delay(run, ~~(1000 / 60))
//       }
//     }
//     delay(run)
//   } else {
//     patches.push(e)
//   }
// })