// flow
const a = 44;

const reduce = (r) => ({ type: ("r": "r"), r });
const rnode = (key, init, pith) => ({ type: ("n": "n"), key, init, pith });
function r(o) {
  o(reduce((s) => ({ ...s, n: s.n + 1 })));
  o(
    rnode("a", { b: 0 }, (o) => {
      o(reduce((s) => ({ ...s, b: s.b + 1 })));
    })
  );
}
type V$1 =
  | any
  | {| n: any | number, b?: any | number, a: V$1 |}
  | {| n?: any | number, b?: any | number, a: V$1 |}
  | {| n: any | number, a: V$1 |}
  | {| n: any | number, b: any | number, a?: V$1 |}
  | {| n?: any | number, b: any | number, a?: V$1 |}
  | {| n: any | number, b?: any | number, a?: V$1 |}
  | {| n: any | number, b: any | number |}
  | {| n: any | number, b?: any | number |}
  | {| n: any | number |};
function mkpith(o) {
  return function pith(x) {
    if (x == null) {
    } else if (typeof x === "function") {
      x(pith);
    } else if (x.type === "r") {
      o(x.r);
    } else {
      mkpith((r) => {
        o((s) => ({ ...s, [x.key]: r(s[x.key] || x.init) }));
      })(x.pith);
    }
  };
}
var s = { n: 9 };
console.log(JSON.stringify(s));
mkpith((red) => {
  s = red(s);
  console.log(JSON.stringify(s));
})(r);
null;
