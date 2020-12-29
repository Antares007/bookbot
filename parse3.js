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
//const ABO = mn`
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
const tdda = () => {}
tdda({
  [`S → ab              `]: ["ab"],
  [`S → a | ε           `]: ["a"],
  [`B → a B | o B | b   `]: ["aob", "aaoob", "aaaooob"],
  [`S → A B | B A
    A → a a
    B → a b             `]: ["aaab", "abaa"],
  [`S → A B | B A
    C → a
    A → C a
    B → C b             `]: ["aaab", "abaa"],
  [`S → A / c b
    A → c B
    B → a               `]: ["cb", "ca"],
  [`C → c S
    A → a S
    B → b S
    S → A / B / ε       `]: ["cab"],
  [`S → ^a+ ^b* | ε     `]: ["", "a", "aaabbb", "abbbb"],
  [`S → b A
    A → a A | ε         `]: ["baaa"],
  //[`S → S a / b
  //  A → S a / S b     `]: ["baaa"],
  //[`
  //  A → C a | e |
  //  B → C b |
  //  C → A | B | c |   `]: ["cab"],
});

//            A                           C
//            ↓                           ↓
//            C a | e |                   A | B | c |
//            ↓                           ↓
//            A | B | c |                 C a | e |
//            ↓                           ↓
//            C a | e |                   A | B | c |
//            ↓                           ↓
//            A | B | c |                 C a | e |
//            ↓                           ↓
//      C a | e |                 A | B | c |
//
//            S
//            ↓
//            S a | b |
//            ↓
//            S a | b |
//            ↓
//            S a | b |
//            ↓
//      S a | b |

const gtxt = `S → S a | b`;
const dna = mn([gtxt]);
const g = rna(dna);
// seen output path head input
// SOPHI
console.log(g.toString());
function parse(S, input, pos = 0) {
  return (o) =>
    S(
      {
        head: [[pos, "A", S]],
        tail: [null],
        input,
        ident: 0,
        o,
      },
      parse_pith
    );
}
parse(g(), "baaa")(console.log.bind(console));
function skip(c, m, h, t) {
  if (m === "G") t(c[0], c[1]);
  else t(c, skip);
}
function parse_pith(c, m, h, t = null) {
  if ((c.so = (c.so || 0) + 1) > 9) return c.o(-39, "stackoverflow");
  c.o(
    (c.so + "").padStart(2, "0") +
      (" " + m) +
      (nameof(h).padStart(4, " ") + nameof(t).padStart(4, " ") + ">") +
      configToString(c)
  );
  match(m, {
    A() {
      const islr = c.head[0][2] === h;
      c.head = [[c.head[0][0], "A", h], c.head];
      c.tail = [t, c.tail];
      if (!islr) h(c, parse_pith);
      else t([c, parse_pith], skip);
    },
    T() {
      let len = match_term(h, c.input, c.head[0][0]);
      if (len < 0) {
        while (c.head[0][1] !== "A") c.head = c.head[1];
        t(c, find_next_production_pith);
      } else {
        const cpos = c.head[0][0];
        const npos = cpos + len;
        const term = c.input.slice(cpos, npos);
        c.head = [[npos, "T", term, h], c.head];
        t(c, parse_pith);
      }
    },
    G() {
      const args = [];
      const npos = c.head[0][0];
      while (c.head[0][1] !== "A") {
        args.unshift(c.head[0][2]);
        c.head = c.head[1];
      }
      const u = [npos, "U", h(...args), c.head[0][2]];
      c.head = c.head[1];
      c.head = [u, c.head];
      const ct = c.tail[0];
      c.tail = c.tail[1];
      if (ct) ct(c, parse_pith);
      else c.o(c.head[0]);
    },
  });
}
function find_next_production_pith(c, m, h, t) {
  match(m, {
    G() {
      if (t) return t(c, parse_pith);
      t = c.tail[0];
      c.head = c.head[1];
      c.tail = c.tail[1];
      if (t) t(c, find_next_production_pith);
      else c.o(-1);
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
function toArray(l) {
  const a = [];
  while (l) {
    a.push(l[0]);
    l = l[1];
  }
  return a;
}
function configStep(s) {
  return match(s[1], {
    A: () => "α" + s[2].name,
    U: () => "υ" + s[3].name + s[2],
    T: () => "τ" + s[2],
  });
}
function configToString(c) {
  const cols = [18, 9, 12];
  const s = subscript(toArray(c.head).reverse().map(configStep).join(";"));
  const t = subscript(
    toArray(c.tail)
      .map((t) => nameof(t))
      .join(";")
  );
  const i = c.input.slice(c.head[0][0]);
  const p = c.head[0][0].toString().padStart(2, " ");

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
    const gr = rna(mn([key]));
    const g = gr((...a) => a.join(""));
    for (let input of tests[key]) tasks.push([g, input, gr.toString()]);
  }
  setImmediate(next);
  function next() {
    const t = tasks.shift();
    if (!t) return;
    const logs = [];
    const c = { head: [[0, "A"], null], tail: [null, null], input: t[1], o };
    var gotrez = false;
    function o(rez) {
      if (typeof rez === "string") return logs.push(rez);
      gotrez = true;
      if (rez < 0 || rez[2] !== t[1]) {
        console.log(t[1]);
        console.log(t[2]);
        console.log(logs.join("\n"));
        console.log(JSON.stringify(rez));
      } else process.stdout.write(".");
      setImmediate(next);
    }
    try {
      t[0](c, parse_pith);
      if (!gotrez) console.log("dont have rez");
    } catch (e) {
      console.log(e);
    }
  }
}
