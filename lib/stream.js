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
  return o => run => disposable.empty;
}

function at(t, a) {
  return o => run => run((0, _scheduler.Delay)(t)(_ => t => {
    try {
      o(a, t);
      o(null, t);
    } catch (exn) {
      exn instanceof Error ? o(exn, t) : o(new Error(), t);
    }
  }));
}

function fromArray(xs) {
  return o => run => run((0, _scheduler.Delay)(0)(_ => t => {
    try {
      for (var i = 0, l = xs.length; i < l; i++) o(xs[i], t);

      o(null, t);
    } catch (exn) {
      exn instanceof Error ? o(exn, t) : o(new Error(), t);
    }
  }));
}

function now(a) {
  return at(0, a);
}

function on(event, et) {
  return o => run => {
    var d0 = disposable.empty;
    const d1 = run((0, _scheduler.Origin)(_ => t0 => {
      const listener = e => run((0, _scheduler.Origin)(_ => t1 => o(e, t1 - t0)));

      et.addEventListener(event, listener);
      d0 = disposable.rtrn(() => et.removeEventListener(event, listener));
    }));
    return disposable.rtrn(() => (d0.dispose(), d1.dispose()));
  };
}

function periodic(period) {
  return o => run => {
    var i = 0;

    const p = so => t => {
      try {
        o(i++, t);
        so((0, _scheduler.Delay)(period)(p));
      } catch (exn) {
        exn instanceof Error ? o(exn, t) : o(new Error(), t);
      }
    };

    return run((0, _scheduler.Delay)(0)(p));
  };
}

function map(f, s) {
  return o => run => s((v, t) => {
    if (v == null || v instanceof Error) o(v, t);else o(f(v), t);
  })(run);
}

function tap(f, s) {
  return o => run => s((v, t) => {
    if (v == null || v instanceof Error) o(v, t);else o((f(v), v), t);
  })(run);
}

function filter(f, s) {
  return o => run => s((v, t) => {
    if (v == null || v instanceof Error) o(v, t);else if (f(v)) o(v, t);
  })(run);
}

function take(n, s) {
  return o => run => {
    var i = 0;
    const d = s((v, t) => {
      i++;
      if (i <= n) o(v, t);

      if (i >= n) {
        d.dispose();
        o(null, t);
      }
    })(run);
    return d;
  };
}

function mergeArray(xs) {
  return o => run => {
    var size = xs.length;
    const dmap = {};
    const d = disposable.rtrn(() => {
      for (var key in dmap) dmap[key].dispose();
    });

    const oo = key => (v, t) => {
      if (v == null) {
        delete dmap[key];
        size--;
        if (size === 0) o(null, t);
      } else {
        if (v instanceof Error) d.dispose();
        o(v, t);
      }
    };

    for (var i = 0, l = xs.length; i < l; i++) dmap[i] = xs[i](oo(i))(run);

    return d;
  };
}

function join(xs) {
  return o => run => {
    var i = 0;
    var size = 0;
    const dmap = {};
    const d = disposable.rtrn(() => {
      for (var key in dmap) dmap[key].dispose();
    });
    const index = i++;
    size++;
    dmap[index] = xs((v, t0) => {
      if (v == null) {
        delete dmap[index];
        if (--size === 0) o(null, t0);
      } else if (v instanceof Error) {
        d.dispose();
        o(v, t0);
      } else {
        const index = i++;
        size++;
        dmap[index] = v((v, t1) => {
          if (v == null) {
            delete dmap[index];
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
}

function chain(f, s) {
  return join(map(f, s));
}