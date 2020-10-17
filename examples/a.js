// @flow strict
import type { N } from "../src/purry";
import type { rring_rays_t } from "../src/a";
const { static_cast } = require("../src/utils/static_cast");
const a = require("../src/a");
const ast = require("../lib/babel");
var state = ast.parse("const a=1,b=1,o=2;a+b*o;");

const b = a.bark((r) => {
  state = r(state);
}, (document.body = document.body || document.createElement("body")));

const File = make<ast.BNFile>((o) => {
  o(
    div(
      map(
        (a) => a.program,
        (a, b) => ({ ...a, program: b })
      )(Program),
      "program"
    )
  );
});

const DebuggerStatement = make<ast.BNDebuggerStatement>((o) => {});
const BlockStatement = make<ast.BNBlockStatement>((o) => {});
const BinaryExpression = make<ast.BNBinaryExpression>((o) => {
  console.log("hmmm");
  o(
    div(
      map(
        (a) => static_cast<ast.BNExpression>(a.left),
        (a, b) => ({ ...a, left: b })
      )(Expression),
      "left"
    )
  );
  o(
    reduce((s) => {
      o(
        div((o) => {
          o({ m: "text", a: s.operator });
        }, "operator")
      );
      return s;
    })
  );
  o(
    div(
      map(
        (a) => a.right,
        (a, b) => ({ ...a, right: b })
      )(Expression),
      "right"
    )
  );
});
const Identifier = make<ast.BNIdentifier>((o) => {
  o(
    reduce((s) => {
      o({ m: "text", a: s.name });
      return s;
    })
  );
});
const Expression = make<ast.BNExpression>((o) => {
  o(
    reduce((s) => {
      if (s.type === "BinaryExpression")
        map(
          (a) => (a.type === "BinaryExpression" ? a : s),
          (a, b) => b
        )(BinaryExpression)(o);
      else if (s.type === "Identifier")
        map(
          (a) => (a.type === "Identifier" ? a : s),
          (a, b) => b
        )(Identifier)(o);
      else NotImplemented(o);
      return s;
    })
  );
});
const ExpressionStatement = make<ast.BNExpressionStatement>((o) => {
  o(
    div(
      map(
        (a) => a.expression,
        (a, b) => ({ ...a, expression: b })
      )(Expression),
      "expression"
    )
  );
});

const Program = make<ast.BNProgram>((o) => {
  o(
    div(
      map(
        (a) => a.body,
        (a, b) => ({ ...a, body: b })
      )((o) =>
        o(
          reduce((s) => {
            s.forEach((n, i) => {
              const merge = (a, b) => a.map((n, j) => (j === i ? b : n));
              o(
                div(
                  n.type === "BlockStatement"
                    ? map(
                        (a) => (a[i].type === "BlockStatement" ? a[i] : n),
                        merge
                      )(BlockStatement)
                    : n.type === "DebuggerStatement"
                    ? map(
                        (a) => (a[i].type === "DebuggerStatement" ? a[i] : n),
                        merge
                      )(DebuggerStatement)
                    : n.type === "ExpressionStatement"
                    ? map(
                        (a) => (a[i].type === "ExpressionStatement" ? a[i] : n),
                        merge
                      )(ExpressionStatement)
                    : map((a) => a[i], merge)(NotImplemented),
                  i + ""
                )
              );
            });
            return s;
          })
        )
      ),
      "body"
    )
  );
});

b(File);

// ***************************************
// ***************************************
// ***************************************

function make<S: ast.BN>(nar: N<N<rring_rays_t<S>>>): N<N<rring_rays_t<S>>> {
  return (o) => {
    o({
      m: "reduce",
      a(s) {
        o({
          m: "get",
          a(elm) {
            elm.className = s.type;
          },
        });
        nar(o);
        return s;
      },
    });
  };
}
function map<A, B>(
  extract: (A) => B,
  merge: (A, B) => A
): (N<N<rring_rays_t<B>>>) => N<N<rring_rays_t<A>>> {
  return (nar) => (o) =>
    a.ring((r) =>
      o(
        reduce((a) => {
          const ob = extract(a);
          const nb = r(ob);
          return ob === nb ? a : merge(a, nb);
        })
      )
    )(nar)(o);
}
function omap<A: { ... }, B>(
  key: string,
  assert: (mixed) => B
): (N<N<rring_rays_t<B>>>) => N<N<rring_rays_t<A>>> {
  return (nar) =>
    map(
      (a) => assert(a[key]),
      (a, b) => ({ ...a, [key]: b })
    )(nar);
}
function amap<A, B>(
  i: number,
  extract: (A | B) => B
): (N<N<rring_rays_t<B>>>) => N<N<rring_rays_t<Array<A | B>>>> {
  return (nar) =>
    map(
      (a) => extract(a[i]),
      (a, b) => a.map((n, j) => (j === i ? b : n))
    )(nar);
}
function NotImplemented<T: { +type: string }>(o: N<rring_rays_t<T>>) {
  o(
    reduce((s) => {
      console.log("NotImplemented", s.type, s);
      return s;
    })
  );
}
function div<S>(
  nar: N<N<rring_rays_t<S>>>,
  key: string
): {|
  m: "relement",
  a: {| tag: string, nar: N<N<rring_rays_t<S>>>, key?: ?string |},
|} {
  return { m: ("relement": "relement"), a: { tag: "div", nar, key } };
}
function reduce<S>(a: (S) => S): {| m: "reduce", a: (S) => S |} {
  return { m: ("reduce": "reduce"), a };
}
