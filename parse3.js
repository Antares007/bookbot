const programmer = require("./programmer");
const E = programmer`
  E → E + T ${0} | T ${function Σ() {}}
  T → T * F | F
  F → ( E ) | id 
`;
// L = {aⁿbⁿcⁿ | n ≥ 0}

const ABCn = programmer`
  L → ABC ${(a, b, c) => {
    if (a === b && b == c) return a;
    else throw new Error("abc");
  }}
  A → A a ${(a, v) => a + 1} | ε ${0}
  B → B b ${(a, v) => a + 1} | ε ${0}
  C → C c ${(a, v) => a + 1} | ε ${0}
`;

console.clear();
const B = programmer`
B → a B | o B | b`;
console.log(subscript(B.toString()));
const c = {
  stack: [[]],
  tails: [],
  pos: 0,
  input: "aob",
};
var counter = 19;

parse_pith(
  c,
  B((...a) => a),
  function Z0(c, o) {
    console.log(JSON.stringify(c));
  }
);

function parse_pith(c, h, t = null, m = "A") {
  if (counter-- === 0) return console.log("stackoverflow");
  console.log(m + configToString(c));
  match(m, {
    A() {
      c.stack.unshift([["A", h, c.pos]]);
      c.tails.unshift(t);
      h(c, parse_pith);
    },
    T() {
      let len = match_term(h, c.input, c.pos);
      if (len < 0) t(c, find_next_production_pith);
      else {
        c.stack[0].push(["T", h, c.pos]);
        c.pos += len;
        t(c, parse_pith);
      }
    },
    G() {
      const terms = c.stack.shift();
      const lhs = terms.shift();
      const r = h(
        ...terms.map(([m, t, p], i) =>
          m === "U"
            ? t
            : c.input.slice(p, i + 1 === terms.length ? c.pos : terms[i + 1][2])
        )
      );
      c.stack[0].push(["U", r, lhs[2]]);
      c.tails.shift()(c, parse_pith);
    },
  });
}
function skip_matched_terms_pith(c, h, t, m) {
  parse_pith(c, h, t, m);
}
function find_next_production_pith(c, h, t, m) {
  console.log("n");
  match(m, {
    G() {
      t(c, skip_matched_terms_pith);
    },
    default() {
      if (t) t(c, find_next_production_pith);
      else {
        console.log("not implemented");
        //       let se;
        //       while ((se = stack.pop())[0] !== cytosine);
        //       pos = se[1];
        //       t = tails.pop();
        //       if (t == null)
        //         return o(
        //           -1,
        //           `cant parse [${input.slice(pos)}] with [${toString(cyto)}]`
        //         );
        //       bark(t, n);
      }
    },
  });
}
function match_term(str, input, offset) {
  const l = str.length;
  if (input.length < l + offset) return -1;
  var i = 0;
  while (i < l && str[i] === input[i + offset]) i++;
  if (i === l) return l;
  return -1;
}

function configToString(c) {
  const cols = [25, 9, 10, 10];
  const s = subscript(
    [...c.stack]
      .reverse()
      .map((a) => a.map((a) => a[0] + nameof(a[1]) + a[2]).join(""))
      .join(";")
  );
  const t = subscript(c.tails.map((t) => nameof(t)).join(""));
  const i = c.input.slice(c.pos);
  const p = c.pos.toString().padStart(2, " ");
  //prettier-ignore
  return `${s.padStart(cols[0], " ").slice(-cols[0])} ${p} ${
             i.padStart(cols[1], " ").slice(-cols[1])} ${
             t.padEnd  (cols[2], " ").slice(0, cols[2])}`;
}
function match(v, map) {
  (map[v] || map.default)();
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
