"use strict";

var s = _interopRequireWildcard(require("./stream"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// flow strictlocal
function blob(s) {
  return {
    type: 'blob',
    s
  };
}

function tree(s) {
  return {
    type: 'blob',
    s
  };
} // function run(jsgit: any, v: O): S.Tha1> {
//   if (v.type === 'blob') {
//     return s.flatMap(buffer => s.empty, v.s)
//   } else if (v.type === 'tree') {
//     return s.flatMap(buffer => s.empty, v.s)
//   }
//   return s.empty
// }


const modes = require('js-git/lib/modes'); // const memdb: () => JsGit = require("js-git/mixins/mem-db")
//


const a = 42;