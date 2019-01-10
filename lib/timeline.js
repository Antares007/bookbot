"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.show = show;
exports.fromIO = fromIO;
exports.mappend = mappend;
exports.runTo = runTo;
exports.toIO = toIO;
exports.getBounds = getBounds;

function show(tl) {
  var go = function go(tl) {
    if (tl.tag === "Line") {
      console.log(tl.line);
    } else {
      console.group("left");
      go(tl.left);
      console.groupEnd();
      console.group("right");
      go(tl.right);
      console.groupEnd();
    }
  };

  var bonds = getBounds(tl);
  console.group("TimeLine " + bonds[0] + " - " + bonds[1]);
  go(tl);
  console.groupEnd();
}

function fromIO(mappend, io) {
  var line = [];
  io(function (na) {
    var i = findAppendPosition(na[0], line);

    if (i > -1 && line[i][0] === na[0]) {
      line[i][1] = mappend(line[i][1], na[1]);
    } else {
      line.splice(i + 1, 0, na);
    }
  })();
  if (line.length === 0) return null;
  return {
    tag: "Line",
    line: line
  };
}

function mappend(mappend, left, right) {
  var leftBounds = getBounds(left);
  var rightBounds = getBounds(right);

  if (leftBounds[1] < rightBounds[0]) {
    return {
      tag: "LR",
      left: left,
      right: right
    };
  } else if (rightBounds[1] < leftBounds[0]) {
    return {
      tag: "LR",
      left: right,
      right: left
    };
  } else {
    var mtl = fromIO(mappend, function (o) {
      return function () {
        toIO(left)(o)();
        toIO(right)(o)();
      };
    });
    if (mtl != null) return mtl;
    throw new Error("never");
  }
}

function runTo(mappendt, n, tl) {
  return function (o) {
    return function () {
      if (tl.tag === "Line") {
        var ap = findAppendPosition(n, tl.line);
        if (ap === -1) return tl;

        for (var i = 0; i <= ap; i++) {
          o(tl.line[i]);
        }

        if (ap === tl.line.length - 1) return null;
        return {
          tag: "Line",
          line: tl.line.slice(ap + 1)
        };
      } else {
        var l = runTo(mappendt, n, tl.left)(o)();
        var r = runTo(mappendt, n, tl.right)(o)();
        if (l != null && r != null) return mappend(mappendt, l, r);
        if (l != null) return l;
        if (r != null) return r;
      }
    };
  };
}

function toIO(tl) {
  return function (o) {
    return function () {
      if (tl.tag === "Line") {
        for (var i = 0, l = tl.line.length; i < l; i++) {
          o(tl.line[i]);
        }
      } else {
        toIO(tl.left)(o)();
        toIO(tl.right)(o)();
      }
    };
  };
}

function getBounds(tl) {
  if (tl.tag === "Line") {
    return [tl.line[0][0], tl.line[tl.line.length - 1][0]];
  } else {
    return [getBounds(tl.left)[0], getBounds(tl.right)[1]];
  }
}

function findAppendPosition(n, line) {
  var l = 0;
  var r = line.length;

  while (true) {
    if (l < r) {
      var m = ~~((l + r) / 2) | 0;

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

  throw new Error("never");
}