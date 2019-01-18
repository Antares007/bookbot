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