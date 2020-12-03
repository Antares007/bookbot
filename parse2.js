const adenine = "α",
  cytosine = "ξ",
  guanine = "γ",
  thymine = "τ";

const E = makeCytosine(`
  E → E + T / T
  T → T * F / F
  F → ( E ) / id
`);
// A  → Aα / β
// ------------
// A  → βA’
// A’ → αA’/ ∈

// prettier-ignore
function B(o) {
  o("a", o=>{
  o( B , o=>{
  o( γ , o=>{
  o("o", o=>{
  o( B , o=>{
  o( γ , o=>{
  o("b", o=>{
  o( γ , null)})})})})})})})
  function γ(){}
}
tdd({
  [`B → a B / o B / b`]: ["aob", "aaoob", "aaaooob"],
  [`S → A B / B A
    A → a a
    B → a b          `]: ["aaab", "abaa"],
  [`S → A / c b
    A → c B
    B → a            `]: ["cb", "ca"],
//  [`S → b / S a      `]: ["baaa"],
})
function oplr(cyto, input) {
  return (o) => {
    var counter = 39;
    const stack = [];
    const tails = [];
    var pos = 0;
    const γ = (a) => o(pos === input.length, a);
    p(cyto, (o) => o(γ));
    function n(s, t) {
      if (guanine !== typeOf(s)) t(n);
      else if (t) t(p);
      else {
        let se;
        while ((se = stack.pop())[0] !== cytosine);
        pos = se[1];
        tails.pop()(n);
      }
    }
    function p(s, t) {
      if (counter-- === 0) return o("counter 0");
      o(configuration() + "  " + nameOf(s) + " " + toString(t));
      const type = typeOf(s);
      if (cytosine === type) {
        stack.push([type, pos, nameOf(s)]);
        tails.push(t);
        s(p);
      } else if (thymine === type) {
        let len
        if ((len = match(s, input, pos)) < 0) {
          while (peek(stack)[0] !== cytosine) stack.pop()
          pos = peek(stack)[1]
          t(n);
        } else {
          stack.push([type, pos, s]);
          pos = pos + len;
          t(p);
        }
      } else if (guanine === type) {
        let args = [];
        let endpos = pos;
        let se
        while ((se = stack.pop()) && se[0] !== cytosine) {
          args.unshift(
            adenine === se[0] ? se[2] : input.slice(se[1], endpos)
          );
          endpos = se[1];
        }
        stack.push([adenine, endpos || 0, s(...args)]);
        if(peek(tails)) tails.pop()(p);
      } else {
        o("error");
      }
    }
    function configuration() {
      const cols = [20, 5, 10];
      const s = stack.map((a) => a[0] + a[2]).join("");
      const t = tails.map((t) => toString(t)).join(",");
      const i = input.slice(pos);
      return (
        s.padStart(cols[0], " ").slice(-cols[0]) +
        " " +
        i.padStart(cols[1], " ").slice(-cols[1]) +
        " " +
        t.padEnd(cols[2], " ").slice(0, cols[2])
      );
    }
  };
}
function peek(s) {
  return s[s.length-1];
}
function toString(c) {
  if (c == null) return "N";
  var str = "";
  c(function p(h, t) {
    str = str + nameOf(h);
    t && t(p);
  });
  return str;
}
function match(str, input, offset) {
  const l = str.length;
  if (input.length < l + offset) return -1;
  var i = 0;
  while (i < l && str[i] === input[i + offset]) i++;
  if (i === l) return l;
  return -1;
}
function print(c) {
  const m = {};
  const tail = null;
  const write = process.stdout.write.bind(process.stdout);
  bark(c);
  function bark(c) {
    if (m[c.name]) return;
    m[c.name] = true;
    write(c.name + " →");
    c(pith);
    write("\n");
  }
  function pith(h, t) {
    const type = typeOf(h);
    if (cytosine === type) setImmediate(() => bark(h));
    write(" " + nameOf(h));
    t && t(pith);
  }
}
function typeOf(x) {
  return "function" === typeof x
    ? x.name.length === 0
      ? adenine
      : x.name[0] === "γ"
      ? guanine
      : cytosine
    : "string" === typeof x
    ? thymine
    : "N";
}
function nameOf(x) {
  return "function" === typeof x ? x.name : x;
}
function makeCytosine(description) {
  const funstr = description
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((s) => makeFun(s))
    .join("\n");
  const Sname = description.slice(0, description.indexOf("→")).trim();
  return new Function(`
return function(r=console.log.bind(console)) {
function γ(...args) {return r(...args)}
return ${Sname};
${funstr}
}`)();
}
function makeFun(x) {
  const description = Array.isArray(x)
    ? x
    : x
        .split(" ")
        .map((s) => s.trim())
        .filter(Boolean);
  if (x.length === 0) return "o=>{\no(γ,\t\tnull)}";
  const name = description[1] === "→" ? description.splice(0, 2)[0] : "";
  const symbol = description.shift();
  return (
    (name ? "function " + name + "(o)" : "o=>") +
    "{\n" +
    "o(" +
    ("A" <= symbol[0] && symbol[0] <= "Z"
      ? symbol
      : symbol[0] === "/" || symbol[0] === "|"
      ? "γ"
      : '"' + symbol + '"') +
    ",\t\t" +
    makeFun(description) +
    ")}"
  );
}
function tdd(tests) {
  for (let g in tests) {
    const cyto = makeCytosine(g);
    const S = cyto((...args) => args.join(""));
    for (let input of tests[g]) {
      const parser = oplr(S, input);
      const log = [];
      var rez = false;
      try {
        parser((x, v) => {
          if (typeof x === "boolean") rez = x && v === input;
          else log.push(x);
        });
      } catch (e) {
        log.push(e.stack.split(" at ").slice(0, 2));
      }
      if (!rez) {
        console.log(g);
        console.log(log.join("\n"));
      }
    }
  }
}
