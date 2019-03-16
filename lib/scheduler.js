"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findAppendPosition = findAppendPosition;
exports.delay = exports.now = void 0;

var D = _interopRequireWildcard(require("./disposable"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const nowf = () => Date.now();

const delayf = (f, d = 0) => {
  const timeoutID = setTimeout(f, d);
  return D.disposable(() => clearTimeout(timeoutID));
};

var line = [];
var nowT = -Infinity;
var nexT = +Infinity;
var d = null;

const now = () => {
  if (nowT !== nexT) {
    d && d.dispose();
    d = delayf(run, 0);
    var now = nowf();
    if (nowT > now) now = nowT;
    if (nexT < now) now = nexT;
    nowT = nexT = now;
  }

  return nowT;
};

exports.now = now;

const delay = (f, delay = 0) => {
  const at = delay < 0 ? now() : now() + delay;
  const ap = findAppendPosition(at, line);
  var li = line[ap];

  if (ap === -1 || li[0] !== at) {
    li = [at, []];
    line.splice(ap + 1, 0, li);
  }

  const index = li[1].push(f) - 1;
  return D.disposable(() => {
    li[1][index] = null;
  });
};

exports.delay = delay;

function run() {
  nowT = nexT;

  while (true) {
    const ap = findAppendPosition(nowT, line);
    if (ap === -1) break;
    const line_ = line;
    line = ap === line.length - 1 ? [] : line.slice(ap + 1);

    for (var i = 0; i <= ap; i++) {
      const [t, fs] = line_[i];

      for (var f of fs) f && f(t);
    }
  }

  if (line.length === 0) {
    nexT = +Infinity;
    d = null;
  } else {
    nexT = line[0][0];
    d = delayf(run, nexT - nowT);
  }
}

function findAppendPosition(n, line) {
  var l = 0;
  var r = line.length;

  while (true) {
    if (l < r) {
      const m = ~~((l + r) / 2) | 0;

      if (line[m][0] > n) {
        r = m;
        continue;
      } else {
        l = m + 1;
        continue;
      }
    } else {
      return l - 1;
    }
  }

  throw new Error('never');
}