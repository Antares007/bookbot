"use strict";

var S = _interopRequireWildcard(require("./stream"));

var N = _interopRequireWildcard(require("./n"));

var _scheduler = require("./scheduler");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const counter = d => N.elm('div', o => {
  o(N.elm('button', o => {
    o(N.text('+'));
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
const patches = []; // N.run(rootNode, n)

N.bark(n.pith).run(e => {
  if (e instanceof Error) throw e;else if (e instanceof S.End) {
    const t0 = (0, _scheduler.now)();

    const run = () => {
      const p = patches.shift();

      if (p) {
        p.value.patch(rootNode);
        (0, _scheduler.delay)(run, ~~(1000 / 60));
      }
    };

    (0, _scheduler.delay)(run);
  } else {
    patches.push(e);
  }
});