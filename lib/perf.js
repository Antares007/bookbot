"use strict";

var _scheduler = require("./scheduler.js");

var _stream = require("./stream.js");

var rxjs = _interopRequireWildcard(require("@reactivex/rxjs"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const scheduler = (0, _scheduler.mkScheduler)(() => Date.now(), (f, delay) => delay === 0 ? Promise.resolve().then(f) : setTimeout(f, delay));
const a = build(1000, 1000);
const b = build(1000, 1000);

const sum = (a, b) => a + b;

const rec = n => Promise.resolve().then(() => {
  console.log();
  const start = process.hrtime.bigint();
  return reduce(sum, 0, (0, _stream.flatMap)(_stream.fromArray, (0, _stream.fromArray)(a))).then(rez => console.log("a", process.hrtime.bigint() - start));
}) // .then(() => {
//   const start = process.hrtime.bigint()
//   return new Promise((resolve, reject) =>
//     rxjs.Observable.from(b)
//       .flatMap(a => rxjs.Observable.from(a))
//       .reduce(sum, 0)
//       .subscribe({
//         next: resolve,
//         complete: () => {},
//         error: reject
//       })
//   ).then(rez => console.log("b", process.hrtime.bigint() - start))
// })
.then(() => n > 0 ? rec(n - 1) : void 0);

rec(10);

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
    return s({
      event(t, a) {
        result = f(result, a);
      },

      end(t) {
        resolve(result);
      },

      error(t, err) {
        reject(err);
      }

    }, scheduler);
  });
}