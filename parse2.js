const adenine = "α",
  cytosine = "ξ",
  guanine = "γ",
  thymine = "τ";
const typeOf = (x) =>
  "function" === typeof x
    ? x.name.length === 0
      ? adenine
      : x.name[0] !== "_"
      ? cytosine
      : guanine
    : "string" === typeof x
    ? thymine
    : "N";
const nameOf = (x) => ("function" === typeof x ? x.name : x);

// A  → Aα / β
// ------------
// A  → βA’
// A’ → αA’/ ∈
function S(o) {
  o(S, (o) => {
    o("a", (o) => {
      o(
        function _() {},
        (o) => {
          o("b", (o) => {
            o(function _() {}, null);
          });
        }
      );
    });
  });
}
function E(o) {
  o(E, (o) => {
    o("+", (o) => {
      o(T, (o) => {
        o(
          function _() {},
          (o) => {
            o(T, null);
          }
        );
      });
    });
  });
  function T(o) {
    o(T, (o) => {
      o("*", (o) => {
        o(F, (o) => {
          o(
            function _() {},
            (o) => {
              o(F, null);
            }
          );
        });
      });
    });
  }
  function F(o) {
    o("(", (o) => {
      o(E, (o) => {
        o(")", (o) => {
          o(
            function _() {},
            (o) => {
              o("id", null);
            }
          );
        });
      });
    });
  }
}
// prettier-ignore
function B(o) {
  o("a", (o) => {
  o( B , (o) => {
  o( _ , (o) => {
  o("o", (o) => {
  o( B , (o) => {
  o( _ , (o) => {
  o("b", (o) => {
  o( _ , null);
  })})})})})})})
  function _() {}
}
const BB = makeCytosine(`

  B → a B | o B | b


`);
print(BB);
const parser = oplr(BB, "aob");
var state = {};
parser((r) => {
  if ("function" === typeof r) state = r(state);
  else console.log(r);
});

function oplr(cyto, input) {
  return (o) => {
    var counter = 99;
    const stack = [];
    const tails = [];
    var pos = 0;
    const configuration = () => {
      const cols = [40, 15, 20];
      const s = stack.map((a) => a.join("")).join(",");
      const t = tails.map((t) => typeOf(t)).join(",");
      const i = input.slice(pos);
      return (
        s.padStart(cols[0], " ").slice(-cols[0]) +
        " " +
        i.padStart(cols[1], " ").slice(-cols[1]) +
        " " +
        t.padStart(cols[2], " ").slice(-cols[2])
      );
      return `[${s}][${t}][${pos}]${i}`;
    };
    setImmediate(() => p(cyto, (o) => o(function _() {})));
    function n(s, t) {
      o("N" + typeOf(s));
      setImmediate(() => t(guanine === typeOf(s) ? p : n));
    }
    function p(s, t) {
      if (counter-- === 0) return o("counter 0");
      o(configuration() + "  " + nameOf(s) + typeOf(t));
      const type = typeOf(s);
      if (cytosine === type) {
        stack.push([type, pos, nameOf(s)]);
        tails.push(t);
        setImmediate(() => s(p));
      } else if (thymine === type) {
        let len = match(s, input, pos);
        if (len < 0) {
          setImmediate(() => t(n));
        } else {
          stack.push([type, len, s]);
          pos = pos + len;
          setImmediate(() => t(p));
        }
      } else if (guanine === type) {
        let tmp;
        while ((tmp = stack.pop()) && tmp[0] !== cytosine);
        (tmp = tails.pop()) && setImmediate(() => tmp(p));
      } else {
        o("error");
      }
    }
  };
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
function makeCytosine(description, r = console.log.bind(console)) {
  const funstr = description
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((s) => makeFun(s))
    .join(";");
  const Sname = description.slice(0, description.indexOf("→")).trim();
  return new Function(
    `return function() {const _ = (...args) => arguments[0](...args);${funstr};return ${Sname};}`
  )()(r);
}
function makeFun(x) {
  const description = Array.isArray(x)
    ? x
    : x
        .split(" ")
        .map((s) => s.trim())
        .filter(Boolean);
  if (x.length === 0) return "o=>{\no(_,\t\tnull)\n}";
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
      : '"' + symbol + '"') +
    ",\t\t" +
    makeFun(description) +
    ")}"
  );
}
