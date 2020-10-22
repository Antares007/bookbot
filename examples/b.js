// @flow strict
import type { N } from "../src/purry";
const { static_cast } = require("../src/utils/static_cast");
const remove = [
  "start",
  "end",
  "loc",
  "innerComments",
  "leadingComments",
  "trailingComments",
  "extra",
  "range",
];
const ast = require("../lib/babel");
const code = require("fs").readFileSync(
  require("path").resolve(__dirname, "..", "b.js"),
  "utf8"
);
const n = ast.parse(code);
require('fs').writeFileSync(__dirname + '/aaa.js',JSON.stringify(n))
const ids: {
  [string]: ast.DeclareClass | ast.TypeAlias,
} = n.program.body.reduce((s, n) => {
  if (n.type === "DeclareClass" || n.type === "TypeAlias") s[n.id.name] = n;
  return s;
}, {});
const refids = {};
collectids(ids.BabelNodeFile, refids);
Object.keys(ids).forEach((key) => {
  if (!refids[key]) delete ids[key];
});
//Object.assign(window||process, { ids });

const nmap = {
};

const node = (n: mixed) => (o) => {

};
node(n)((...args) => {
  console.log(...args);
});

function clean(ast: mixed): mixed {
  if (ast == null) return ast;
  else if (Array.isArray(ast)) return ast.map(clean);
  else if (typeof ast === "object")
    return Object.keys(ast).reduce((s, key) => {
      if (remove.every((k) => k !== key)) s[key] = clean(ast[key]);
      return s;
    }, {});
  else return ast;
}
function collectids(n: mixed, out_ids: {}) {
  if (n == null);
  else if (Array.isArray(n)) n.forEach((n) => collectids(n, out_ids));
  else if (typeof n === "object")
    if (n.type === "Identifier") {
      const name = static_cast<string>(n.name);
      if (out_ids[name] == null) {
        out_ids[name] = n;
        const n2 = ids[name];
        if (n2) collectids(n2, out_ids);
      }
    } else Object.keys(n).forEach((k) => collectids(n[k], out_ids));
}
