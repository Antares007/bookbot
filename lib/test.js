"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Test = Test;
exports.Ring = Ring;
exports.run = run;

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Test(name, plan, f) {
  return {
    tag: "Test",
    name: name,
    plan: plan,
    f: f
  };
}

function Ring(name, io) {
  return {
    tag: "Ring",
    name: name,
    io: io
  };
}

function run(v, o) {
  return new Promise(function (resolve, reject) {
    if (v.tag === "Test") {
      var asserts = [];
      var assert = _assert.default.strict;

      var mkAssertFn = function mkAssertFn(name) {
        return function () {
          try {
            assert[name].apply(assert, arguments);
            asserts.push(null);
          } catch (err) {
            if (err && err.code === "ERR_ASSERTION" && err instanceof Error) {
              asserts.push(err);
            } else {
              reject(err);
            }
          }
        };
      };

      var t0 = Date.now();

      try {
        v.f({
          ok: mkAssertFn("ok"),
          equal: mkAssertFn("equal"),
          notEqual: mkAssertFn("notEqual"),
          deepEqual: mkAssertFn("deepEqual"),
          notDeepEqual: mkAssertFn("notDeepEqual")
        });
      } catch (err) {
        return reject(err);
      }

      var t1 = Date.now();
      var name = v.name;
      var plan = v.plan;

      var rec = function rec() {
        var t2 = Date.now();
        var time = t2 - t1;
        var pass;

        if (pass = asserts.length === plan && !asserts.some(function (v) {
          return v instanceof Error;
        })) {
          o({
            tag: "Result",
            name: name,
            pass: pass,
            time: time,
            plan: plan,
            asserts: asserts
          });
          resolve([1, 0]);
        } else if (t2 - t1 > 99) {
          o({
            tag: "Result",
            name: name,
            pass: pass,
            time: time,
            plan: plan,
            asserts: asserts
          });
          resolve([0, 1]);
        } else {
          setTimeout(rec, 0);
        }
      };

      setTimeout(rec, 0);
    } else {
      var io = v.io;
      var rez = [0, 0];
      var p = Promise.resolve();
      var i = 0;
      io(function (v) {
        var n = i++;
        p = p.then(function () {
          return new Promise(function (resolve, reject) {
            var i = 0;
            io(function (v) {
              if (i++ === n) run(v, o).then(function (rez2) {
                rez[0] = rez[0] + rez2[0];
                rez[1] = rez[1] + rez2[1];
                resolve();
              }, reject);
            })();
          });
        });
      })();
      p.then(function () {
        return resolve(rez);
      });
    }
  });
}