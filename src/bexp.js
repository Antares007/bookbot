// @flow strict
const ast = require("../lib/babel");
export function bexp(f: (...args: Array<mixed>) => mixed, mae: string): string {
  let bexp = "false";
  const af = parseArrow(f);
  if (af.params.length === 1) {
    if (af.params[0].type === "ObjectPattern") {
      bexp = true;
      var pc = [];
      ObjectPattern(af.params[0], mae, pc.push.bind(pc));
      bexp = pc.join(" && ");
    } else if (af.params[0].type === "Identifier") {
      bexp = "true";
    }
  } else if (af.params.length === 0) {
    bexp = "true";
  }
  return bexp;
}
function parseArrow(f) {
  var code = f.toString();
  if (/^function\s*\(/.test(code)) code = "function anon" + code.slice(8);
  const {
    program: {
      body: [n],
    },
  } = ast.parse(code);
  if (
    n.type === "ExpressionStatement" &&
    n.expression.type === "ArrowFunctionExpression"
  )
    return n.expression;
  else if (n.type === "FunctionDeclaration") return n;
  else throw new Error("empty");
}
function ObjectPattern(n, mae, o) {
  o(`typeof ${mae} === 'object' && ${mae} !== null`);
  const conds = [];
  const co = conds.push.bind(conds);
  var ncount = 0;
  n.properties.forEach((n, i) => {
    if (n.type === "ObjectProperty") {
      if (n.key.type !== "Identifier") throw new Error("empty");
      const id = n.key.name;
      const v = n.value;
      if (v.type === "Identifier") co(`Array.isArray(${mae}.${id})`);
      else if (v.type === "ObjectPattern") ObjectPattern(v, mae + "." + id, co);
      else if (v.type === "ArrayPattern") ArrayPattern(v, mae + "." + id, co);
      else if (v.type === "AssignmentPattern" && v.right.type === "NullLiteral")
        ncount++;
      else throw new Error(v?.type);
    } else if (n.type === "RestElement") {
      ncount++;
    } else {
      throw new Error(n?.type);
    }
  });
  o(
    `Object.keys(${mae}).length ${ncount ? ">=" : "==="} ${
      n.properties.length - ncount
    }`
  );
  conds.forEach((c) => o(c));
}
function ArrayPattern(n, mae, o) {
  o(`Array.isArray(${mae})`);
  const conds = [];
  const co = conds.push.bind(conds);
  var ncount = 0;
  n.elements.forEach((n, i) => {
    if (n == null);
    else if ("ArrayPattern" === n.type)
      ArrayPattern(n, mae + "[" + i + "]", co);
    else if ("ObjectPattern" === n.type)
      ObjectPattern(n, mae + "[" + i + "]", co);
    else if ("RestElement" === n.type) ncount++;
    else if ("Identifier" === n.type);
    else if ("AssignmentPattern" === n.type) {
      if ("StringLiteral" === n.right.type)
        co(`${mae}[${i}] === "${n.right.value}"`);
      else if ("NumericLiteral" === n.right.type)
        co(`${mae}[${i}] === ${n.right.value}`);
      else if ("NullLiteral" === n.right.type) ncount++;
      else throw new Error(n?.type);
    } else throw new Error(n?.type);
  });
  o(`${mae}.length ${ncount ? ">=" : "==="} ${n.elements.length - ncount}`);
  conds.forEach((c) => o(c));
}
