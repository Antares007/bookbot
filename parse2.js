const adenine = "α",
  cytosine = "ξ",
  guanine = "γ",
  thymine = "τ";

tdd({
  [`S → a / ε        `]: ["a", ""],
  [`B → a B / o B / b`]: ["aob", "aaoob", "aaaooob"],
  [`S → A B / B A
    A → a a
    B → a b          `]: ["aaab", "abaa"],
  [`S → A / c b
    A → c B
    B → a            `]: ["cb", "ca"],
  [`
    C → c S
    A → a S
    B → b S
    S → A / B / ε    `]: ["cab"],
  [`
    S → b A
    A → a A / ε
                     `]: ["baaa"],
  //[`
  //  S → S a / b      `]: ["baaa"],
  //[`
  //  A → C a
  //  B → C b
  //  C → A | B | c    `]: ["cab"],
});
function oplr(cyto, input, pos = 0, bark = (n, p) => setImmediate(() => n(p))) {
  return (o) => {
    var counter = 99;
    const stack = [];
    const tails = [];
    p(cyto, null);
    function n(s, t) {
      if (guanine !== typeOf(s)) t(n);
      else if (t) bark(t, p);
      else {
        let se;
        while ((se = stack.pop())[0] !== cytosine);
        pos = se[1];
        t = tails.pop();
        if (t == null)
          return o(
            -1,
            `cant parse [${input.slice(pos)}] with [${toString(cyto)}]`
          );
        bark(t, n);
      }
    }
    function lr(s, t) {
      if (guanine === typeOf(s)) t(n);
      else t(lr);
    }
    function p(s, t) {
      if (counter-- === 0) return o("C");
      o(configuration() + " " + nameOf(s) + " " + toString(t));
      const type = typeOf(s);
      if (cytosine === type) {
        let islr = false;
        for (let l = stack.length - 1; l > -1 && stack[l][0] === cytosine; l--)
          if (stack[l][2] === nameOf(s)) {
            islr = true;
            break;
          }
        if (islr)
          return oplr(
            function R(o) {
              t(function p(h, t) {
                if (guanine === typeOf(h)) t(o);
                else t(p);
              });
            },
            input,
            pos,
            bark
          )((rpos, value) => {
            if (typeof rpos === "string") return o("_" + rpos);
            if (rpos < 0) return o(rpos, value);
            stack.push([adenine, pos, value]);
            pos = rpos;
            tails.push(function _() {});
            p(null)
            t(function p(h, t) {
              if (guanine === typeOf(h))
                o(h, (o) => {
                  o("", (o) => {
                    o(function _(a) {return a}, null);
                  });
                });
              else o(h, (o) => t(p));
            });
            //  function _() {}
          });
        stack.push([cytosine, pos, nameOf(s)]);
        tails.push(t);
        bark(s, p);
      } else if (thymine === type) {
        let len = match(s, input, pos);
        if (len < 0) {
          while (peek(stack)[0] !== cytosine) stack.pop();
          pos = peek(stack)[1];
          bark(t, n);
        } else {
          stack.push([type, pos, s]);
          pos = pos + len;
          bark(t, p);
        }
      } else if (guanine === type) {
        let args = [];
        let endpos = pos;
        let se;
        while ((se = stack.pop())[0] !== cytosine) {
          const arg = adenine === se[0] ? se[2] : input.slice(se[1], endpos);
          args.unshift(arg);
          endpos = se[1];
        }
        if (peek(tails)) {
          stack.push([adenine, se[1], s(...args)]);
          o("reduce&continue"), bark(tails.pop(), p);
        } else o(pos, s(...args));
      } else {
        o("error");
      }
    }
    function configuration() {
      const cols = [15, 9, 10];
      const s = stack.map((a) => a[0] + nameOf(a[2])).join("");
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
  return s[s.length - 1];
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
      : x.name[0] === "_"
      ? guanine
      : cytosine
    : "string" === typeof x
    ? thymine
    : "N";
}
function nameOf(x) {
  return "function" === typeof x ? x.name : x === "" ? "ε" : x;
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
function _(...args) {return r(...args)}
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
  if (x.length === 0) return "o=>{\no(_,\t\tnull)}";
  const name = description[1] === "→" ? description.splice(0, 2)[0] : "";
  const symbol = description.shift();
  return (
    (name ? "function " + name + "(o)" : "o=>") +
    "{\n" +
    "o(" +
    ("A" <= symbol[0] && symbol[0] <= "Z"
      ? symbol
      : symbol[0] === "/" || symbol[0] === "|"
      ? "_"
      : symbol === "ε"
      ? '""'
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
      const parser = oplr(S, input, 0, (n, p) => n(p));
      const log = [];
      let rez;
      let output;
      parser((x, v) => {
        if (typeof x === "number") {
          rez = x;
          output = v;
        } else log.push(x);
      });
      if (rez < 0 || output !== input) {
        console.log(g);
        console.log(log.join("\n"));
        console.log(output);
      }
    }
  }
}
