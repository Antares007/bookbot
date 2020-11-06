// @flow strict
const { bexp } = require("./bexp");
const { static_cast } = require("./utils/static_cast");
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
  return static_cast<({}) => mixed>(f)(aob);
}
export function B(...funs: Array<mixed>): ({}) => mixed {
  var code = `const funs = arguments[0];\nreturn a => {\n`;
  funs.forEach((f, i) => {
    if (typeof f === "function")
      code += `if(${bexp(
        static_cast<() => void>(f),
        "a"
      )}\n) return funs[${i}].call(a, a);\n`;
    else throw new Error("arg for B is not a function");
  });
  code += `throw new Error('empty');\n}\n`;
  return new Function(code).call(null, funs);
}
