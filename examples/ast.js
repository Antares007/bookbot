// @flow strict
import type { N } from "../src/purry";
const remove = ["start", "end", "loc"];
const babel = require("../lib/babel");
const element = require("../src/element");
const map = {
  UpdateExpression: (ast, d) => (o) => {
    if (ast.prefix) o.element(".operator.prefix", (o) => o.text(ast.operator));
    o.element(".argument", node(ast.argument, d));
    if (!ast.prefix) o.element(".operator", (o) => o.text(ast.operator));
  },
  ForStatement: (ast, d) => (o) => {
    o.element(".head", (o) => {
      o.element(".init", node(ast.init, d));
      o.element(".test", node(ast.test, d));
      o.element(".update", node(ast.update, d));
    });
    o.element(".body", node(ast.body, d));
  },
  ExportNamedDeclaration: (ast, d) => (o) => {
    o.element(".specifiers", (o) =>
      ast.specifiers.forEach((n, i) => o.element(".specifier", node(n, d)))
    );
    if (ast.declaration) o.element(".source", node(ast.declaration, d));
    if (ast.source) o.element(".source", node(ast.source, d));
  },
  ImportSpecifier: (ast, d) => (o) => {
    o.element(".imported", node(ast.imported, d));
    o.element(".local", node(ast.local, d));
  },
  ImportDeclaration: (ast, d) => (o) => {
    o.element(".specifiers", (o) =>
      ast.specifiers.forEach((n, i) => o.element(".specifier", node(n, d)))
    );
    o.element(".source", node(ast.source, d));
  },
  TemplateElement: (ast, d) => (o) => {
    o.element("pre", (o) => o.text(ast.value.raw));
  },
  TemplateLiteral: (ast, d) => (o) => {
    const exs = [...ast.expressions];
    for (let q of ast.quasis) {
      o.element(".quasis", node(q, d));
      const e = exs.shift();
      if (e) o.element(".expression", node(e, d));
    }
  },
  ArrayExpression: (ast, d) => (o) => {
    o.element(".elements", (o) =>
      ast.elements.forEach((n) => o.element(".element", node(n, d)))
    );
  },

  ForInStatement: (ast, d) => map.ForOfStatement(ast, d),
  ForOfStatement: (ast, d) => (o) => {
    o.element(".left", node(ast.left, d));
    o.element(".right", node(ast.right, d));
    o.element(".body.S" + (d + 1), node(ast.body, d + 1));
  },

  SequenceExpression: (ast, d) => (o) => {
    o.element(".expressions", (o) =>
      ast.expressions.forEach((n, i) => o.element(".expression", node(n, d)))
    );
  },
  RestElement: (ast, d) => (o) => o.element(".argument", node(ast.argument, d)),
  UnaryExpression: (ast, d) => (o) => {
    o.text(ast.operator);
    o.element(".argument", node(ast.argument, d));
  },

  SpreadElement: (ast, d) => map.RestElement(ast, d),

  ConditionalExpression: (ast, d) => (o) => {
    o.element(".test", node(ast.test, d));
    o.element(".consequent", node(ast.consequent, d));
    o.element(".alternate", node(ast.alternate, d));
  },

  IfStatement: (ast, d) => (o) => {
    o.element(".test", node(ast.test, d));
    o.element(".consequent", node(ast.consequent, d));
    if (ast.alternate) o.element(".alternate", node(ast.alternate, d));
  },

  ExpressionStatement: (ast, d) => (o) =>
    o.element(".expression", node(ast.expression, d)),

  ObjectMethod: (ast, d) => (o) => {
    o.element("td.key" + (ast.computed ? ".computed" : ""), node(ast.key, d));
    o.element("td.value", map.FunctionDeclaration(ast, d));
  },
  ObjectProperty: (ast, d) => (o) => {
    o.element("td.key" + (ast.computed ? ".computed" : ""), node(ast.key, d));
    o.element("td.value", node(ast.value, d));
  },

  ObjectExpression: (ast, d) => (o) => {
    o.element("table.properties", (o) =>
      ast.properties.forEach((n) => o.element("tr.property", node(n, d)))
    );
  },

  OptionalMemberExpression: (ast, d) => (o) => {
    o.element(".object", node(ast.object, d));
    o.element(
      ".property" + (ast.computed ? ".computed" : ""),
      node(ast.property, d)
    );
  },
  MemberExpression: (ast, d) => map.OptionalMemberExpression(ast, d),

  NullLiteral: (ast) => (o) => o.text("null"),
  StringLiteral: (ast) => (o) => o.text(ast.extra.raw),
  NumericLiteral: (ast) => (o) => o.text(ast.value + ""),
  BooleanLiteral: (ast) => map.NumericLiteral(ast),

  CallExpression: (ast, d) => (o) => {
    o.element(".callee", node(ast.callee, d));
    o.element(".arguments", (o) =>
      ast.arguments.forEach((n, i) => o.element(".argument", node(n, d)))
    );
  },

  ReturnStatement: (ast, d) => (o) =>
    o.element(
      ".return",
      ast.argument ? node(ast.argument, d) : (o) => o.text(" ")
    ),

  BlockStatement: (ast, d) => (o) =>
    ast.body.forEach((n, i) => o.element(".line", node(n, d))),

  FunctionDeclaration: (ast, d) => (o) => {
    o.element(".id", node(ast.id, d));
    o.element(".params", (o) =>
      ast.params.forEach((n, i) => o.element(".param", node(n, d)))
    );
    o.element(".body.S" + (d + 1), node(ast.body, d + 1));
  },
  ArrowFunctionExpression: (ast, d) => map.FunctionDeclaration(ast, d),
  FunctionExpression: (ast, d) => map.FunctionDeclaration(ast, d),
  AssignmentPattern: (ast, d) => (o) => {
    o.element(".left", node(ast.left, d));
    o.element(".right", node(ast.right, d));
  },

  AssignmentExpression: (ast, d) => map.BinaryExpression(ast, d),
  LogicalExpression: (ast, d) => map.BinaryExpression(ast, d),
  BinaryExpression: (ast, d) => (o) => {
    o.element(".left", node(ast.left, d));
    o.element(".operator", (o) => o.text(ast.operator));
    o.element(".right", node(ast.right, d));
  },
  Identifier: (ast) => (o) => o.text(ast.name),
  VariableDeclarator: (ast, d) => (o) => {
    o.element(".id", node(ast.id, d));
    if (ast.init) o.element(".init", node(ast.init, d));
  },
  VariableDeclaration: (ast, d) => (o) => {
    o.element(".kind", (o) => o.text(ast.kind));
    o.element(".declarations", (o) =>
      ast.declarations.forEach((n, i) => o.element(".declaration", node(n, d)))
    );
  },
  Program: (ast, d) => map.BlockStatement(ast, d),
  File: (ast, d) => (o) => {
    o.element(".program", node(ast.program, d));
  },
};
const node = (ast, d: number) => (o) => {
  if (ast == null) return;
  const type: string = typeof ast.type === "string" ? ast.type : "";
  //  o.attr("class", type);
  //  o.attr("tabindex", "0");
  //  o.on("click", (e) => {
  //    console.info(ast);
  //  });
  //  if (ast?.extra?.parenthesized) o.attr("class", type + " parenthesized");
  if (map[type]) map[type](ast, d)(o);
  else
    o.element("pre", (o) =>
      o.element("code", (o) => {
        o.text("NA>" + type);
        console.log("NA", clean(ast));
      })
    );
};

function clean(ast) {
  if (ast == null) return ast;
  else if (Array.isArray(ast)) return ast.map(clean);
  else if (typeof ast === "object")
    return Object.keys(ast).reduce((s, key) => {
      if (remove.every((k) => k !== key)) s[key] = clean(ast[key]);
      return s;
    }, {});
  else return ast;
}
module.exports = (code: string): N<element.element_pith_t> => (o) => {
  o.element(
    "style",
    (o) => {
      //      o.attr("scoped", "");
      o.text(require("fs").readFileSync(__dirname + "/ast.css", "utf8"));
    },
    "ast"
  );
  node(babel(code), 0)(o);
  var focused: HTMLElement;
  //  o.on("create", (elm) => {
  //    focused = elm;
  //    focused.focus();
  //  });
  //  o.on(
  //    "focus",
  //    (e) => {
  //      if (!(e.target instanceof HTMLElement))
  //        return console.log("nonhtmltaetfocus");
  //      focused = e.target;
  //      console.log("focused", focused);
  //    },
  //    true
  //  );
  //  o.on("keypress", (e) => {
  //    console.log("kp", focused);
  //  });
};
