"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;

var _iterable = require("./iterable.js");

function* run(prefix, platform, f = name => name.endsWith(".js"), timeout = 1000) {
  for (let path of [...(0, _iterable.filter)(f, ls(prefix, platform))]) {
    try {
      const exports = platform.require(path);

      for (let name in exports) {
        if (typeof exports[name] !== "function" || !exports[name].toString().includes(`(assert)`)) continue;
        let t0 = Date.now();
        yield runATest(platform, exports[name], timeout).then(errors => {
          return {
            name: platform.join(path, name).slice(prefix.length + 1),
            time: Date.now() - t0,
            errors
          };
        });
      }
    } catch (err) {
      yield Promise.resolve({
        name: path.slice(prefix.length + 1),
        time: 0,
        errors: [err]
      });
    }
  }
}

function runATest(assert, aTest, timeout) {
  return new Promise((resolve, reject) => {
    try {
      let plan = 1;
      let asserts = 0;
      let timeoutId;
      const errors = [];

      const mkAssertFn = name => function aRing(...args) {
        asserts++;
        assert[name].apply(this, args);

        if (asserts === plan) {
          clearTimeout(timeoutId);
          resolve(errors);
        }
      };

      const f = f => {
        plan++;
        return function ring(...args) {
          try {
            f.apply(this, args);
          } catch (err) {
            errors.push(err);
          }
        };
      };

      f.ok = mkAssertFn("ok");
      f.strictEqual = mkAssertFn("strictEqual");
      f.deepStrictEqual = mkAssertFn("deepStrictEqual");
      f.notStrictEqual = mkAssertFn("notStrictEqual");
      f.notDeepStrictEqual = mkAssertFn("notDeepStrictEqual");
      aTest(f);
      if (asserts === plan) return resolve(errors);
      timeoutId = setTimeout(() => {
        errors.push(new Error(`timeout ${timeout}ms \u001b[32mplan(${plan})\u001b[39m !== \u001b[31masserts(${asserts})\u001b[39m`));
        resolve(errors);
      }, timeout);
    } catch (err) {
      resolve([err]);
    }
  });
}

function* ls(path, fs) {
  if (fs.statSync(path).isDirectory()) {
    for (let name of fs.readdirSync(path)) for (let x of ls(fs.join(path, name), fs)) yield x;
  } else {
    yield path;
  }
}