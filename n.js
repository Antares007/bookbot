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
function GS() {
  return S;
  function S2(o) {
    o((o) => {
      o("b", (o) => {
        o(_, null);
      });
    }, null);
  }
  function S1(o) {
    o((o) => {
      o(S, (o) => {
        o("o", (o) => {
          o(_, null);
        });
      });
    }, S2);
  }
  function S(o) {
    o((o) => {
      o(S, (o) => {
        o("a", (o) => {
          o(_, null);
        });
      });
    }, S1);
  }
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
