const _ = () => {};
function GE() {
  function I(o) {
    o((o) => {
      o("id", (o) => {
        o(_);
      });
    });
  }
  function F(o) {
    o((o) => {
      o("(", (o) => {
        o(E, (o) => {
          o(")", (o) => {
            o(_);
          });
        });
      });
    }, I);
  }
  function T(o) {
    o((o) => {
      o(T, (o) => {
        o("*", (o) => {
          o(F, (o) => {
            o(_);
          });
        });
      });
    }, F);
  }
  function E(o) {
    o((o) => {
      o(E, (o) => {
        o("+", (o) => {
          o(T, (o) => {
            o(_);
          });
        });
      });
    }, T);
  }
  return E;
}
// prettier-ignore
function GS() {
  return S;
  function S (o) { o(A1,  S1); }
  function A1(o) { o(S,   A2); }
  function A2(o) { o("a", A3); }
  function A3(o) { o(_,   null); }

  function S1(o) { o(B1,  S2); }
  function B1(o) { o(S,   B2); }
  function B2(o) { o("o", B3); }
  function B3(o) { o(_,   null); }

  function S2(o) { o(C1,  null); }
  function C1(o) { o("b", C2); }
  function C2(o) { o(_,   null); }
}
console.clear();
for (let i = 0; i < 15; i++) {
  process.stdout.write(i + " ");
  generate(GE());
  process.stdout.write(i + " ");
  generate(GS());
}
function generate(V) {
  let c = 39;
  let s = null;
  V(first);
  function first(h, t) {
    if (t && (Math.floor(Math.random() * 2) || c < 0)) t(first);
    else h(follow);
  }
  function follow(h, t) {
    match(h, {
      A() {
        s = [t, s];
        c = c - 1;
        h(first);
      },
      T() {
        process.stdout.write(h);
        t(follow);
      },
      G() {
        if (s) {
          const next = s[0];
          s = s[1];
          next(follow);
        } else process.stdout.write("\n");
      },
    });
  }
}
function match(v, map) {
  return (
    map["string" === typeof v ? "T" : v.name[0] === "_" ? "G" : "A"] ||
    map.default
  )();
}
