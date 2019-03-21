"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.s = s;
Object.defineProperty(exports, "delay", {
  enumerable: true,
  get: function () {
    return _scheduler.delay;
  }
});
Object.defineProperty(exports, "now", {
  enumerable: true,
  get: function () {
    return _scheduler.now;
  }
});
exports.skipEquals = exports.multicast = exports.scan = exports.skip = exports.take = exports.filter2 = exports.filter = exports.tap = exports.map = exports.tryCatch = exports.startWith = exports.merge = exports.combine = exports.flatMap = exports.switchLatest = exports.flatMapLatest = exports.run = exports.periodic = exports.at = exports.empty = exports.T = exports.event = exports.Event = exports.end = exports.End = void 0;

var _scheduler = require("./scheduler");

var D = _interopRequireWildcard(require("./disposable"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class End {}

exports.End = End;
const end = new End();
exports.end = end;

class Event {
  constructor(value) {
    this.value = value;
  }

}

exports.Event = Event;

const event = a => new Event(a);

exports.event = event;

class T {
  constructor(pith) {
    this.pith = pith;
  }

  run(o) {
    return run(o, this);
  }

  merge(sb) {
    return merge(this, sb);
  }

  startWith(a) {
    return startWith(a, this);
  }

  tryCatch() {
    return tryCatch(this);
  }

  map(f) {
    return map(f, this);
  }

  tap(f) {
    return tap(f, this);
  }

  flatMap(f) {
    return flatMap(f, this);
  }

  flatMapLatest(f) {
    return flatMapLatest(f, this);
  }

  filter(f) {
    return filter(f, this);
  }

  filter2(f) {
    return filter2(f, this);
  }

  take(n) {
    return take(n, this);
  }

  skip(n) {
    return skip(n, this);
  }

  scan(f, b) {
    return scan(f, b, this);
  }

  multicast() {
    return multicast(this);
  }

  skipEquals() {
    return skipEquals(this);
  }

}

exports.T = T;

function s(pith) {
  return new T(pith);
}

const empty = () => s(o => o((0, _scheduler.delay)(() => o(end))));

exports.empty = empty;

const at = (a, dly = 0) => s(o => {
  o((0, _scheduler.delay)(() => {
    o(event(a));
    o((0, _scheduler.delay)(() => o(end), 0));
  }, dly));
});

exports.at = at;

const periodic = period => s(o => {
  var i = 0;
  o((0, _scheduler.delay)(function periodic() {
    o(event(i++));
    o((0, _scheduler.delay)(periodic, period));
  }));
});

exports.periodic = periodic;

const run = (o, as) => {
  var disposables = [];
  var disposed = false;
  const disposable = D.disposable(() => {
    var d;
    disposed = true;

    while (d = disposables.shift()) d.dispose();
  });
  var tp = (0, _scheduler.now)();
  as.pith(function S$run(e) {
    if (e instanceof Event) o(e);else if (e instanceof D.Disposable) {
      if (disposed) e.dispose();else if (tp === (0, _scheduler.now)()) disposables.push(e);else tp = (0, _scheduler.now)(), disposables = [e];
    } else {
      if (e instanceof Error) disposable.dispose();
      o(e);
    }
  });
  return disposable;
};

exports.run = run;

const flatMapLatest = (f, as) => s(o => {
  var esd = null;
  var ssd = run(function S$flatMapLatestO(es) {
    if (es instanceof Event) {
      esd && esd.dispose();
      esd = run(function S$flatMapLatestI(e) {
        if (e instanceof Event) o(e);else if (e instanceof End) {
          esd = null;
          if (ssd == null) o(end);
        } else o(e);
      }, f(es.value));
    } else if (es instanceof End) {
      ssd = null;
      if (esd == null) o(end);
    } else o(es);
  }, as);
  o(D.disposable(() => {
    ssd && ssd.dispose();
    esd && esd.dispose();
  }));
});

exports.flatMapLatest = flatMapLatest;

const switchLatest = ss => s(o => {
  var esd = null;
  var ssd = run(function S$switchLatestO(es) {
    if (es instanceof Event) {
      esd && esd.dispose();
      esd = run(function S$switchLatestI(e) {
        if (e instanceof Event) o(e);else if (e instanceof End) {
          esd = null;
          if (ssd == null) o(end);
        } else o(e);
      }, es.value);
    } else if (es instanceof End) {
      ssd = null;
      if (esd == null) o(end);
    } else o(es);
  }, ss);
  o(D.disposable(() => {
    ssd && ssd.dispose();
    esd && esd.dispose();
  }));
});

exports.switchLatest = switchLatest;

const flatMap = (f, as) => s(o => {
  const dmap = new Map();
  o(D.disposable(() => {
    for (var e of dmap.entries()) e[1].dispose();
  }));
  var i = 0;
  const index = i++;
  dmap.set(index, run(e => {
    if (e instanceof Event) {
      const index = i++;
      dmap.set(index, run(e => {
        if (e instanceof Event) o(e);else if (e instanceof End) {
          dmap.delete(index);
          if (dmap.size === 0) o(e);
        } else o(e);
      }, f(e.value)));
    } else if (e instanceof End) {
      dmap.delete(index);
      if (dmap.size === 0) o(e);
    } else o(e);
  }, as));
});

exports.flatMap = flatMap;

const combine = (f, array) => s(o => {
  const dmap = new Map();
  const mas = [];

  for (var i = 0, l = array.length; i < l; i++) {
    mas.push(null);
    dmap.set(i, run(S$combine(i), array[i]));
  }

  o(D.disposable(() => {
    for (var e of dmap.entries()) e[1].dispose();
  }));

  function S$combine(index) {
    return e => {
      if (e instanceof Event) {
        mas[index] = e;
        var as = [];

        for (var a of mas) {
          if (a == null) return;
          as.push(a.value);
        }

        o(event(f(as)));
      } else if (e instanceof End) {
        dmap.delete(index);
        if (dmap.size === 0) o(end);
      } else o(e);
    };
  }
});

exports.combine = combine;

const merge = (sa, sb) => s(o => {
  var i = 2;
  const sad = run(S$merge, sa);
  const sbd = run(S$merge, sb);
  o(D.disposable(() => {
    sad.dispose();
    sbd.dispose();
  }));

  function S$merge(e) {
    if (e instanceof End) {
      --i === 0 && o(end);
    } else o(e);
  }
});

exports.merge = merge;

const startWith = (a, as) => s(o => o((0, _scheduler.delay)(() => o(event(a)), o(run(o, as)))));

exports.startWith = startWith;

const tryCatch = as => s(o => as.pith(function S$tryCatch(e) {
  if (e instanceof Error) o(e);else try {
    o(e);
  } catch (err) {
    o(err);
  }
}));

exports.tryCatch = tryCatch;

const map = (f, as) => s(o => as.pith(function S$map(e) {
  if (e instanceof Event) o(event(f(e.value)));else o(e);
}));

exports.map = map;

const tap = (f, as) => s(o => as.pith(function S$tap(e) {
  if (e instanceof Event) f(e.value), o(e);else o(e);
}));

exports.tap = tap;

const filter = (f, as) => s(o => as.pith(function S$filter(e) {
  if (e instanceof Event) f(e.value) && o(e);else o(e);
}));

exports.filter = filter;

const filter2 = (f, as) => s(o => as.pith(function S$filter(e) {
  if (e instanceof Event) {
    const b = f(e.value);
    if (b) o(event(b));
  } else o(e);
}));

exports.filter2 = filter2;

const take = (n, as) => {
  if (n <= 0) return empty();
  return s(o => {
    var i = 0;
    const d = run(function S$take(e) {
      if (e instanceof Event) {
        o(e);

        if (++i === n) {
          d.dispose();
          o(end);
        }
      } else o(e);
    }, as);
    o(d);
  });
};

exports.take = take;

const skip = (n, as) => {
  if (n <= 0) return as;
  return s(o => {
    var i = 0;
    const d = run(function S$skip(e) {
      if (e instanceof Event) {
        if (i++ < n) return;
        o(e);
      } else o(e);
    }, as);
    o(d);
  });
};

exports.skip = skip;

const scan = (f, b, as) => {
  return s(o => {
    o((0, _scheduler.delay)(t => {
      var b_ = b;
      o(event(b_));
      o(run(function S$scan(e) {
        if (e instanceof Event) o(event(b_ = f(b_, e.value)));else o(e);
      }, as));
    }));
  });
};

exports.scan = scan;

const multicast = as => {
  const os = [];
  var d;
  return s(o => {
    if (d == null) d = run(e => {
      for (var o of os) o(e);
    }, as);
    os.push(o);
    o(D.disposable(() => {
      var index = os.indexOf(o);
      if (index < 0) return;
      os.splice(index, 1);
      if (os.length === 0 && d) d = d.dispose();
    }));
  });
};

exports.multicast = multicast;

const skipEquals = as => {
  var last;
  return s(o => {
    as.pith(e => {
      if (e instanceof Event) {
        if (last === e.value) return;
        last = e.value;
        o(e);
      } else o(e);
    });
  });
};

exports.skipEquals = skipEquals;