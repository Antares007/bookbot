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
function kdiv<S:{...},K>(key: string, nar: N<N<rring_rays_t<K>>>): N<N<rring_rays_t<S>>> {
  return (o) =>
    o(
      div(
        a.ring((r) => o(reduce((s) => ({ ...s, [key]: r(s[key]) }))))(nar),
        key
      )
    );
}
function Expression(o:N<rring_rays_t<ast.Expression>>){}
function ExpressionStatement(o: N<rring_rays_t<ast.ExpressionStatement>>) {
  o(
    reduce((s: ast.ExpressionStatement) => {

      kdiv( "expression",
        s.expression.type === "BinaryExpression"
          ? BinaryExpression
          : NotImplemented
      )(o);

      return s;
    })
  );
}

function Statement(o: N<rring_rays_t<
    | ast.BlockStatement
    | ast.DebuggerStatement
    | ast.ExpressionStatement
  >>){
  const mapStatement = {
    BlockStatement,
    DebuggerStatement,
    ExpressionStatement
  }
  o(
    reduce((s) => {
      //if(s.type === 'BlockStatement') BlockStatement(o)
      //else o({m:'text', a: s.type})
      o({m:'text', a: s.type})
      return s
    })
  );
}

function rmap<S:{...},K>(key: string, init: K): N<N<rring_rays_t<K>>> => N<N<rring_rays_t<S>>> {
  return nar=>o=> a.ring((r) => o(reduce((s) => ({ ...s, [key]: r(s[key] || init) }))))(nar)(o)
}
function map<A,B,C>(i:number, a:[A,N<N<rring_rays_t<A>>>],b:B,c:C):N<N<rring_rays_t<A>>>=>N<N<rring_rays_t<Array<A>>>> {
  return nar => o =>{}
}
function Program(o: N<rring_rays_t<ast.Program>>) {
  o(
    reduce((s) => {
      o(div(rmap('body', s.body)(o => {})))
      s.body.forEach((n, i) => {
        o(
          div(
            n.type==='BlockStatement'
            ? a.ring((r) =>
                o(
                  reduce((s) => ({
                    ...s,
                    body: s.body.map((s, k) => k !== i ? s : r(s.type === n.type ? s : n)),
                  }))
                )
              )(BlockStatement)
            : n.type==='DebuggerStatement'
            ? a.ring((r) =>
                o(
                  reduce((s) => ({
                    ...s,
                    body: s.body.map((s, k) => k !== i ? s : r(s.type === n.type ? s : n)),
                  }))
                )
              )(DebuggerStatement)
            : o=>{},
            "" + i
          )
        )
      })
      return s
    })
  );
}
function File(o: N<rring_rays_t<ast.File>>) {
  o(
    div(
      rmap(
        'program',
        { type:'Program',
          sourceType: 'module',
          body: [] }
      )(Program),
      'program'
    )
  )
}
