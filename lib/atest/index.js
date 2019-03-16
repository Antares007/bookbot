"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;

var _parse = require("./parse");

var _fs = require("fs");

var _path = require("path");

const assert = require.call(module, 'assert').strict;

function run(o, filePaths) {
  const rec = list => {
    if (list.length === 0) return;
    const [filePath, ...tail] = list;

    try {
      const testDeclarations = (0, _parse.parse)((0, _fs.readFileSync)(filePath, 'utf8'));
      if (testDeclarations.length === 0) return setTimeout(() => rec(tail), 0);

      const exports = require.call(module, filePath);

      let timeoutID;
      let totalPlan = 0;
      const plan = testDeclarations.reduce((a, d) => {
        const fullname = (0, _path.join)(filePath, d.name);
        a[fullname] = d.plan;
        totalPlan += d.plan;
        runTest(error => {
          if (error != null) o({
            fullname,
            error
          });else {
            if (--a[fullname] === 0) o({
              fullname
            });

            if (--totalPlan === 0) {
              clearTimeout(timeoutID);
              setTimeout(() => rec(tail), 0);
            }
          }
        }, exports[d.name]);
        return a;
      }, {});
      timeoutID = setTimeout(() => {
        for (let name in plan) if (plan[name] !== 0) o({
          fullname: name,
          error: new Error('timeout')
        });
      }, 1000);
    } catch (error) {
      o({
        fullname: filePath,
        error
      });
    }
  };

  setTimeout(() => rec(filePaths), 0);
}

function runTest(o, f) {
  var i = 0;

  try {
    const p = f.call({}, new Proxy([], {
      get(_, property) {
        const index = parseInt(property, 10);
        if (isNaN(index)) return Reflect.get(...arguments);
        return new Proxy(assert, {
          get(_, property) {
            return (...args) => {
              try {
                i++;
                assert[property](...args);
                if (i - 1 === index) o();else o(new Error(`index actual(${i}) === expected(${index})`));
              } catch (err) {
                o(new Error(`assert[${index}].${property}:\n${err.message}`));
              }
            };
          }

        });
      }

    }));
    if (p instanceof Promise) p.catch(o);
  } catch (err) {
    o(err);
  }
}