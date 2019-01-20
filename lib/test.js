"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
exports.generate = generate;
exports.runATest = runATest;

function run(o, it, n = 4) {
  let i = 0;
  let p = Promise.resolve();
  let endSent = false;

  const req = n => {
    const taken = [...map(p => p.then(a => {
      i--;
      req(Math.max(n - i, 0));
      o(a);
    }), take(n, it))];

    if (taken.length === 0) {
      if (!endSent) {
        endSent = true;
        p = p.then(() => {
          o();
        });
      }
    } else {
      i = i + taken.length;
      p = p.then(() => Promise.all(taken));
    }
  };

  req(n);
}

function* generate(prefix, platform, f = name => name.endsWith(".js")) {
  for (let path of [...filter(f, ls(prefix, platform))]) {
    try {
      const exports = platform.require(path);

      for (let name in exports) {
        const rez = /^a([0-9]+)_/.exec(name);
        if (!rez || typeof exports[name] !== "function") continue;
        const plan = parseInt(rez[1], 10);
        yield runATest(platform, plan, exports[name]).then(errors => {
          return {
            name: platform.join(path, name).slice(prefix.length),
            errors
          };
        });
      }
    } catch (err) {
      yield Promise.resolve({
        name: path.slice(prefix.length),
        errors: [err]
      });
    }
  }
}

function runATest(assert, plan, aTest) {
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
      return resolve([err]);
    }

    const t0 = Date.now();

    const rec = () => {
      if (asserts.length === plan && !asserts.some(v => v instanceof Error) || Date.now() - t0 > 99) {
        const errors = asserts.filter(Boolean);
        if (plan !== asserts.length) errors.push(new Error(`\u001b[32mplan(${plan})\u001b[39m !== \u001b[31masserts(${asserts.length})\u001b[39m`));
        resolve(errors);
      } else {
        setTimeout(rec, 0);
      }
    };

    rec();
  });
}

function* ls(path, fs) {
  if (fs.statSync(path).isDirectory()) {
    for (let name of fs.readdirSync(path)) for (let x of ls(fs.join(path, name), fs)) yield x;
  } else {
    yield path;
  }
}

function* filter(f, xs) {
  for (let x of xs) if (f(x)) yield x;
}

function* map(f, bs) {
  for (let a of bs) yield f(a);
}

function* take(n, xs) {
  if (n <= 0) return;
  let i = 0;

  for (let x of xs) {
    yield x;
    if (++i === n) return;
  }
}