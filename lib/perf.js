"use strict";

var _scheduler = require("./scheduler.js");

var _stream = require("./stream.js");

var rxjs = _interopRequireWildcard(require("@reactivex/rxjs"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const scheduler = (0, _scheduler.mkRun)(() => Date.now(), (f, delay) => setTimeout(f, delay));
const a = build(1000, 1000);
Promise.resolve().then(() => {
  console.time("a");
  return reduce((a, b) => a + b, 0, (0, _stream.chain)(_stream.fromArray, (0, _stream.fromArray)(a))).then(rez => {
    console.timeEnd("a");
    console.log(rez);
  });
}).then(() => {
  console.time("b");
  rxjs.Observable.from(a).flatMap(function (x) {
    return rxjs.Observable.from(x);
  }).reduce((a, b) => a + b, 0).subscribe({
    next: rez => {
      console.log(rez);
    },
    complete: function () {
      console.timeEnd("b");
    },
    error: e => {}
  });
});

function build(m, n) {
  const a = new Array(n);

  for (let i = 0; i < a.length; ++i) {
    a[i] = buildArray(i * 1000, m);
  }

  return a;
}

function buildArray(base, n) {
  const a = new Array(n);

  for (let i = 0; i < a.length; ++i) {
    a[i] = base + i;
  }

  return a;
}

function reduce(f, initial, s) {
  return new Promise((resolve, reject) => {
    let result = initial;
    s({
      event(v, t) {
        result = f(result, v);
      },

      end(v) {
        resolve(result);
      },

      error(v) {
        reject(v);
      }

    }, scheduler);
  });
}