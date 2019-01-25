"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.awaitPromises = awaitPromises;
exports.filter = filter;
exports.map = map;
exports.take = take;
exports.reduce = reduce;

function awaitPromises(o, it) {
  let i = 0;
  return reduce((pv, pa) => pv.then(() => pa.then(o)), Promise.resolve(), it).then(() => o(null), err => o(err));
}

function* filter(f, xs) {
  for (let x of xs) if (f(x)) yield x;
}

function* map(f, bs) {
  for (let a of bs) yield f(a);
}

function* take(n, xs) {
  if (n <= 0) return;
  let i = 0;

  for (let x of xs) {
    yield x;
    if (++i === n) return;
  }
}

function reduce(f, s, as) {
  let b_ = s;

  for (let a of as) b_ = f(b_, a);

  return b_;
}