"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Local = Local;
exports.Origin = Origin;
exports.Delay = Delay;
exports.mkScheduler = mkScheduler;

var disposable = _interopRequireWildcard(require("./disposable.js"));

var timeLine = _interopRequireWildcard(require("./timeline.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function Local(io) {
  return {
    tag: "Local",
    io: io
  };
}

function Origin(io) {
  return {
    tag: "Origin",
    io: io
  };
}

function Delay(delay) {
  return function (io) {
    return {
      tag: "Origin",
      delay: delay,
      io: io
    };
  };
}

function ring(cref, offset) {
  return function (io) {
    return function (o) {
      return function (now) {
        if (cref.value) return;
        io(function (r) {
          if (r.tag === "Local") o(Local(ring(cref, 0 - now)(r.io)));else if (r.tag === "Origin") o(Origin(ring(cref, 0)(r.io)));else if (r.tag === "Delay") o(Delay(r.delay)(ring(cref, offset)(r.io)));else throw new Error("never");
        })(now + offset);
      };
    };
  };
}

function runAllNows(now) {
  return function (io) {
    return function (oo) {
      return function () {
        var ring = function ring(io) {
          return function (o) {
            return function (i) {
              io(function (r) {
                if (r.tag === "Local" || r.tag === "Origin") {
                  ring(r.io)(oo)(now);
                } else if (r.tag === "Delay") {
                  o([r.delay + now, io]);
                } else throw new Error("never");
              })(i);
            };
          };
        };

        ring(io)(oo)(now);
      };
    };
  };
}

var tlappend = function tlappend(l, r) {
  return function (o) {
    return function (i) {
      l(o)(i);
      r(o)(i);
    };
  };
};

function mkScheduler(tf, requestNextFrame) {
  var now = tf();
  var mainTimeLine = null;

  var onNextFrame = function onNextFrame() {
    now = tf();

    if (mainTimeLine != null) {
      var bounds = timeLine.getBounds(mainTimeLine);

      if (bounds[1] <= now) {
        var run = runAllNows(now);

        var _restIO = function restIO(o) {
          return function () {};
        };

        var restTl1 = timeLine.runTo(tlappend, now, mainTimeLine)(function (r) {
          _restIO = function restIO(o) {
            return function () {
              var left = _restIO;
              var right = run(r[1]);
              left(o)();
              right(o)();
            };
          };
        })();
        var restTl2 = timeLine.fromIO(tlappend, _restIO);
        mainTimeLine = restTl1 != null && restTl2 != null ? timeLine.mappend(tlappend, restTl1, restTl2) : restTl1 != null ? restTl1 : restTl2;
      }
    }

    requestNextFrame(onNextFrame);
  };

  requestNextFrame(onNextFrame);
  return function (r) {
    var cancelRef = {
      value: false
    };
    var offset = 0 - now;
    var io = r.tag === "Local" ? ring(cancelRef, offset)(r.io) : r.tag === "Origin" ? ring(cancelRef, 0)(r.io) : ring(cancelRef, offset)(function (o) {
      return function (i) {
        o(Delay(r.delay)(r.io));
      };
    });
    var tl = timeLine.fromIO(tlappend, runAllNows(now)(io));
    mainTimeLine = tl != null && mainTimeLine != null ? timeLine.mappend(tlappend, mainTimeLine, tl) : tl != null ? tl : mainTimeLine;
    return disposable.rtrn(function () {
      cancelRef.value = true;
    });
  };
}