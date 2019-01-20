"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRun = makeRun;

function makeRun(assert) {
  return (plan, aTest) => {
    return new Promise((resolve, reject) => {
      const asserts = [];

      const mkAssertFn = name => (...args) => {
        try {
          assert[name](...args);
          asserts.push(null);
        } catch (err) {
          if (err && err.code === "ERR_ASSERTION" && err instanceof Error) {
            asserts.push(err);
          } else {
            reject(err);
          }
        }
      };

      try {
        aTest({
          ok: mkAssertFn("ok"),
          strictEqual: mkAssertFn("strictEqual"),
          deepStrictEqual: mkAssertFn("deepStrictEqual"),
          notStrictEqual: mkAssertFn("notStrictEqual"),
          notDeepStrictEqual: mkAssertFn("notDeepStrictEqual")
        });
      } catch (err) {
        return reject(err);
      }

      const t0 = Date.now();

      const rec = () => {
        if (asserts.length === plan && !asserts.some(v => v instanceof Error) || Date.now() - t0 > 99) {
          resolve(asserts);
        } else {
          setTimeout(rec, 0);
        }
      };

      rec();
    });
  };
}

function* ls(path, fs) {
  if (fs.statSync(path).isDirectory()) {
    for (let name of fs.readdirSync(path)) for (let x of ls(fs.join(path, name), fs)) yield x;
  } else {
    yield path;
  }
}