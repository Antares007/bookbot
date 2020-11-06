// @flow strict
const ast = require("../lib/babel");
const { static_cast } = require("./utils/static_cast");
const parseArrow = (f: {}) => {
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
};
export type n3<OT: {} = {}> = {
  N: null[],
  a: mixed[][],
  n: number[],
  s: string[],
  b: boolean[],
  u: void[],
  o: OT[],
};
export function A(f: mixed, ...aies: Array<mixed>): mixed {
  var args = [];
  for (let a of aies) {
    if (a !== null && typeof a === "object" && typeof a.type === "string")
      if (aies.length === 1)
        return static_cast<(mixed) => void>(f).call(this, a);
      else
        Object.keys(a).forEach((k) => {
          args = args.concat(a[k]);
        });
    else args.push(a);
  }
  return C.call(this, f, ...args);
}
export function C(f: mixed, ...args: Array<mixed>): mixed {
  const proto = { type: "" };
  const aob = Object.create(proto);
  for (let a of args) {
    const tn = (typeof a)[0];
    if (Array.isArray(aob[tn])) aob[tn].push(a);
    else aob[tn] = [a];
  }
  proto.type = "";
  for (let tn of "nsbuf")
    if (aob[tn]?.length)
      proto.type += tn + (aob[tn].length > 1 ? aob[tn].length : "");
  if (aob.o?.length) {
    proto.type += "o[";
    aob.o.forEach((x, i) => {
      if (typeof x?.type === "string") proto.type += x.type;
      else proto.type += "{}";
      if (i + 1 < aob.o.length) proto.type += ";";
    });
    proto.type += "]";
  }
  return static_cast<({}) => mixed>(f).call(this, aob);
}
export function B(...funs: Array<mixed>): ({}) => mixed {
  var code = `const [funs] = arguments;\nreturn a => {\n`;
  funs.forEach((f, i) => {
    const af = parseArrow(static_cast<() => void>(f));
    if (af.params.length === 1 && af.params[0].type === "ObjectPattern") {
      let bexr = "true";
      ObjectPattern(af.params[0], "a", (r) => {
        bexr = bexr + " && \n\t" + r;
      });
      code += `if(${bexr.slice(8)}\n) return funs[${i}].call(a, a);\n`;
    } else if (af.params.length === 0) {
      code += `return funs[${i}].call(a);\n`;
    } else throw new Error("empty");
  });
  code += `throw new Error('empty');\n}\n`;
  return new Function(code).call(null, funs);
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
  }
}
