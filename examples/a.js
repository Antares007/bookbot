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

const emap = {
  ArrayExpression: (init) => NotImplemented,
  ArrowFunctionExpression: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.ArrowFunctionExpression>>>(_o);
    o(
      div(
        "params",
        map(
          (s) => s.params,
          (s, params) => ({ ...s, params })
        )(nodelist(pmap))
      )
    );
    o(
      div(
        "body",
        map(
          (s) => s.body,
          (s, body) => ({ ...s, body })
        )(node({ ...emap, BlockStatement: nmap.BlockStatement }))
      )
    );
  },
  AssignmentExpression: (_i) => (_o) => {
    const i = static_cast<ast.AssignmentExpression>(_i);
    const o = static_cast<N<rring_rays_t<ast.AssignmentExpression>>>(_o);
    o(
      div(
        "left",
        map(
          (a) => a.left,
          (a, b) => ({ ...a, left: b })
        )(node(lmap))
      )
    );
    o(div("operator", (o) => o({ m: "text", a: i.operator })));
    o(
      div(
        "right",
        map(
          (a) => a.right,
          (a, b) => ({ ...a, right: b })
        )(node(emap))
      )
    );
  },
  AwaitExpression: (init) => NotImplemented,
  BigIntLiteral: (init) => NotImplemented,
  BinaryExpression: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.BinaryExpression>>>(_o);
    o(
      div(
        "left",
        map(
          (a) => a.left,
          (a, b) => ({ ...a, left: b })
        )(node(epmap))
      )
    );
    o(
      reduce((s) => {
        o(
          div("operator", (o) => {
            o({ m: "text", a: s.operator });
          })
        );
        return s;
      })
    );
    o(
      div(
        "right",
        map(
          (a) => a.right,
          (a, b) => ({ ...a, right: b })
        )(node(emap))
      )
    );
  },
  BindExpression: (init) => NotImplemented,
  BooleanLiteral: (init) => NotImplemented,
  CallExpression: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.CallExpression>>>(_o);
    o(
      div(
        "id",
        map(
          (s) => s.callee,
          (s, callee) => ({ ...s, callee })
        )(node(cmap))
      )
    );
    o(
      div(
        "arguments",
        map(
          (a) => a.arguments,
          (a, b) => ({ ...a, arguments: b })
        )(nodelist(amap))
      )
    );
  },
  ClassExpression: (init) => NotImplemented,
  ConditionalExpression: (init) => NotImplemented,
  DecimalLiteral: (init) => NotImplemented,
  DoExpression: (init) => NotImplemented,
  FunctionExpression: (init) => NotImplemented,
  Identifier: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.Identifier>>>(_o);
    o(
      reduce((s) => {
        o({ m: "text", a: s.name });
        return s;
      })
    );
  },
  Import: (init) => NotImplemented,
  JSXElement: (init) => NotImplemented,
  JSXFragment: (init) => NotImplemented,
  LogicalExpression: (_i) => (_o) => {
    const i = static_cast<ast.LogicalExpression>(_i);
    const o = static_cast<N<rring_rays_t<ast.LogicalExpression>>>(_o);
    o(
      div(
        "left",
        map(
          (a) => a.left,
          (a, b) => ({ ...a, left: b })
        )(node(emap))
      )
    );
    o(div("operator", (o) => o({ m: "text", a: i.operator })));
    o(
      div(
        "right",
        map(
          (a) => a.right,
          (a, b) => ({ ...a, right: b })
        )(node(emap))
      )
    );
  },
  MemberExpression: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.MemberExpression>>>(_o);
    o(
      div(
        "object",
        map(
          (a) => a.object,
          (a, b) => ({ ...a, object: b })
        )(node(emap))
      )
    );
    o(
      div(
        "property",
        map(
          (a) => a.property,
          (a, b) => ({ ...a, property: b })
        )(node(emap))
      )
    );
  },
  MetaProperty: (init) => NotImplemented,
  NewExpression: (init) => NotImplemented,
  NullLiteral: (init) => NotImplemented,
  NumericLiteral: (init) => (o) =>
    o({
      m: "text",
      a: static_cast<ast.NumericLiteral>(init).value + "",
    }),
  ObjectExpression: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.ObjectExpression>>>(_o);
  },
  OptionalCallExpression: (init) => NotImplemented,
  OptionalMemberExpression: (init) => NotImplemented,
  ParenthesizedExpression: (init) => NotImplemented,
  PipelinePrimaryTopicReference: (init) => NotImplemented,
  RecordExpression: (init) => NotImplemented,
  RegExpLiteral: (init) => NotImplemented,
  SequenceExpression: (init) => NotImplemented,
  StringLiteral: (init) => (o) =>
    o({
      m: "text",
      a: static_cast<{ raw: string }>(
        static_cast<ast.StringLiteral>(init).extra
      ).raw,
    }),
  Super: (init) => NotImplemented,
  TSAsExpression: (init) => NotImplemented,
  TSNonNullExpression: (init) => NotImplemented,
  TSTypeAssertion: (init) => NotImplemented,
  TaggedTemplateExpression: (init) => NotImplemented,
  TemplateLiteral: (init) => NotImplemented,
  ThisExpression: (init) => NotImplemented,
  TupleExpression: (init) => NotImplemented,
  TypeCastExpression: (init) => NotImplemented,
  UnaryExpression: (init) => NotImplemented,
  UpdateExpression: (init) => NotImplemented,
  YieldExpression: (init) => NotImplemented,
};
const cmap = {
  ...emap,
  V8IntrinsicIdentifier: (init) => NotImplemented,
};
const lmap = {
  ArrayPattern: (init) => NotImplemented,
  AssignmentPattern: (init) => NotImplemented,
  Identifier: (init) => emap.Identifier(init),
  MemberExpression: (init) => emap.MemberExpression,
  ObjectPattern: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.ObjectPattern>>>(_o);
    o(
      div(
        "properties",
        map(
          (a) => a.properties,
          (a, b) => ({ ...a, properties: b })
        )(
          nodelist({
            ObjectProperty: (i) => (_o) => {
              const o = static_cast<N<rring_rays_t<ast.ObjectProperty>>>(_o);
              o(
                div(
                  "key",
                  map(
                    (a) => a.key,
                    (a, b) => ({ ...a, key: b })
                  )(node(emap))
                )
              );
              o(
                div(
                  "value",
                  map(
                    (a) => a.value,
                    (a, b) => ({ ...a, value: b })
                  )(node(emap))
                )
              );
            },
          })
        )
      )
    );
  },
  RestElement: (init) => NotImplemented,
  TSParameterProperty: (init) => NotImplemented,
};
const pmap = {
  ...emap,
  ArrayPattern: (init) => NotImplemented,
  AssignmentPattern: (init) => NotImplemented,
  ObjectPattern: lmap.ObjectPattern,
  RestElement: lmap.RestElement,
  TSParameterProperty: (init) => NotImplemented,
};
const amap = {
  ...emap,
  SpreadElement: (init) => NotImplemented,
  JSXNamespacedName: (init) => NotImplemented,
  ArgumentPlaceholder: (init) => NotImplemented,
  YieldExpression: (init) => NotImplemented,
};
const nmap = {
  BreakStatement: (init) => NotImplemented,
  ContinueStatement: (init) => NotImplemented,
  DebuggerStatement: (init) => NotImplemented,
  DoWhileStatement: (init) => NotImplemented,
  EmptyStatement: (init) => NotImplemented,
  ExpressionStatement: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.ExpressionStatement>>>(_o);
    o(
      div(
        "expression",
        map(
          (a) => a.expression,
          (a, b) => ({ ...a, expression: b })
        )(node(emap))
      )
    );
  },
  ForInStatement: (init) => NotImplemented,
  ForStatement: (init) => NotImplemented,
  FunctionDeclaration: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.FunctionDeclaration>>>(_o);
    o(
      div(
        "id",
        map(
          (s) => s.id,
          (s, id) => ({ ...s, id })
        )(maybe(node(emap)))
      )
    );
    o(
      div(
        "params",
        map(
          (s) => s.params,
          (s, params) => ({ ...s, params })
        )(nodelist(pmap))
      )
    );
    o(
      div(
        "body",
        map(
          (s) => s.body,
          (s, body) => ({ ...s, body })
        )(node(nmap))
      )
    );
  },
  IfStatement: (init) => NotImplemented,
  LabeledStatement: (init) => NotImplemented,
  ReturnStatement: (init) => NotImplemented,
  SwitchStatement: (init) => NotImplemented,
  ThrowStatement: (init) => NotImplemented,
  TryStatement: (init) => NotImplemented,
  VariableDeclaration: (init) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.VariableDeclaration>>>(_o);
    o(
      div(
        "kind",
        map(
          (s) => s.kind,
          (s, kind) => ({ ...s, kind })
        )((o) => o(reduce((a) => (o({ m: "text", a }), a))))
      )
    );
    o(
      div(
        "declarations",
        map(
          (s) => s.declarations,
          (s, declarations) => ({ ...s, declarations })
        )(nodelist(vdmap))
      )
    );
  },
  WhileStatement: (init) => NotImplemented,
  WithStatement: (init) => NotImplemented,
  ClassDeclaration: (init) => NotImplemented,
  ExportAllDeclaration: (init) => NotImplemented,
  ExportDefaultDeclaration: (init) => NotImplemented,
  ExportNamedDeclaration: (init) => NotImplemented,
  ForOfStatement: (init) => NotImplemented,
  ImportDeclaration: (init) => NotImplemented,
  DeclareClass: (init) => NotImplemented,
  DeclareFunction: (init) => NotImplemented,
  DeclareInterface: (init) => NotImplemented,
  DeclareModule: (init) => NotImplemented,
  DeclareModuleExports: (init) => NotImplemented,
  DeclareTypeAlias: (init) => NotImplemented,
  DeclareOpaqueType: (init) => NotImplemented,
  DeclareVariable: (init) => NotImplemented,
  DeclareExportDeclaration: (init) => NotImplemented,
  DeclareExportAllDeclaration: (init) => NotImplemented,
  InterfaceDeclaration: (init) => NotImplemented,
  OpaqueType: (init) => NotImplemented,
  TypeAlias: (init) => NotImplemented,
  EnumDeclaration: (init) => NotImplemented,
  TSDeclareFunction: (init) => NotImplemented,
  TSInterfaceDeclaration: (init) => NotImplemented,
  TSTypeAliasDeclaration: (init) => NotImplemented,
  TSEnumDeclaration: (init) => NotImplemented,
  TSModuleDeclaration: (init) => NotImplemented,
  TSImportEqualsDeclaration: (init) => NotImplemented,
  TSExportAssignment: (init) => NotImplemented,
  TSNamespaceExportDeclaration: (init) => NotImplemented,
  BlockStatement: (init) => (o) => {
    o(
      div(
        "body",
        map(
          (a) => a.body,
          (a, b) => ({ ...a, body: b })
        )(nodelist(nmap))
      )
    );
  },
  Program: (init) => nmap.BlockStatement(init),
  File: (init) => (o) => {
    o(
      div(
        "program",
        map(
          (a) => a.program,
          (a, b) => ({ ...a, program: b })
        )(node(nmap))
      )
    );
  },
};
const epmap = {
  ...emap,
  PrivateName: (init) => NotImplemented,
};
const vdmap = {
  VariableDeclarator: (i) => (_o) => {
    const o = static_cast<N<rring_rays_t<ast.VariableDeclarator>>>(_o);
    o(
      div(
        "id",
        map(
          (a) => a.id,
          (a, id) => ({ ...a, id })
        )(node(lmap))
      )
    );
    o(
      div(
        "init",
        map(
          (a) => a.init,
          (a, init) => ({ ...a, init })
        )(maybe(node(emap)))
      )
    );
  },
};
const node = <S: ast.Node, M: {}>(m: M): N<N<rring_rays_t<S>>> => (o) =>
  o(
    reduce((s) => {
      o({
        m: "get",
        a(elm) {
          elm.className = s.type;
          for (let k in s) if (s[k] === true) elm.classList.add(k);
          if (s.extra)
            for (let k in s.extra)
              if (s.extra[k] === true) elm.classList.add("extra_" + k);
        },
      });
      const n = m[s.type];
      if (n) n(s)(o);
      else NotImplemented(o);
      return s;
    })
  );
