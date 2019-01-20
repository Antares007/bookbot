"use strict";

var fs = _interopRequireWildcard(require("fs"));

var path = _interopRequireWildcard(require("path"));

var _stream = require("stream");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

drain(tap(n => console.log(n), take(25, ls(path.join(__dirname, ".."), { ...require("fs"),
  ...require("path")
}))));

function* ls(path, fs) {
  if (fs.statSync(path).isDirectory()) {
    for (let name of fs.readdirSync(path)) for (let x of ls(fs.join(path, name), fs)) yield x;
  } else {
    yield path;
  }
}

const r = new _stream.Readable({
  read() {//
  }

});

function drain(xs) {
  for (let x of xs) {}
}

function* tap(f, xs) {
  for (let x of xs) {
    f(x);
    yield x;
  }
}

function* take(n, xs) {
  if (n <= 0) return;
  let i = 0;

  for (let x of xs) {
    yield x;
    if (++i === n) return;
  }
}