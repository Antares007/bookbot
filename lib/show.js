"use strict";

var s = _interopRequireWildcard(require("./scheduler.js"));

var tl = _interopRequireWildcard(require("./timeline.js"));

var io = _interopRequireWildcard(require("./io.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var add = function add(a, b) {
  return a + b;
};

var l1 = tl.fromIO(add, function (o) {
  return function () {
    o([1, "A"]);
    o([2, "c"]);
    o([3, "h"]);
    o([4, "i"]);
    o([5, "k"]);
    o([6, "o"]);
  };
});
var l2 = tl.fromIO(add, io.omap(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      n = _ref2[0],
      s = _ref2[1];

  return [n * -1, s];
})(function (o) {
  return function () {
    o([2, "c"]);
    o([3, "h"]);
    o([4, "i"]);
    o([5, "k"]);
    o([6, "o"]);
    o([1, "A"]);
  };
}));
var l3 = tl.fromIO(add, io.omap(function (_ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      n = _ref4[0],
      s = _ref4[1];

  return [n * 10, s];
})(function (o) {
  return function () {
    o([1, "A"]);
    o([2, "c"]);
    o([3, "h"]);
    o([4, "i"]);
    o([5, "k"]);
    o([6, "o"]);
  };
}));
if (l1 == null || l2 == null || l3 == null) throw new Error("never");
var line = tl.mappend(add, l1, l2);
tl.show(line);
var rest = tl.runTo(add, -2, line)(function (x) {
  console.log(x);
})();
if (rest == null) throw new Error("never");
tl.show(rest);
var see = s.Delay(20)(function (o) {
  return function (i) {
    console.log(i);
    o(s.Delay(1000)(function (o) {
      return function (i) {
        console.log(i);
      };
    }));
  };
});
var run = s.mkScheduler(function () {
  return Date.now();
}, function (f) {
  setTimeout(f, 1000 / 30);
});
run(see);