const nodelist = <S: ast.Node, M: {}>(m: M): N<N<rring_rays_t<Array<S>>>> => (
  o
) =>
  o(
    reduce((s) => {
      s.forEach((n, i) => {
        o(
          div(
            i + "",
            map(
              (a) => (a[i] === n.type ? a[i] : n),
              (a, b) => a.map((n, j) => (j === i ? b : n))
            )(node(m))
          )
        );
      });
      return s;
    })
  );

b(node(nmap));

//const BinaryExpression = make<ast.BinaryExpression>();

// ***************************************
// ***************************************
// ***************************************
function maybe<T>(nar: N<N<rring_rays_t<T>>>): N<N<rring_rays_t<T | void>>> {
  return (o) =>
    a.ring((r) => o(reduce((s) => (typeof s === "undefined" ? s : r(s)))))(nar)(
      o
    );
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
function div<S>(
  key: string,
  nar: N<N<rring_rays_t<S>>>
): {|
  m: "relement",
  a: {| tag: string, nar: N<N<rring_rays_t<S>>>, key?: ?string |},
|} {
  return { m: ("relement": "relement"), a: { tag: "div", nar, key } };
}
function reduce<S>(a: (S) => S): {| m: "reduce", a: (S) => S |} {
  return { m: ("reduce": "reduce"), a };
}
