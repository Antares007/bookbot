// @flow strict
import type { N } from "../src/purry";
const p = require("../src/purry");
const code = require("fs")
  .readFileSync(require("path").resolve(__dirname, "counter.js"))
  .toString();
const ast = require("../lib/babel")(code);
const document = require("../src/document");
const element = require("../src/element");
function af(aa, ba, ca) {
  const za = aa + ba * ca;
  function bf(ab, bb, cb) {
    function cf(ac, bc, cc) {
      function df(ad, bd, cd) {
        function ef(ae, be, ce) {
          function ff(af, bf, cf) {
            const zf = af + bf * cf;
          }
        }
      }
    }
  }
}
const b = document.bark((r) => {});
const see = {
  a: { b: { c: 1 }, z: 3 },
  b: { c: { a: 2 } },
};
const keyword = (name, text) => (o) =>
  o.element("div.keyword" + (name ? "." + name : ""), (o) => o.text(text));
const keywordname2textmap = {
  function: "ƒ",
  openparen: "(",
  openbrace: "{",
  openbracket: "[",
  closeparen: ")",
  closebrace: "}",
  closebracket: "]",
  arrow: "=>",
  dot: ".",
  dotdot: ":",
};

const keywords: { [string]: N<element.o_pith_t> } = Object.keys(
  keywordname2textmap
).reduce(
  (s, n: string) => ({ ...s, [n]: keyword(n, keywordname2textmap[n]) }),
  {}
);

