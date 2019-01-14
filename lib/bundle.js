"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rtrn = rtrn;
exports.mappend = mappend;
exports.empty = void 0;

function rtrn(f) {
  var disposed = false;
  return {
    dispose: function dispose() {
      if (disposed) return;
      f();
      disposed = true;
    }
  };
}

function mappend(l, r) {
  return {
    dispose: function dispose() {
      l.dispose();
      r.dispose();
    }
  };
}

var empty = {
  dispose: function dispose() {}
};
exports.empty = empty;
"use strict";

function handleResponse(response) {
  if (response.success) {
    var value = response.value; // Works!
  } else {
    var error = response.error; // Works!
  }
}

var a = function a(o) {
  return function (i) {
    o(i + 1 + "");
    return true;
  };
};

a(function (v) {
  return console.log(v);
})(1);

var see = function see(o) {
  return function (i) {};
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.omap = omap;

function omap(f) {
  return function (io) {
    return function (o) {
      return function (i) {
        return io(function (a) {
          return o(f(a));
        })(i);
      };
    };
  };
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mkScheduler = mkScheduler;
exports.Delay = exports.Origin = exports.Local = void 0;

var disposable = _interopRequireWildcard(require("./disposable.js"));

var timeLine = _interopRequireWildcard(require("./timeline.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var Local = function Local(io) {
  return {
    tag: "Local",
    io: io
  };
};

exports.Local = Local;

var Origin = function Origin(io) {
  return {
    tag: "Origin",
    io: io
  };
};

exports.Origin = Origin;

var Delay = function Delay(delay) {
  return function (io) {
    return {
      tag: "Delay",
      delay: delay,
      io: io
    };
  };
};

exports.Delay = Delay;

var cancelOffsetRing = function cancelOffsetRing(canceled, offset, io) {
  return function (o) {
    return function (i) {
      return canceled.value ? void 0 : io(function (v) {
        switch (v.tag) {
          case "Local":
            o(Local(cancelOffsetRing(canceled, 0 - i, v.io)));
            break;

          case "Origin":
            o(Origin(cancelOffsetRing(canceled, 0, v.io)));
            break;

          case "Delay":
            o(Delay(v.delay)(cancelOffsetRing(canceled, offset, v.io)));
            break;

          default:
            throw new Error("never");
        }
      })(i + offset);
    };
  };
};

var runAllNows = function runAllNows(pair) {
  return function (oo) {
    return function () {
      var ring = function ring(io) {
        return function (o) {
          return function () {
            io(function (v) {
              switch (v.tag) {
                case "Local":
                case "Origin":
                  ring(v.io)(oo)();
                  break;

                case "Delay":
                  o([v.delay + pair[0], v.io]);
                  break;

                default:
                  throw new Error("never");
              }
            })(pair[0]);
          };
        };
      };

      ring(pair[1])(oo)();
    };
  };
};

function mkScheduler(tf, requestNextFrame) {
  var now = -1;
  var mainTimeLine = null;
  var h = null;

  var ioAppend = function ioAppend(l, r) {
    return function (o) {
      return function (i) {
        l(o)(i);
        r(o)(i);
      };
    };
  };

  var onNextFrame = function onNextFrame() {
    console.group("." + now);
    now = tf();

    if (mainTimeLine && timeLine.getBounds(mainTimeLine)[0] <= now) {
      var mtl = mainTimeLine;
      mainTimeLine = null;
      var tl1 = null;
      var tl2 = timeLine.fromIO(ioAppend, function (o) {
        return function () {
          tl1 = timeLine.runTo(ioAppend, now, mtl)(function (v) {
            return runAllNows(v)(o)();
          })();
        };
      });
      var tl = tl1 != null && tl2 != null ? timeLine.mappend(ioAppend, tl1, tl2) : tl1 != null ? tl1 : tl2;
      mainTimeLine = tl != null && mainTimeLine != null ? timeLine.mappend(ioAppend, mainTimeLine, tl) : tl != null ? tl : mainTimeLine;
    }

    if (mainTimeLine) {
      h = requestNextFrame(onNextFrame);
    } else {
      h = null;
    }

    console.groupEnd();
  };

  return function (v) {
    console.group(">");

    if (h == null) {
      now = tf();
      h = requestNextFrame(onNextFrame);
    }

    var canceled = {
      value: false
    };
    var io = v.tag === "Local" ? cancelOffsetRing(canceled, 0 - now, v.io) : v.tag === "Origin" ? cancelOffsetRing(canceled, 0, v.io) : cancelOffsetRing(canceled, 0 - now, function (o) {
      return function (i) {
        return o(Delay(v.delay)(v.io));
      };
    });
    var tl = timeLine.fromIO(ioAppend, runAllNows([now, io]));
    mainTimeLine = tl != null && mainTimeLine != null ? timeLine.mappend(ioAppend, mainTimeLine, tl) : tl != null ? tl : mainTimeLine;
    console.groupEnd();
    return disposable.rtrn(function () {
      canceled.value = true;
    });
  };
}
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

var initDate = Date.now();
var scheduler = (0, _scheduler.mkScheduler)(function () {
  return Date.now() - initDate;
}, function (f) {
  return setTimeout(f, 20);
});
exports.scheduler = scheduler;
var str = s.take(3, s.periodic(100));
s.run(function (v, t) {
  return console.log("S", t, v);
}, scheduler, s.join(s.at(300, s.join(s.fromArray([str])))));
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
exports.empty = empty;
exports.at = at;
exports.fromArray = fromArray;
exports.now = now;
exports.on = on;
exports.periodic = periodic;
exports.map = map;
exports.tap = tap;
exports.filter = filter;
exports.take = take;
exports.mergeArray = mergeArray;
exports.join = join;
exports.chain = chain;

var _scheduler = require("./scheduler");

var disposable = _interopRequireWildcard(require("./disposable"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function run(o, run, s) {
  return s(o)(run);
}

function empty() {
  return function (o) {
    return function (run) {
      return disposable.empty;
    };
  };
}

function at(t, a) {
  return function (o) {
    return function (run) {
      return run((0, _scheduler.Delay)(t)(function (_) {
        return function (t) {
          try {
            o(a, t);
            o(null, t);
          } catch (exn) {
            exn instanceof Error ? o(exn, t) : o(new Error(), t);
          }
        };
      }));
    };
  };
}

function fromArray(xs) {
  return function (o) {
    return function (run) {
      return run((0, _scheduler.Delay)(0)(function (_) {
        return function (t) {
          try {
            for (var i = 0, l = xs.length; i < l; i++) {
              o(xs[i], t);
            }

            o(null, t);
          } catch (exn) {
            exn instanceof Error ? o(exn, t) : o(new Error(), t);
          }
        };
      }));
    };
  };
}

function now(a) {
  return at(0, a);
}

function on(event, et) {
  return function (o) {
    return function (run) {
      var d0 = disposable.empty;
      var d1 = run((0, _scheduler.Origin)(function (_) {
        return function (t0) {
          var listener = function listener(e) {
            return run((0, _scheduler.Origin)(function (_) {
              return function (t1) {
                return o(e, t1 - t0);
              };
            }));
          };

          et.addEventListener(event, listener);
          d0 = disposable.rtrn(function () {
            return et.removeEventListener(event, listener);
          });
        };
      }));
      return disposable.rtrn(function () {
        return d0.dispose(), d1.dispose();
      });
    };
  };
}

function periodic(period) {
  return function (o) {
    return function (run) {
      var i = 0;

      var p = function p(so) {
        return function (t) {
          try {
            o(i++, t);
            so((0, _scheduler.Delay)(period)(p));
          } catch (exn) {
            exn instanceof Error ? o(exn, t) : o(new Error(), t);
          }
        };
      };

      return run((0, _scheduler.Delay)(0)(p));
    };
  };
}

function map(f, s) {
  return function (o) {
    return function (run) {
      return s(function (v, t) {
        if (v == null || v instanceof Error) o(v, t);else o(f(v), t);
      })(run);
    };
  };
}

function tap(f, s) {
  return function (o) {
    return function (run) {
      return s(function (v, t) {
        if (v == null || v instanceof Error) o(v, t);else o((f(v), v), t);
      })(run);
    };
  };
}

function filter(f, s) {
  return function (o) {
    return function (run) {
      return s(function (v, t) {
        if (v == null || v instanceof Error) o(v, t);else if (f(v)) o(v, t);
      })(run);
    };
  };
}

function take(n, s) {
  return function (o) {
    return function (run) {
      var i = 0;
      var d = s(function (v, t) {
        i++;
        if (i <= n) o(v, t);

        if (i >= n) {
          d.dispose();
          o(null, t);
        }
      })(run);
      return d;
    };
  };
}

function mergeArray(xs) {
  return function (o) {
    return function (run) {
      var size = xs.length;
      var dmap = {};
      var d = disposable.rtrn(function () {
        for (var key in dmap) {
          dmap[key].dispose();
        }
      });

      var oo = function oo(key) {
        return function (v, t) {
          if (v == null) {
            delete dmap[key];
            size--;
            if (size === 0) o(null, t);
          } else {
            if (v instanceof Error) d.dispose();
            o(v, t);
          }
        };
      };

      for (var i = 0, l = xs.length; i < l; i++) {
        dmap[i] = xs[i](oo(i))(run);
      }

      return d;
    };
  };
}

function join(xs) {
  return function (o) {
    return function (run) {
      var i = 0;
      var size = 0;
      var dmap = {};
      var d = disposable.rtrn(function () {
        for (var key in dmap) {
          dmap[key].dispose();
        }
      });
      var index = i++;
      size++;
      dmap[index] = xs(function (v, t0) {
        if (v == null) {
          delete dmap[index];
          if (--size === 0) o(null, t0);
        } else if (v instanceof Error) {
          d.dispose();
          o(v, t0);
        } else {
          var _index = i++;

          size++;
          dmap[_index] = v(function (v, t1) {
            if (v == null) {
              delete dmap[_index];
              if (--size === 0) o(null, t0 + t1);
            } else {
              if (v instanceof Error) d.dispose();
              o(v, t0 + t1);
            }
          })(run);
        }
      })(run);
      return d;
    };
  };
}

function chain(f, s) {
  return join(map(f, s));
}
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
