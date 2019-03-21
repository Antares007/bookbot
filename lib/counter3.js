"use strict";

var S = _interopRequireWildcard(require("./S"));

var SPith = _interopRequireWildcard(require("./SPith"));

var N = _interopRequireWildcard(require("./N"));

var SN = _interopRequireWildcard(require("./SN"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const counter = d => SN.elm('div', o => {
  o(N.elm('button', SPith.pmap(N.ringOn, (o, {
    on
  }) => {
    o(N.text('+'));
    o(on.click().take(3).map(e => SN.r(s => ({ ...s,
      n: s.n + 1
    }))));
    d > 0 && o(counter(d - 1));
  })));
  o(N.elm('button', o => {
    o(N.text(S.at('-')));
    d > 0 && o(counter(d - 1));
  }));
});

const napp = counter(3);
const rootNode = document.getElementById('root-node');
if (!rootNode) throw new Error('cant find root-node');
N.run(rootNode, napp).run(console.log.bind(console));
const patches = []; // N.bark(n.pith).run(e => {
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