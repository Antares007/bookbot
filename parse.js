const prod = Symbol("production");
function nonzerodigit(o) {
  o("1");
  o("2");
  o("3");
  o("4");
  o("5");
  o("6");
  o("7");
  o("8");
  o("9");
}
function digit(o) {
  o("0");
  nonzerodigit(o);
}
function nondigit(o) {
  o("_");
  o("a");
  o("b");
  o("c");
}
function identifier(o) {
  o(nondigit);
  o(identifier, nondigit);
  o(identifier, digit);
}
function restelement(o) {
  o("...", identifier);
}
function elements(o) {
  o(identifier);
  o(elements, ",", identifier);
}
function arraypattern(o) {
  o("[", elements, "]");
}
function typeid(o) {
  o("s");
  o("n");
}
function objectproperty(o) {
  o(typeid, ":", arraypattern);
  o(typeid);
}
function objectproperties(o) {
  o(objectproperty);
  o(objectproperties, ",", objectproperty);
}
function objectpattern(o) {
  o("{", "}");
  o("{", restelement, "}");
  o("{", objectproperties, "}");
  o("{", objectproperties, restelement, "}");
}
function id(o) {
  o("1");
  o("2");
  o("3");
}
function synmbolstostr(symbols) {
  return symbols.map(sname).join(" ");
}
function match(str, input, offset) {
  const l = str.length;
  if (input.length < l + offset) return -1;
  var i = 0;
  while (i < l && str[i] === input[i + offset]) i++;
  if (i == l) return l;
  return -1;
}
function sequal(a, b) {
  return isVar(a) ? isVar(b) && a.name === b.name : a === b;
}
function sname(a) {
  return typeof a === "function" ? a.name : a;
}
function peek(stack) {
  return stack[stack.length - 1];
}
function oplr(nt, input) {
  return function nar(o) {
    const depth = [];
    const seen = [];
    var pos = 0;
    const confstr = () => {
      const s = seen.join(";");
      const i = input.slice(pos);
      const p = depth.join("/");
      return `[${s}][${i}]/${p}`;
    };
    bark(rpith, A);
    function bark(pith, s) {
      depth.push(s.name), o(confstr());
      s(pith);
      depth.pop(), o(confstr());
    }
    function rpith(...symbols) {
      o(symbols.map(sname).join(" "));
      for (var i = 0, l = symbols.length; i < l; i++) {
        let s = symbols[i];
        if (isTerm(s)) {
          let len = match(s, input, pos);
          if (len !== -1) {
            pos = pos + len;
            seen.push([s, len]);
          } else {
            if (i)
              seen.splice(0 - i).forEach(([s, len], j) => {
                if (!sequal(s, symbols[j]))
                  throw new Error(`${s},${symbols[j]}`);
                pos = pos - len;
              });
            return;
          }
        } else {
          bark(rpith, s);
        }
      }
      debugger;
      const h = peek(depth);
      const t = seen.splice(seen.length - symbols.length, symbols.length);

      seen.push([h, t.reduce((s, [_, len]) => s + len, 0)]);
    }
  };
  function A(o) {
    o(nt);
  }
}

//closure(G41())(console.log.bind(console))
print(rmlr(G0()));
console.log("__________________");
oplr(rmlr(G0()), "baaa")(console.log.bind(console));

