// @flow strict
const { bexp } = require("./bexp");
const { static_cast } = require("./utils/static_cast");
const r = /(\(\)|\({.*}\))/;

export function A(f: mixed, ...aies: Array<mixed>): mixed {
  var args = [f];
  for (let a of aies)
    if (a !== null && typeof a === "object" && a.constructor.name === "Object")
      if (aies.length === 1) return static_cast<(mixed) => void>(f)(a);
      else for (let k of Object.keys(a)) args = args.concat(a[k]);
    else args.push(a);
  return C.apply(null, args);
}
export function B(...funs: Array<mixed>): mixed {
  const body =
    "->\n" +
    funs
      .map((f) => {
        const s = r.exec(
          f
            .toString()
            .replace(/\n/g, " ")
            .replace(/  /g, " ")
            .replace(/  /g, " ")
            .replace(/  /g, " ")
        );
        if (s) return s[0].replace(/"/g, "");
        return f.toString();
      })
      .join("\n");
  var code = `const funs = arguments[0];\nreturn a => {\n`;
  funs.forEach((f, i) => {
    if (typeof f === "function")
      code += `if(${bexp(
        static_cast<() => void>(f),
        "a"
      )}\n) return funs[${i}].call(a, a);\n`;
    else throw new Error(`args[${i}] for B is ${typeof f}`);
  });
  code += `throw new Error(JSON.stringify(a)+\`${body}\`);\n}\n`;
  return new Function(code).call(null, funs);
}
export function C(f: mixed, ...args: Array<mixed>): mixed {
  const proto = { type: "" };
  const abc = Object.create(proto);
  for (let a of args) {
    const tn = (typeof a)[0];
    if (Array.isArray(abc[tn])) abc[tn].push(a);
    else abc[tn] = [a];
  }
  proto.type = "";
  for (let tn of "nsbuf")
    if (abc[tn]?.length)
      proto.type += tn + (abc[tn].length > 1 ? abc[tn].length : "");
  if (abc.o?.length) {
    proto.type += "o[";
    abc.o.forEach((x, i) => {
      if (typeof x?.type === "string") proto.type += x.type;
      else proto.type += "{}";
      if (i + 1 < abc.o.length) proto.type += ";";
    });
    proto.type += "]";
  }
  return static_cast<({}) => mixed>(f)(abc);
}
