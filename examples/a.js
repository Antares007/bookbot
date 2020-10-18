// @flow strict
import type { N } from "../src/purry";
import type { rring_rays_t } from "../src/a";
const { static_cast } = require("../src/utils/static_cast");
const a = require("../src/a");
const ast = require("../lib/babel");
const code = require("fs").readFileSync(__filename, "utf8");
var state = ast.parse(code);

const b = a.bark((r) => {
  state = r(state);
}, (document.body = document.body || document.createElement("body")));


const File = make<ast.File>((o) => {
  o(
    div(
      map(
        (a) => a.program,
        (a, b) => ({ ...a, program: b })
      )(BlockStatement),
      "program"
    )
  );
});
const DebuggerStatement = make<ast.DebuggerStatement>(NotImplemented);
const BinaryExpression = make<ast.BinaryExpression>((o) => {
  o(
    div(
      map(
        (a) => static_cast<ast.Expression>(a.left),
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
const Identifier = make<ast.Identifier>((o) => {
  o(
    reduce((s) => {
      o({ m: "text", a: s.name });
      return s;
    })
  );
});
const NumericLiteral = make<ast.NumericLiteral>((o) => {
  o(
    reduce((s) => {
      o({ m: "text", a: s.value + "" });
      return s;
    })
  );
});
const Expression = make<ast.Expression>((o) => {
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
      else if (s.type === "NumericLiteral")
        map(
          (a) => (a.type === "NumericLiteral" ? a : s),
          (a, b) => b
        )(NumericLiteral)(o);
      else NotImplemented(o);
      return s;
    })
  );
});
const ExpressionStatement = make<ast.ExpressionStatement>((o) => {
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
const LVal = make<ast.LVal>((o) => {
  o(
    reduce((s) => {
      if (s.type === "Identifier")
        map(
          (a) => (a.type === "Identifier" ? a : s),
          (a, b) => b
        )(Identifier)(o);
      else NotImplemented(o);
      return s;
    })
  );
});
const VariableDeclarator = make<ast.VariableDeclarator>((o) => {
  o(
    div(
      map(
        (a) => a.id,
        (a, id) => ({ ...a, id })
      )(LVal),
      "id"
    )
  );
  o(
    div(
      map(
        (a) => a.init,
        (a, init) => ({ ...a, init })
      )(maybe(Expression)),
      "init"
    )
  );
});
const VariableDeclaration = make<ast.VariableDeclaration>((o) => {
  o(
    div(
      map(
        (s) => s.kind,
        (s, kind) => ({ ...s, kind })
      )((o) => o(reduce((a) => (o({ m: "text", a }), a)))),
      "kind"
    )
  );
  o(
    div(
      map(
        (s) => s.declarations,
        (s, declarations) => ({ ...s, declarations })
      )((o) =>
        o(
          reduce((s) => {
            s.forEach((n, i) => {
              o(
                div(
                  map(
                    (a) => (a[i].type === "VariableDeclarator" ? a[i] : n),
                    (a, b) => a.map((n, j) => (j === i ? b : n))
                  )(VariableDeclarator),
                  i + ""
                )
              );
            });
            return s;
          })
        )
      ),
      "declarations"
    )
  );
});
const FunctionDeclaration = make<ast.FunctionDeclaration>((o) => {
  o(
    div(
      map(
        (s) => s.id,
        (s, id) => ({ ...s, id })
      )(maybe(Identifier)),
      "id"
    )
  );
  o(
    div(
      map(
        (s) => s.params,
        (s, params) => ({ ...s, params })
      )((o) =>
        o(
          reduce((s) => {
            s.forEach((n, i) => {
              const merge = (a, b) => a.map((n, j) => (j === i ? b : n));
              o(
                div(
                  n.type === "Identifier"
                    ? map(
                        (a) => (a[i].type === "Identifier" ? a[i] : n),
                        merge
                      )(Identifier)
                    : map((a) => a[i], merge)(NotImplemented),
                  i + ""
                )
              );
            });
            return s;
          })
        )
      ),
      "params"
    )
  );
  o(
    div(
      map(
        (s) => s.body,
        (s, body) => ({ ...s, body })
      )(BlockStatement),
      "body"
    )
  );
});
const BlockStatement = make<ast.BlockStatement>(o=>{
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
                    : n.type === "VariableDeclaration"
                    ? map(
                        (a) => (a[i].type === "VariableDeclaration" ? a[i] : n),
                        merge
                      )(VariableDeclaration)
                    : n.type === "FunctionDeclaration"
                    ? map(
                        (a) => (a[i].type === "FunctionDeclaration" ? a[i] : n),
                        merge
                      )(FunctionDeclaration)
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
function maybe<T>(nar: N<N<rring_rays_t<T>>>): N<N<rring_rays_t<T | void>>> {
  return (o) =>
    a.ring((r) => o(reduce((s) => (typeof s === "undefined" ? s : r(s)))))(nar)(
      o
    );
}
function make<S: { +type: string }>(nar: N<N<rring_rays_t<S>>>): N<N<rring_rays_t<S>>> {
  return (o) => {
    o({
      m: "reduce",
      a(s) {
        o({
          m: "get",
          a(elm) {
            elm.className = s.type;
            for (let k in s) if (s[k] === true) elm.classList.add(k);
          },
        });
        nar(o);
        return s;
      },
    });
  };
}
function map<A, B>(extract: (A) => B, merge: (A, B) => A): (N<N<rring_rays_t<B>>>) => N<N<rring_rays_t<A>>> {
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
function NotImplemented<T: { +type: string }>(o: N<rring_rays_t<T>>) {
  o(
    reduce((s) => {
      o({
        m: "get",
        a(elm) {
          elm.style.color = "red";
        },
      });
      o({ m: "text", a: s.type });
      console.log("NotImplemented", s.type, s);
      return s;
    })
  );
}
function div<S>(nar: N<N<rring_rays_t<S>>>, key: string): {| m: "relement", a: {| tag: string, nar: N<N<rring_rays_t<S>>>, key?: ?string |}, |} {
  return { m: ("relement": "relement"), a: { tag: "div", nar, key } };
}
function reduce<S>(a: (S) => S): {| m: "reduce", a: (S) => S |} {
  return { m: ("reduce": "reduce"), a };
}
