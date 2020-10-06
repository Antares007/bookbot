// @flow strict
import type { N } from "../src/purry";
const p = require("../src/purry");
const code = require("fs").readFileSync(__filename).toString();
const ast = require("../lib/babel")(code);
const document = require("../src/document");
const element = require("../src/element");

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
  SpreadElement: ast => o => 
    o.element("div.SpreadElement.flex", (o) => {
      o.text('...')
      node(ast.argument)(o);
    }),
  ConditionalExpression: (ast) => (o) =>
    o.element("div.ConditionalExpression.flex", (o) => {
      node(ast.consequent)(o);
      node(ast.test)(o);
      node(ast.alternate)(o);
    }),
  IfStatement: (ast) => (o) =>
    o.element("div.IfStatement.flex", (o) => {
      node(ast.consequent)(o);
      node(ast.test)(o);
      if (ast.alternate) node(ast.alternate)(o);
    }),
  AssignmentExpression: (ast) => (o) =>
    o.element("div.AssignmentExpression.flex", (o) => {
      node(ast.left)(o);
      keyword("operator", ast.operator)(o);
      node(ast.right)(o);
    }),
  ExpressionStatement: (ast) => (o) =>
    o.element("div.ExpressionStatement", (o) => node(ast.expression)(o)),
  ObjectProperty: (ast) => o => o.element('tr.ObjectProperty',(o) => {
                if (ast.computed) {
                  o.element("td.flex", (o) => {
                    keywords.openbracket(o);
                    node(ast.key)(o);
                    keywords.closebracket(o);
                  });
                } else {
                  o.element('td',node(ast.key));
                }
        o.element("td", keywords.dotdot);
        o.element("td", node(ast.value));
      }),
  ObjectExpression: (ast) => (o) =>
    o.element("table.ObjectExpression", (o) => {
      for (let p of ast.properties) node(p)(o);
    }),
  MemberExpression: (ast) => (o) =>
    o.element("div.MemberExpression.flex", (o) => {
      node(ast.object)(o);
      if (ast.computed) {
        keywords.openbracket(o);
        node(ast.property)(o);
        keywords.closebracket(o);
      } else {
        keywords.dot(o);
        node(ast.property)(o);
      }
    }),
  StringLiteral: (ast) => (o) =>
    o.element("div.StringLiteral", (o) => o.text(ast.extra.raw)),

  CallExpression: (ast) => (o) =>
    o.element("div.CallExpression.flex", (o) => {
      node(ast.callee)(o);
      o.element('div.arguments', o => {
        o.element("div.keyword", (o) => o.text("("));
        ast.arguments.forEach((n) => node(n)(o));
        o.element("div.keyword", (o) => o.text(")"));
      })
    }),

  ReturnStatement: (ast) => (o) =>
    o.element("div.ReturnStatement.flex", (o) => {
      o.element("div.keyword", (o) => o.text("return"));
      node(ast.argument)(o);
    }),
  BlockStatement: (ast) => (o) =>
    o.element("div.BlockStatement", (o) => {
      o.element("div.body.flex", (o) => {
        o.element("div.ident", (o) => {});
        o.element("div.body", (o) => ast.body.forEach((n) => node(n)(o)));
      });
    }),
  ArrowFunctionExpression: (ast) => (o) =>
    o.element("div.ArrowFunctionExpression", (o) => {
      o.element("div.head.flex", (o) => {
        keywords.openparen(o);
        ast.params.map((n) => node(n)).forEach((n) => n(o));
        keywords.closeparen(o);
        keywords.arrow(o);
      });
      node(ast.body)(o);
    }),
  FunctionExpression: (ast) => (o) =>
    o.element("div.FunctionExpression", (o) => {
      o.element("div.head.flex", (o) => {
        keywords.function(o);
        if (ast.id) node(ast.id)(o);
        keywords.openparen(o);
        ast.params.map((n) => node(n)).forEach((n) => n(o));
        keywords.closeparen(o);
      });
      node(ast.body)(o);
    }),
  FunctionDeclaration: (ast) => (o) =>
    o.element("div.FunctionDeclaration", (o) => {
      o.element("div.head.flex", (o) => {
        keywords.function(o);
        node(ast.id)(o);
        keywords.openparen(o);
        ast.params.map((n) => node(n)).forEach((n) => n(o));
        keywords.closeparen(o);
      });
      node(ast.body)(o);
    }),
  NumericLiteral: (ast) => (o) =>
    o.element("div.NumericLiteral", (o) => o.text(ast.value + "")),
  BinaryExpression: (ast) => (o) =>
    o.element("div.BinaryExpression.flex", (o) => {
      node(ast.left)(o);
      o.element("div.operator", (o) => o.text(ast.operator));
      node(ast.right)(o);
    }),
  Identifier: (ast) => (o) =>
    o.element("div.Identifier", (o) => o.text(ast.name)),
  VariableDeclarator: (ast) => (o) =>
    o.element("div.VariableDeclarator.flex", (o) => {
      node(ast.id)(o);
      if (ast.init) {
        o.element("div.eq", (o) => o.text("="));
        node(ast.init)(o);
      }
    }),
  VariableDeclaration: (ast) => (o) =>
    o.element("div.VariableDeclaration.flex", (o) => {
      o.element("div.kind", (o) => o.text(ast.kind));
      ast.declarations.forEach((n) => node(n)(o));
    }),
  Program: (ast) => (o) =>
    o.element("div.Program", (o) => ast.body.forEach((n) => node(n)(o))),
  File: (ast) => (o) => o.element("div.File", (o) => node(ast.program)(o)),
  NA: (ast) => (o) =>
    o.element("pre.NA", (o) =>
      o.element("code", (o) => {
        console.log(ast);
      })
    ),
};

const node = (ast) => (o) => {
  const type = typeof ast.type === "string" ? ast.type : "NA";
  if (map[type]) map[type](ast)(o);
  else map.NA(ast)(o);
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
//.BlockStatement::before {
//  content: "{";
//  height: 0px;
//}
//.BlockStatement::after {
//  content: "}";
//  height: 0px;
//}
.ObjectExpression {
  background-color: #ddffdd;
  border-radius: 10px;
  padding: 8px;
}`);
    });
  });
  node(ast)(o);
});
console.log(ast);
