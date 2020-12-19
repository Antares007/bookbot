console.clear();
const programmer = require("./programmer");
const mn = require("./mn");
const rna = require("./rna");
//const E = programmer`
//  E → E + T ${0} | T ${function Σ() {}}
//  T → T * F | F
//  F → ( E ) | id
//`;
// L = {aⁿbⁿcⁿ | n ≥ 0}

//const ABCn = programmer`
//  L → ABC ${(a, b, c) => {
//    if (a === b && b == c) return a;
//    else throw new Error("abc");
//  }}
//  A → A a ${(a, v) => a + 1} | ε ${0}
//  B → B b ${(a, v) => a + 1} | ε ${0}
//  C → C c ${(a, v) => a + 1} | ε ${0}
//`;
//
const createNumber = (s) => parseInt(s, 10);
const createString = (l, s, r) => s;
const product = (...a) => {};
const sum = (...a) => {};
const id = (...a) => {};
const assign = (...a) => {};
const lhsOperationRhs = (lhs, op, rhs) =>
  match(op, {
    "+": (l, o, r) => l + r,
    "-": (l, o, r) => l - r,
    "*": (l, o, r) => l * r,
    "/": (l, o, r) => l / r,
  });
// prettier-ignore
//const ABO = programmer`
//  S       → ^[\\x20\\n\\r\\t]+
//  Number  → ^[1-9][0-9]* ${createNumber}
//  String  → " ^[^"]* " ${createString}
//  E       → E S ^[\\+-] S T ${lhsOperationRhs} T ${id}
//  T       → T S ^[\\*/] S F ${lhsOperationRhs} F ${id}
//  F       → ( S E S )
//          | C
//          | Number
//          | String
//  Es      → Es S E | E
//  N       → ^[A-Z]+[A-Z|a-z|0-9]*
//  OP      → {}
//  BO      → {}
//  Nar     → N ( S OP S ) BO
//  C       → *( S   Es S ) ${product}
//          | +( S   Es S ) ${sum}
//          | =( S N Es S ) ${id}
//          |  ( S N Es S ) ${id}
//`;
//const xx = programmer`
//  S → S a ${function cons(){}}| a ${function unit(){}}
//  B → z ${function Σ(){}}
//      b
//      S
//`
//console.log(xx.toString());

//const G = programmer`B → a B | o B | b`;
//console.log(subscript(G.toString()));
//const c = {
//  stack: [[]],
//  tails: [],
//  pos: 0,
//  input: "aob",
//};
//parse_pith(
//  c,
//  G((...a) => a.join("")),
//  function Z0(c, o) {
//    console.log(JSON.stringify(c));
//  }
//);
const tdda = ()=>{}
tdda({
  [`S → ab            `]: ["ab"],
  [`S → a | ε         `]: ["a"],
  [`B → a B | o B | b `]: ["aob", "aaoob", "aaaooob"],
  [`S → A B | B A
    A → a a
    B → a b           `]: ["aaab", "abaa"],
  [`S → A / c b
    A → c B
    B → a             `]: ["cb", "ca"],
  [`C → c S
    A → a S
    B → b S
    S → A / B / ε     `]: ["cab"],
  [`S → ^a+ ^b* | ε   `]: ["", "a", "aaabbb", "abbbb"],
  [`S → b A
    A → a A | ε       `]: ["baaa"],
  //[`S → S a / b
  //  A → S a / S b   `]: ["baaa"],
  //[`
  //  A → C a | e
  //  B → C b
  //  C → A | B | c   `]: ["cab"],
});
// A    C
// C a  A
// A    C a
// C a  A
// A    C a
// C a  A
// A    C a
// e    c

const _ = (...a) => a.join("");

//const _0	    =(s,o)=>o(s,	_,	  null,	'G')
//const ε_0	    =(s,o)=>o(s,	"",	  _0,	  'T')
//const _ε_0	  =(s,o)=>o(s,	_,	  ε_0,	'G')
//const A_ε_0	  =(s,o)=>o(s,	A,	  _ε_0,	'A')
//const aA_ε_0	=(s,o)=>o(s,	"a",	A_ε_0,'T')
//
//const A_0	    =(s,o)=>o(s,	A,	  _0,	  'A')
//const bA_0	  =(s,o)=>o(s,	"b",	A_0,	'T')

const c = {
  stack: [],
  tails: [],
  pos: 0,
  input: "baaa",
  o: console.log.bind(console),
};
const g = rna(mn`
S → A B | B A
    A → a a
    B → a b`);
