"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scheduler = void 0;

var _scheduler = require("./scheduler.js");

var tl = _interopRequireWildcard(require("./timeline.js"));

var io = _interopRequireWildcard(require("./io.js"));

var s = _interopRequireWildcard(require("./stream.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const initDate = Date.now();
const scheduler = (0, _scheduler.mkScheduler)(() => Date.now() - initDate, f => setTimeout(f, 20));
exports.scheduler = scheduler;
const str = s.take(3, s.periodic(100));
s.run((v, t) => console.log("S", t, v), scheduler, s.join(s.at(300, s.join(s.fromArray([str]))))); // function doSomething() {
//   console.log(document.getElementById("root-node"))
// }
//
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", doSomething)
// } else {
//   doSomething()
// }