function G0() {
  return function S(o) {
    o(S, "a");
    o("b");
  };
}
function G1() {
  function B(o) {
    o("b");
    o("a");
  }
  function Z(o) {
    o(B, "o");
  }
  return function S(o) {
    o(S, "a");
    o(Z);
    o("b");
  };
}
function closure(nt, sym) {
  return renamefun("A", (o) => {
    enumvars(nt, (nt) => {
      o(
        renamefun(nt.name, (o) => {
          nt(o);
        })
      );
    });
  });
}
//LR PARSER ROUTINE
//let a be the first symbol of w$;
//while(1) { / * repeat forever * /
//  let s be the state on top of the stack;
//  if ( ACTION[S, a] = shift t ) {
//    push t onto the stack;
//    let a be the next input symbol;
//  } else if ( ACTION[S, a] = reduce A -> β ) {
//    pop |β| symbols off the stack;
//    let state t now be on top of the stack;
//    push GOTO [t, A] onto the stack;
//    output the production A -> β;
//  } else if ( ACTION[S, a ] = accept ) break; / * parsing is done * /
//  else call error-recovery routine;
//}
function first(...symbols) {
  return (o) => {
    const vmap = {};
    var ε = false;
    pith(...symbols);
    if (ε) o("");
    function pith(...symbols) {
      for (let i = 0, l = symbols.length; i < l; i++) {
        let s = symbols[i];
        if (isTerm(s))
          if (s !== "") return o(s);
          else ε = true;
        else {
          if (vmap.hasOwnProperty(s.name)) ε = vmap[s.name];
          else (vmap[s.name] = false), s(pith), (vmap[s.name] = ε);
          if (!ε || i + 1 === l) return;
          else ε = false;
        }
      }
    }
  };
}
//print(AA);
//first(AA)((s) => console.log(JSON.stringify(s)));
function AA(o) {
  o(function G(o) {
    o("");
    o("b");
  });
  o("a");
}
function G41(o) {
  const E = (o) => (o(T), o(E, "+", T));
  const T = (o) => (o(F), o(T, "*", F));
  const F = (o) => (o("id"), o("(", E, ")"));
  return E;
}
function G43() {
  const S = (o) => o(G41());
  return S;
}
//print(G0());
//print(G43());
//parse(G41(), "3*1+3");
function debugvar(v) {
  return renamefun(v.name, (o) => {
    console.log(v.name, ">");
    v(o);
    console.log(v.name, "<");
  });
}
function oparser(variable, input, terms = [], ident = "") {
  var rez = -1;
  console.log(ident + variable.name + ">" + input);
  variable(function varpith(...p) {
    if (rez !== -1) return;
    var cinput = input;
    for (let s of p) {
      if ("string" === typeof s) {
        if (cinput.startsWith(s)) {
          terms.push(cinput.slice(0, s.length));
          cinput = cinput.slice(s.length);
        } else return;
      } else if (s.name[0] === "_") {
        s(terms);
      } else {
        cinput = oparser(s, cinput, terms, ident + "  ");
        if (cinput === -1) return;
      }
    }
    rez = cinput;
  });

  console.log(ident + variable.name + "<" + rez);
  return rez;
}
function parse(G, input) {
  //print(G);
  const rez = oparser(
    rmlr(function S(o) {
      o(G, "\0");
    }),
    input + "\0"
  );
  console.log(input, rez === "" ? "accept" : "error");
}
function rmlr(variable) {
  return isVar(variable)
    ? renamefun(variable.name, (o) => {
        const ps = [];
        const lps = [];
        variable((...p) => (p[0] === variable ? lps : ps).push(p));
        if (lps.length === 0) return ps.forEach((p) => o(...p.map(rmlr)));
        const R = renamefun(variable.name + "_", (o) => {
          lps.forEach((p) => o(...p.slice(1).map(rmlr), R));
          o("");
        });
        ps.forEach((p) => o(...p.map(rmlr), R));
      })
    : variable;
}
function enumvars(s, o) {
  var d = 0;
  const sent = {};
  bark(s);
  function bark(s) {
    if (!isVar(s) || sent[s.name]) return;
    sent[s.name] = true;
    o(s, d++);
    s(pith);
    d--;
  }
  function pith(...p) {
    for (let s of p) bark(s);
  }
}
function logvar(v, i) {
  console.log("".padStart(i * 2 + " ") + v.name + "→");
  v((...p) =>
    console.log(
      "".padStart((i + 1) * 2, " ") +
        p.map((s) => ("function" === typeof s ? s.name : s ? s : "ε")).join(" ")
    )
  );
}
function print(g) {
  enumvars(g, logvar);
}
function isTerm(s) {
  return "string" === typeof s;
}
function isVar(s) {
  return "function" === typeof s && s.name.length > 0 && s.name[0] !== "_";
}
function renamefun(name, f) {
  return new Function(
    "const _fun_=arguments[0];" +
      "return function " +
      name +
      "(){" +
      "return _fun_.apply(this,arguments);" +
      "}"
  )(f);
}
function memoize(f) {
  const m = new Map();
  return (a) => {
    if (m.has(a)) return m.get(a);
    const r = f(a);
    if (r === a) return a;
    m.set(a, r);
    return r;
  };
}
function assert(p) {
  if (!p()) throw new Error(p.toString());
}
