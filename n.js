const mn = require("./mn");
const rna = require("./rna");
console.clear();

const dna = mn`
  E → E + T
    | T
  T → T * F
    | F
  F → ( E )
    | id
`;
const s = rna(mn`S → S a / b / ε`);
//console.log(s.toString());
function rotate(l) {
  let r = null;

  while (l) {
    r = [l[0], r];
    l = l[1];
  }
  return r;
}
console.log(rotate([2, [1, [0, null]]]));
first_pith(
  { h: [], t: [], f: [], o: console.log.bind(console) },
  "A",
  s(),
  null
);
function first_pith(c, m, h, t) {
  match(m, {
    A() {
      if (c.h.indexOf(h) < 0) {
        c.h.push(h);
        c.t.push(t);
        h(c, first_pith);
      } else {
        t(c, skip_pith);
      }
    },
    T() {
      c.f.push(h);
      t(c, skip_pith);
    },
  });
}
function skip_pith(c, m, h, t) {
  if (m !== "G") t(c, skip_pith);
  else if (t) t(c, first_pith);
  else {
    c.o(c.h, c.f);
    c.h.pop();
    t = c.t.pop();
    c.f = [];
    if (t) t(c, skip_pith);
  }
}

console.log("done");
function match(m, s, d) {
  return (s[m] || d)();
}
