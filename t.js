// @flow
const { static_cast } = require("./src/utils/static_cast");
const ast = require("./lib/babel");

const call = (f, ...args) => {
  const aob = {};
  for (let a of args) {
    const t = Array.isArray(a) ? "a" : a === null ? "N" : (typeof a)[0];
    if (Array.isArray(aob[t])) aob[t].push(a);
    else aob[t] = [a];
  }
  aob.type = "";
  for (let tn of "aNnsbufo")
    if (aob[tn] && aob[tn].length)
      if (tn === "o") {
        aob.type += "o[";
        aob.o.forEach((x, i) => {
          if (typeof x?.type === "string") aob.type += x.type;
          else aob.type += "{}";
          if (i + 1 < aob.o.length) aob.type += ";";
        });
        aob.type += "]";
      } else aob.type += tn + aob[tn].length;

  return f(aob);
};
const Id = ({ s: [input], f: [o] }) => {
  call(o, 1, 2, 3);
};
type n3<OT: {} = {}> = {
  n: number[],
  s: string[],
  b: boolean[],
  u: void[],
  f: Function[],
  o: OT[],
};
const nmap = {
  ObjectPattern: (n: ast.ObjectPattern) => (o) => {
    console.log(n);
    o((s) => s + ";return;");
  },
};

const overload = (...fns: Array<Function>) => {
  var code = `return fns => a => {
  `;
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
    )
      nmap.ObjectPattern(body[0].expression.params[0])((r) => {
        code = r(code);
      });
  });
  code += `
    throw new Error('empty')
  }`;
  const f = new Function(code);
  console.log(f);
  return f.call()(fns);
};
const o = overload(
  ({
    n,
    s: [sa, sb],
    o: [
      {
        n: [subn],
      },
    ],
  }: n3<n3<>>) => {
    console.log(sa, sb);
  },
  ({ n: [a, b, ...ns], ...rest }: n3<>) => {
    console.log(a, b);
  }
);
call(o, 1, 2, 3, "a", "b");

//call(Id, 'inputtext', ({n:[a,b,c]})=>{
//  console.log(a,b,c)
//})
//const ramiz = call((a) => a, "ramiz", "bolkvadze");
//const otar = call((a) => a, "otar", "bolkvadze", ramiz);
//const archil = call((a) => a, "archil", "bolkvadze", otar);
const tn = call(
  (a) => a,
  1,
  true,
  "",
  void 0,
  () => {
    console.log(1);
  },
  [],
  {},
  null
);

//console.log(JSON.stringify(archil, null , '  '));
console.log(tn);

const rez = {
  string: ["archil", "bolkvadze"],
  object: [
    {
      string: ["otar", "bolkvadze"],
      object: [
        {
          string: ["ramiz", "bolkvadze"],
        },
      ],
    },
  ],
};
