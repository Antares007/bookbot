"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bark = bark;

var S = _interopRequireWildcard(require("./stream"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function bark(pith) {
  var rez = S.empty();
  pith(s => {
    rez = rez.merge(s);
  });
  return rez;
} // // see::S<(number | string | boolean)>
// let see = bark(o => {
//   o(S.at(1))
//   o(
//     bark(o => {
//       o(S.at('2'))
//       o(
//         bark(o => {
//           o(S.at(1))
//           o(
//             bark(o => {
//               o(S.at('2'))
//               o(S.at(true))
//             })
//           )
//         })
//       )
//       o(S.at(true))
//     })
//   )
// })