const map = {
  SpreadElement: (ast, d) => (o) =>
    o.element("div.SpreadElement.flex", (o) => {
      o.text("...");
      node(ast.argument, d)(o);
    }),
  ConditionalExpression: (ast, d) => (o) =>
    o.element("div.ConditionalExpression.flex", (o) => {
      node(ast.consequent, d)(o);
      node(ast.test, d)(o);
      node(ast.alternate, d)(o);
    }),
  IfStatement: (ast, d) => (o) =>
    o.element("div.IfStatement.flex", (o) => {
      node(ast.consequent, d)(o);
      node(ast.test, d)(o);
      if (ast.alternate) node(ast.alternate, d)(o);
    }),
  AssignmentExpression: (ast, d) => (o) =>
    o.element("div.AssignmentExpression.flex", (o) => {
      node(ast.left, d)(o);
      keyword("operator", ast.operator)(o);
      node(ast.right, d)(o);
    }),

  ExpressionStatement: (ast, d) => (o) =>
    o.element("div.ExpressionStatement", (o) => node(ast.expression, d)(o)),

  ObjectProperty: (ast, d) => (o) =>
    o.element("tr.ObjectProperty", (o) => {
      if (ast.computed) {
        o.element("td.flex", (o) => {
          keywords.openbracket(o);
          node(ast.key, d)(o);
          keywords.closebracket(o);
        });
      } else {
        o.element("td", node(ast.key, d));
      }
      o.element("td", keywords.dotdot);
      o.element("td", node(ast.value, d));
    }),

  ObjectExpression: (ast, d) => (o) =>
    o.element("table.ObjectExpression", (o) => {
      for (let p of ast.properties) node(p, d)(o);
    }),
  MemberExpression: (ast, d) => (o) =>
    o.element("div.MemberExpression.flex", (o) => {
      node(ast.object, d)(o);
      if (ast.computed) {
        keywords.openbracket(o);
        node(ast.property, d)(o);
        keywords.closebracket(o);
      } else {
        keywords.dot(o);
        node(ast.property, d)(o);
      }
    }),
  StringLiteral: (ast) => (o) =>
    o.element("div.StringLiteral", (o) => o.text(ast.extra.raw)),

  CallExpression: (ast, d) => (o) =>
    o.element("div.CallExpression.flex.S" + d, (o) => {
      node(ast.callee, d)(o);
      o.element("div.arguments", (o) => {
        o.element("div.keyword", (o) => o.text("("));
        ast.arguments.forEach((n) => node(n, d)(o));
        o.element("div.keyword", (o) => o.text(")"));
      });
    }),

  ReturnStatement: (ast, d) => (o) =>
    o.element("div.ReturnStatement.flex", (o) => {
      o.element("div.keyword", (o) => o.text("return"));
      node(ast.argument, d)(o);
    }),
  BlockStatement: (ast, d) => (o) =>
    o.element("div.BlockStatement.S" + d, (o) => {
      o.element("div.body", (o) => ast.body.forEach((n) => node(n, d)(o)));
    }),
  ArrowFunctionExpression: (ast, d) => (o) =>
    o.element("div.ArrowFunctionExpression.S" + d, (o) => {
      o.element("div.head.flex", (o) => {
        keywords.openparen(o);
        ast.params.map((n) => node(n, d)).forEach((n) => n(o));
        keywords.closeparen(o);
        keywords.arrow(o);
      });
      node(ast.body, d + 1)(o);
    }),
  FunctionExpression: (ast, d) => (o) =>
    o.element("div.FunctionExpression.S" + d, (o) => {
      o.element("div.head.flex", (o) => {
        keywords.function(o);
        if (ast.id) node(ast.id, d)(o);
        keywords.openparen(o);
        ast.params.map((n) => node(n, d)).forEach((n) => n(o));
        keywords.closeparen(o);
      });
      node(ast.body, d + 1)(o);
    }),
  FunctionDeclaration: (ast, d) => (o) =>
    o.element("div.FunctionDeclaration.S" + d, (o) => {
      o.element("div.head.flex", (o) => {
        keywords.function(o);
        node(ast.id, d)(o);
        keywords.openparen(o);
        ast.params.map((n) => node(n, d)).forEach((n) => n(o));
        keywords.closeparen(o);
      });
      node(ast.body, d + 1)(o);
    }),
  NumericLiteral: (ast) => (o) =>
    o.element("div.NumericLiteral", (o) => o.text(ast.value + "")),
  BinaryExpression: (ast, d) => (o) =>
    o.element("div.BinaryExpression.flex", (o) => {
      node(ast.left, d)(o);
      o.element("div.operator", (o) => o.text(ast.operator));
      node(ast.right, d)(o);
    }),
  Identifier: (ast) => (o) =>
    o.element("div.Identifier", (o) => o.text(ast.name)),
  VariableDeclarator: (ast, d) => (o) =>
    o.element("div.VariableDeclarator.flex", (o) => {
      node(ast.id, d)(o);
      if (ast.init) {
        o.element("div.eq", (o) => o.text("="));
        node(ast.init, d)(o);
      }
    }),
  VariableDeclaration: (ast, d) => (o) =>
    o.element("div.VariableDeclaration.flex", (o) => {
      o.element("div.kind", (o) => o.text(ast.kind));
      ast.declarations.forEach((n) => node(n, d)(o));
    }),

  Program: (ast, d) => (o) =>
    o.element("div.Program.S" + d, (o) =>
      ast.body.forEach((n) => node(n, d)(o))
    ),

  File: (ast, d) => (o) =>
    o.element("div.File", (o) => node(ast.program, d)(o)),

  NA: (ast, d) => (o) =>
    o.element("pre.NA", (o) =>
      o.element("code", (o) => {
        console.log(ast);
      })
    ),
};

const node = (ast, d: number) => (o) => {
  const type = typeof ast.type === "string" ? ast.type : "NA";
  if (map[type]) map[type](ast, d)(o);
  else map.NA(ast, d)(o);
};

b((o) => {
  o.head((o) => {
    o.element("style", (o) => {
      o.text(`
table {
  border-spacing: 0px;
}
td {
  vertical-align: top;
  padding: 0px
}
.flex {
  display: flex
}
.ident {
  width: 1em;
}
div {
  margin-right: 0.3em;
}
.BlockStatement {
  background-color: #dddddd;
  padding: 8px;
}
/*
.BlockStatement::before {
  content: "{";
  height: 0px;
}
.BlockStatement::after {
  content: "}";
  height: 0px;
}*/
.S0 {
  background-color: #ffffff;
}
.S1 {
  background-color: #dddddd;
}
.S2 {
  background-color: #bbbbbb;
}
.S3 {
  background-color: #ffffff;
}
.S4 {
  background-color: #dddddd;
}
.S5 {
  background-color: #bbbbbb;
}
.S6 {
  background-color: #ffffff;
}
.S7 {
  background-color: #dddddd;
}
.S8 {
  background-color: #bbbbbb;
}
.ObjectExpression {
  background-color: #ddffdd;
  border-radius: 10px;
  padding: 8px;
}`);
    });
  });
  node(ast, 0)(o);
});
console.log(ast);
