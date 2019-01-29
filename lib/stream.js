"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.empty = empty;
exports.at = at;
exports.throwError = throwError;
exports.fromArray = fromArray;
exports.map = map;
exports.flatMap = flatMap;
const emptyDisposable = {
  dispose: () => {}
};

function empty() {
  return () => emptyDisposable;
}

function at(a, delay) {
  let canceled = false;
  return (sink, scheduler) => {
    scheduler(delay, _ => {
      try {
        if (!canceled) sink.event(delay, a);
        if (!canceled) sink.end(delay);
      } catch (err) {
        sink.error(delay, err);
      }
    });
    return {
      dispose() {
        canceled = true;
      }

    };
  };
}

function throwError(err) {
  let canceled = false;
  return (sink, scheduler) => {
    scheduler(0, _ => {
      if (!canceled) sink.error(0, err);
    });
    return {
      dispose() {
        canceled = true;
      }

    };
  };
}

function fromArray(as) {
  let canceled = false;
  return (sink, scheduler) => {
    scheduler(0, _ => {
      try {
        for (let i = 0, l = as.length; i < l && !canceled; i++) sink.event(0, as[i]);

        if (!canceled) sink.end(0);
      } catch (err) {
        sink.error(0, err instanceof Error ? err : new Error(err + ""));
      }
    });
    return {
      dispose() {
        canceled = true;
      }

    };
  };
}

function map(f, s) {
  return (sink, scheduler) => s({
    event: (t, v) => sink.event(t, f(v)),
    end: sink.end,
    error: sink.error
  }, scheduler);
}

function flatMap(f, s) {
  return (sink, scheduler) => {
    let active = true;
    let i = 0;
    let size = 0;
    const dmap = {};
    const d = {
      dispose() {
        active = false;

        for (var key in dmap) dmap[key].dispose();
      }

    };

    const _end = (t, index) => {
      delete dmap[index];

      if (--size === 0) {
        active = false;
        sink.end(t);
      }
    };

    const _error = (t, err) => {
      if (active) {
        d.dispose();
        sink.error(t, err);
      }
    };

    const index = i++;
    size++;
    dmap[index] = s({
      event(t0, a) {
        if (!active) return;
        const index = i++;
        size++;
        dmap[index] = f(a)({
          event(t, v) {
            if (!active) return;
            sink.event(t + t0, v);
          },

          end: t => _end(t + t0, index),
          error: (t, err) => _error(t + t0, err)
        }, scheduler);
      },

      end: t0 => _end(t0, index),
      error: (t0, err) => _error(t0, err)
    }, scheduler);
    return d;
  };
}