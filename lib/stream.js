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