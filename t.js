// @flow strict
const ast = require("./lib/babel");

type n3<OT: {} = {}> = {
  N: null[],
  a: mixed[][],
  n: number[],
  s: string[],
  b: boolean[],
  u: void[],
  o: OT[],
};

export const call = (f: ({}) => mixed, ...args: Array<mixed>): mixed => {
  const proto = { type: "" };
  const aob = Object.create(proto);
  for (let a of args) {
    const tn = Array.isArray(a) ? "a" : a === null ? "N" : (typeof a)[0];
    if (Array.isArray(aob[tn])) aob[tn].push(a);
    else aob[tn] = [a];
  }
  proto.type = "";
  for (let tn of "aNnsbuf")
    if (aob[tn]?.length) proto.type += tn + aob[tn].length;
  if (aob.o?.length) {
    proto.type += "o[";
    aob.o.forEach((x, i) => {
      if (typeof x?.type === "string") proto.type += x.type;
      else proto.type += "{}";
      if (i + 1 < aob.o.length) proto.type += ";";
    });
    proto.type += "]";
  }
  return f(aob);
};
export const overload = <F: {}>(...fns: Array<F>): (({}) => mixed) => {
  var code = `const [fns] = arguments;\nreturn a => {\n`;
  fns.forEach((f, i) => {
    const {
      program: { body },
    } = ast.parse(f.toString());
    if (
      body.length === 1 &&
      body[0].type === "ExpressionStatement" &&
      body[0].expression.type === "ArrowFunctionExpression" &&
      body[0].expression.params.length === 1 &&
      body[0].expression.params[0].type === "ObjectPattern"
    ) {
      let bexr = "true";
      ObjectPattern(body[0].expression.params[0], "a", (r) => {
        bexr = bexr + " && \n" + r;
      });
      code += `if(\n${bexr.slice(8)}\n){return fns[${i}].call(a, a)};\n`;
    }
  });
  code += `throw new Error('empty');\n}\n`;
  return new Function(code).call(null, fns);

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
        } else {
          throw new Error("empty");
        }
      });
    }
  }
};
// prettier-ignore
const o = overload(
  ({ n, s: [sa, sb, sc], o: [ { n: [subn], o: [ { n: [subn2], }, ], }, ], }: n3<n3<n3<>>>) => {
    console.log('{ n, s: [sa, sb, sc], o: [ { n: [subn], o: [ { n: [subn2], }, ], }, ], }',sa, sb, sc);
  },
  ({ a: [l, r] }: n3<>) => {
    console.log("{ a: [l, r] }",{ l, r });
  },
  ({ n: [a, b, ...ns], ...rest }: n3<>) => {
    console.log('{ n: [a, b, ...ns], ...rest }',a, b);
  }
);
// prettier-ignore
call( o, 1, 2, "a", "b", "c", call( (a) => a, 1, call((a) => a, 1)));
