"use strict";

var _test = require("./test.js");

var _fs = require("fs");

var _path = require("path");

var _require = require;
var dirmap = {};

var isdir = function isdir(path) {
  if (dirmap[path]) return true;
  dirmap[path] = (0, _fs.statSync)(path).isDirectory();
  return dirmap[path];
};

var isTlike = function isTlike(path) {
  return (0, _path.extname)(path) === ".js" || isdir(path);
};

var isT = function isT(e) {
  if (e == null) return false;
  return e.tag === "Test" && typeof e.name === "string" && typeof e.f === "function" || e.tag === "Ring" && typeof e.name === "string" && typeof e.io === "function";
};

function fs2io(path) {
  if (isdir(path)) {
    var entries = (0, _fs.readdirSync)(path);
    return function (o) {
      return function () {
        for (var i = 0, l = entries.length; i < l; i++) {
          if (isTlike) o((0, _test.Ring)(entries[i], fs2io((0, _path.join)(path, entries[i]))));
        }
      };
    };
  } else {
    return function (o) {
      return function () {
        var e = _require(path).default;

        if (isT(e)) o(e);
      };
    };
  }
}

var p = (0, _path.join)(__dirname, "..", process.argv[3]);
if (!isTlike(p)) throw new Error("path [".concat(p, "] is not T like"));
var rez = (0, _test.run)((0, _test.Ring)((0, _path.basename)(p), fs2io(p)));
console.log(rez);
if (rez[1] > 0) process.exitCode = 1;