console.log(g.toString());
parse_pith(
  { input: "aaab", pos: 0, o: console.log.bind(console) },
  "A",
  g(),
  null
);
function parse_pith(c, m, h, t = null) {
  if ((c.so = (c.so || 0) + 1) > 39) return c.o(-19, "stackoverflow");
  c.o(("P" + m + ">").padStart(5, " "), c);
  match(m, {
    A() {
      h({ ...c, vh: [h, c.vh], vt: [t, c.vt], tail: c }, parse_pith);
    },
    T() {
      let len = match_term(h, c.input, c.pos);
      if (len < 0) {
        throw new Error('na')
        t(c, find_next_production_pith);
      } else {
        t(
          { ...c, stack: [["T", h, len], c.stack], pos: c.pos + len, tail: c },
          parse_pith
        );
      }
    },
    G() {
      const terms = c.stack.shift();
      const lhs = terms.shift();
      let start = lhs[2];
      const r = h(
        ...terms.map(([m, t, l], i) =>
          match(m, {
            U: () => ((start += l), t),
            T: () => c.input.slice(start, (start += l)),
          })
        )
      );
      const u = ["U", r, start - lhs[2], lhs[1]];
      if (c.stack.length) c.stack[0].push(u), c.tails.shift()(c, parse_pith);
      else if (c.tails[0] === null) c.o(u);
      else c.o(-1);
    },
  });
}
function skip_matched_terms_pith(c, m, h, t) {
  c.o(("SMT" + m + ">").padStart(5, " ") + configToString(c));
  parse_pith(c, m, h, t);
}
function find_next_production_pith(c, m, h, t) {
  c.o(("FNP" + m + ">").padStart(5, " ") + configToString(c));
  match(m, {
    G() {
      if (t) return t(c, skip_matched_terms_pith);
      c.pos = c.stack.shift()[0][2];
      if (c.tails[0] === null) return c.o(-1);
      c.tails.shift()(c, find_next_production_pith);
    },
    default() {
      t(c, find_next_production_pith);
    },
  });
}
function match_term(str, input, offset) {
  if (str[0] === "^") {
    const r = new RegExp(str);
    const rez = r.exec(input.slice(offset));
    return rez ? rez[0].length : -1;
  }
  const l = str.length;
  if (input.length < l + offset) return -1;
  var i = 0;
  while (i < l && str[i] === input[i + offset]) i++;
  if (i === l) return l;
  return -1;
}

function configToString(c) {
  const cols = [36, 9, 63];
  const s = subscript(
    [...c.stack]
      .reverse()
      .map((a) => a.map((a) => a[0] + nameof(a[1])).join(""))
      .join(" ")
  );
  const t = subscript(c.tails.map((t) => nameof(t)).join(" "));
  const i = c.input.slice(c.pos);
  const p = c.pos.toString().padStart(2, " ");

  //prettier-ignore
  return `${s.padStart(cols[0], " ").slice(-cols[0])} ${p} ${
            i.padStart(cols[1], " ").slice(-cols[1])} ${
            t.padEnd  (cols[2], " ").slice(0, cols[2])}`;
}
function match(v, map) {
  return (map[v] || map.default)();
}
function nameof(x) {
  return typeof x === "function"
    ? x.name
    : x === ""
    ? "ε"
    : x == null
    ? "Z0"
    : typeof x === "string"
    ? x
    : typeof x;
}
function subscript(x) {
  return x
    .replace(/0/g, "₀")
    .replace(/1/g, "₁")
    .replace(/2/g, "₂")
    .replace(/3/g, "₃")
    .replace(/4/g, "₄")
    .replace(/5/g, "₅")
    .replace(/6/g, "₆")
    .replace(/7/g, "₇")
    .replace(/8/g, "₈")
    .replace(/9/g, "₉");
}
function tdd(tests) {
  const tasks = [];
  for (let key in tests) {
    const gr = programmer([key]);
    const g = gr((...a) => a.join(""));
    for (let input of tests[key]) tasks.push([g, input, gr.toString()]);
  }
  setImmediate(next);
  function next() {
    const t = tasks.shift();
    if (!t) return;
    const logs = [];
    const c = { stack: [], tails: [], pos: 0, input: t[1], o };
    var gotrez = false;
    function o(rez) {
      if (typeof rez === "string") return logs.push(rez);
      gotrez = true;
      if (rez < 0 || rez[1] !== t[1]) {
        console.log(t[1]);
        console.log(t[2]);
        console.log(logs.join("\n"));
        console.log(JSON.stringify(rez));
      } else process.stdout.write(".");
      setImmediate(next);
    }
    try {
      parse_pith(c, "A", t[0], null);
      if (!gotrez) console.log("dont have rez");
    } catch (e) {
      console.log(e);
    }
  }
}
