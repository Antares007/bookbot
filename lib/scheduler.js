"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mkScheduler = mkScheduler;
exports.Delay = exports.Origin = exports.Local = void 0;

var disposable = _interopRequireWildcard(require("./disposable.js"));

var timeLine = _interopRequireWildcard(require("./timeline.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const Local = io => ({
  tag: "Local",
  io
});

exports.Local = Local;

const Origin = io => ({
  tag: "Origin",
  io
});

exports.Origin = Origin;

const Delay = delay => io => ({
  tag: "Delay",
  delay,
  io
});

exports.Delay = Delay;

const cancelOffsetRing = (canceled, offset, io) => o => i => canceled.value ? void 0 : io(v => {
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

const runAllNows = pair => oo => () => {
  const ring = io => o => () => {
    io(v => {
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

  ring(pair[1])(oo)();
};

function mkScheduler(tf, requestNextFrame) {
  var now = -1;
  var mainTimeLine = null;
  var h = null;

  const ioAppend = (l, r) => o => i => {
    l(o)(i);
    r(o)(i);
  };

  const onNextFrame = () => {
    console.group("." + now);
    now = tf();

    if (mainTimeLine && timeLine.getBounds(mainTimeLine)[0] <= now) {
      const mtl = mainTimeLine;
      mainTimeLine = null;
      var tl1 = null;
      const tl2 = timeLine.fromIO(ioAppend, o => () => {
        tl1 = timeLine.runTo(ioAppend, now, mtl)(v => runAllNows(v)(o)())();
      });
      const tl = tl1 != null && tl2 != null ? timeLine.mappend(ioAppend, tl1, tl2) : tl1 != null ? tl1 : tl2;
      mainTimeLine = tl != null && mainTimeLine != null ? timeLine.mappend(ioAppend, mainTimeLine, tl) : tl != null ? tl : mainTimeLine;
    }

    if (mainTimeLine) {
      h = requestNextFrame(onNextFrame);
    } else {
      h = null;
    }

    console.groupEnd();
  };

  return v => {
    console.group(">");

    if (h == null) {
      now = tf();
      h = requestNextFrame(onNextFrame);
    }

    const canceled = {
      value: false
    };
    const io = v.tag === "Local" ? cancelOffsetRing(canceled, 0 - now, v.io) : v.tag === "Origin" ? cancelOffsetRing(canceled, 0, v.io) : cancelOffsetRing(canceled, 0 - now, o => i => o(Delay(v.delay)(v.io)));
    const tl = timeLine.fromIO(ioAppend, runAllNows([now, io]));
    mainTimeLine = tl != null && mainTimeLine != null ? timeLine.mappend(ioAppend, mainTimeLine, tl) : tl != null ? tl : mainTimeLine;
    console.groupEnd();
    return disposable.rtrn(() => {
      canceled.value = true;
    });
  };
}