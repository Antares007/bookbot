// @flow strict
const ast = require("../lib/babel");
export function bexp(f: (...args: Array<mixed>) => mixed, mae: string): string {
  let bexp = "false";
  const af = parseArrow(f);
  if (af.params.length === 1) {
    if (af.params[0].type === "ObjectPattern") {
      bexp = "true";
      ObjectPattern(af.params[0], mae, (r) => {
        bexp = bexp + " && \n\t" + r;
      });
      bexp = bexp.slice(8);
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
  var lexp = `typeof ${mae} === 'object' && ${mae} !== null`;
  if (n.properties[n.properties.length - 1]?.type === "RestElement") {
    lexp += ` && Object.keys(${mae}).length >= ${n.properties.length - 1}`;
  } else {
    lexp += ` && Object.keys(${mae}).length === ${n.properties.length}`;
  }
  o(lexp);
  n.properties.forEach((n, i) => {
    if (n.type === "ObjectProperty") {
      if (n.key.type !== "Identifier") throw new Error("empty");
      const id = n.key.name;
      const v = n.value;
      if (v.type === "Identifier") {
        o(`Array.isArray(${mae}.${id})`);
      } else if (v.type === "ObjectPattern") {
        ObjectPattern(v, mae + "." + id, o);
      } else if (v.type === "ArrayPattern") {
        ArrayPattern(v, mae + "." + id, o);
      } else {
        throw new Error("empty");
      }
    } else if (n.type === "RestElement") {
    } else {
      throw new Error("empty");
    }
  });
}
function ArrayPattern(n, mae, o) {
  var lexp = `Array.isArray(${mae})`;
  if (n.elements[n.elements.length - 1]?.type === "RestElement") {
    lexp += ` && ${mae}.length >= ${n.elements.length - 1}`;
  } else {
    lexp += ` && ${mae}.length === ${n.elements.length}`;
  }
  o(lexp);
  n.elements.forEach((n, i) => {
    if (n == null) {
    } else if ("ArrayPattern" === n.type) {
      ArrayPattern(n, mae + "[" + i + "]", o);
    } else if ("ObjectPattern" === n.type) {
      ObjectPattern(n, mae + "[" + i + "]", o);
    } else if ("RestElement" === n.type) {
    } else if ("Identifier" === n.type) {
    } else if ("AssignmentPattern" === n.type) {
      if ("StringLiteral" === n.right.type) {
        o(`${mae}[${i}] === "${n.right.value}"`);
      } else if ("NumericLiteral" === n.right.type) {
        o(`${mae}[${i}] === ${n.right.value}`);
      } else {
        throw new Error(n.type);
      }
    } else {
      throw new Error(n?.type);
    }
  });
}
