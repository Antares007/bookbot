const programmer = require("./programmer");
const E = programmer`
  E → E + T ${0} | T ${function Σ(){}}
  T → T * F | F
  F → ( E ) | id 
`;
// L = {aⁿbⁿcⁿ | n ≥ 0}

const dna = programmer`
  S         → ^[\\x20\\n\\r\\t]*
  Alfa      → ^[A-Z|a-z] ${()=>{}}
  A →  
`;


// B → a B | o B | b
console.log(dna.toString())
//print(dna())

//oplr(dna(), "B", "aob");

function oplr(dna, n, input) {
  const c = {
    stack: [["C", 0, n]],
    tails: [],
    pos: 0,
    input,
    m: {},
  };
  dna({ s: c, p: parse_pith, n }, seek_pith);
  //dna(config, parse_pith);
}
function seek_pith(s, m, h, t) {
  if ("C" === m && h === s.n) t(s.s, s.p);
  else t(s, seek_pith);
}
function match(v, map) {
  (map[v] || map.default)();
}
function parse_pith(c, m, h, t) {
  console.log(configToString(c));
  match(m, {
    C() {
      console.log("C", h);
    },
    A() {
      console.log("A", h);
    },
    G() {
      console.log("G");
    },
    T() {
      console.log("T", h);
    },
    default() {
      console.log(m, h);
    },
  });
  t && t(c, parse_pith);
}
function configToString(c) {
  const cols = [15, 9, 10, 10];
  const s = c.stack.map((a) => a[0] + a[2]).join("");
  const t = c.tails.map((t) => t).join(",");
  const i = c.input.slice(c.pos);
  const m = Object.keys(c.m).join(",");
  //prettier-ignore
  return `[${s.padStart(cols[0], " ").slice(-cols[0])}][${
             i.padStart(cols[1], " ").slice(-cols[1])}][${
             t.padEnd  (cols[2], " ").slice(0, cols[2])}][${
             m.padEnd  (cols[3], " ").slice(0, cols[3])}]`;
}

function print(c) {
  c(process.stdout.write.bind(process.stdout), print_pith);
}
function print_pith(s, m, h, t) {
  const C = () => s("\n" + h + " →");
  const G = () => s("\n\t|");
  const A = () => s(" " + h);
  const T = () => s("\x1b[32m " + h + "\x1b[0m");
  ({ C, A, T, G }[m]());
  if (t) t(s, print_pith);
  else s("\n");
}
