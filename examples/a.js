// @flow strict
import type { N } from "../src/purry";
import type { rring_rays_t } from "../src/a";
const a = require("../src/a");
const ast = require("../lib/babel");
var state = ast.parse("a+b*o");

const b = a.bark((r) => {
  state = r(state);
}, (document.body = document.body || document.createElement("body")));
b(File);

function div<S>(
  nar: N<N<rring_rays_t<S>>>,
  key?: ?string
): {|
  m: "relement",
  a: {| tag: string, nar: N<N<rring_rays_t<S>>>, key?: ?string |},
|} {
  return { m: ("relement": "relement"), a: { tag: "div", nar, key } };
}
function reduce<S>(a: (S) => S): {| m: "reduce", a: (S) => S |} {
  return { m: ("reduce": "reduce"), a };
}
function DebuggerStatement(o: N<rring_rays_t<ast.DebuggerStatement>>) {}
function BlockStatement(o: N<rring_rays_t<ast.BlockStatement>>) {}
function NotImplemented<T>(o: N<rring_rays_t<T>>) {
  o(
    reduce((s) => {
      console.log("NotImplemented", s);
      return s;
    })
  );
}
function BinaryExpression(o: N<rring_rays_t<ast.BinaryExpression>>) {
  //{ left: Expression,
  //  operator: ( "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<="),
  //  right: Expression,
  //  type: "BinaryExpression",
  //}
  //o(
  //  reduce((s) => {
  //    f("left", Expression)(o);
  //    f("Right", Expression)(o);
  //    return s;
  //  })
  //);
}
function kdiv<S: { ... }, K>(
  key: string,
  nar: N<N<rring_rays_t<K>>>
): N<N<rring_rays_t<S>>> {
  return (o) =>
    o(
      div(
        a.ring((r) => o(reduce((s) => ({ ...s, [key]: r(s[key]) }))))(nar),
        key
      )
    );
}
function Expression(o: N<rring_rays_t<ast.Expression>>) {}
function ExpressionStatement(o: N<rring_rays_t<ast.ExpressionStatement>>) {
  o(
    reduce((s: ast.ExpressionStatement) => {
      kdiv(
        "expression",
        s.expression.type === "BinaryExpression"
          ? BinaryExpression
          : NotImplemented
      )(o);

      return s;
    })
  );
}

function Program(o: N<rring_rays_t<ast.Program>>) {
  o(
    div(
      omap(
        "body",
        ([]: $PropertyType<ast.Program, "body">)
      )((o) =>
        o(
          reduce((s) => {
            s.forEach((n, i) =>
              o(
                div(
                  n.type === "BlockStatement"
                    ? amap(i, n)(BlockStatement)
                    : n.type === "DebuggerStatement"
                    ? amap(i, n)(DebuggerStatement)
                    : n.type === "ExpressionStatement"
                    ? amap(i, n)(ExpressionStatement)
                    : (o) => {},
                  i + ""
                )
              )
            );
            return s;
          })
        )
      ),
      "body"
    )
  );
  o(
    reduce((s) => {
      s.body.forEach((n, i) => {
        o(
          div(
            n.type === "BlockStatement"
              ? a.ring((r) =>
                  o(
                    reduce((s) => ({
                      ...s,
                      body: s.body.map((s, k) =>
                        k !== i ? s : r(s.type === n.type ? s : n)
                      ),
                    }))
                  )
                )(BlockStatement)
              : n.type === "DebuggerStatement"
              ? a.ring((r) =>
                  o(
                    reduce((s) => ({
                      ...s,
                      body: s.body.map((s, k) =>
                        k !== i ? s : r(s.type === n.type ? s : n)
                      ),
                    }))
                  )
                )(DebuggerStatement)
              : (o) => {},
            "" + i
          )
        );
      });
      return s;
    })
  );
}
function File(o: N<rring_rays_t<ast.File>>) {
  o(
    div(
      omap("program", { type: "Program", sourceType: "module", body: [] })(
        Program
      ),
      "program"
    )
  );
}

function omap<S: { ... }, K>(
  key: string,
  init: K
): (N<N<rring_rays_t<K>>>) => N<N<rring_rays_t<S>>> {
  return (nar) => (o) =>
    a.ring((r) => o(reduce((s) => ({ ...s, [key]: r(s[key] || init) }))))(nar)(
      o
    );
}
function amap<S, K>(
  index: number,
  init: K
): (N<N<rring_rays_t<K>>>) => N<N<rring_rays_t<Array<S>>>> {
  return (nar) => (o) => {};
  //a.ring((r) => o(reduce((s) => ({ ...s, [key]: r(s[key] || init) }))))(nar)(
  //  o
  //);
}
