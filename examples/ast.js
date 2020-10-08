// @flow strict
import type { N } from "../src/purry";
const p = require("../src/purry");
const code = require("fs")
  .readFileSync(require("path").resolve(__dirname, "ast.js"))
  .toString();
const ast = require("../lib/babel")(code);
const document = require("../src/document");
const element = require("../src/element");
function af(aa, ba, ca) {
  const te = `${1 + 2}
a`;
  const za = (aa + ba + 1) * ca,
    dec2 = 42,
    dec3 = 43;
  const f = (a) => void 0;
  function hof(cb, ...agrs) {
    cb("hello");
    if (true === false) return;
    return function () {};
  }
  const obj = { a: 2, b: { c: 3 } };
  const a = {};
  a["1" + "2"](3);
  for (const a of []) {
    console.log(a);
  }
  hof(
    function (v) {
      console.log(v);
    },
    1,
    (v) => console.log(v),
    2,
    3,
    (v) => {
      console.log(v);
    }
  );
  function bf(ab, bb, cb) {
    const zb = ab + bb * cb;
    function cf(ac, bc, cc) {
      function df(ad, bd, cd) {
        function ef(ae, be, ce) {
          function ff(af, bf, cf) {
            const zf = af + bf * cf;
          }
        }
      }
    }
    const zb2 = ab + bb * cb;
  }
  const za2 = aa + ba * ca;
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
  ImportSpecifier: (ast, d) => (o) => {
    o.element("span.imported", node(ast.imported, d));
    o.element("span.local", node(ast.local, d));
  },
  ImportDeclaration: (ast, d) => (o) => {
    o.element("span.specifiers", (o) =>
      ast.specifiers.forEach((n, i) => o.element("span", node(n, d)))
    );
    o.element("span.source", node(ast.source, d));
  },
  TemplateElement: (ast, d) => (o) => {
    o.element("pre", (o) => o.text(ast.value.raw));
  },
  TemplateLiteral: (ast, d) => (o) => {
    const exs = [...ast.expressions];
    for (let q of ast.quasis) {
      o.element("span.quasis", node(q, d));
      const e = exs.shift();
      if (e) o.element("span.expression", node(e, d));
    }
  },
  ArrayExpression: (ast, d) => (o) => {
    o.element("span.elements", (o) =>
      ast.elements.forEach((n) => o.element("span.element", node(n, d)))
    );
  },

  ForInStatement: (ast, d) => map.ForOfStatement(ast, d),
  ForOfStatement: (ast, d) => (o) => {
    o.element("span.left", node(ast.left, d));
    o.element("span.right", node(ast.right, d));
    o.element("div.body.S" + (d + 1), node(ast.body, d + 1));
  },

  SequenceExpression: (ast, d) => (o) => {
    o.element("span.expressions", (o) =>
      ast.expressions.forEach((n, i) =>
        o.element("span.expression", node(n, d))
      )
    );
  },
  RestElement: (ast, d) => (o) =>
    o.element("span.argument", node(ast.argument, d)),
  UnaryExpression: (ast, d) => (o) => {
    o.text(ast.operator + " ");
    o.element("span.argument", node(ast.argument, d));
  },

  SpreadElement: (ast, d) => map.RestElement(ast, d),

  ConditionalExpression: (ast, d) => (o) => {
    o.element("span.test", node(ast.test, d));
    o.element("span.consequent", node(ast.consequent, d));
    o.element("span.alternate", node(ast.alternate, d));
  },

  IfStatement: (ast, d) => (o) => {
    o.element("span.test", node(ast.test, d));
    o.element("span.consequent", node(ast.consequent, d));
    if (ast.alternate) o.element("span.alternate", node(ast.alternate, d));
  },

  ExpressionStatement: (ast, d) => (o) =>
    o.element("span.expression", node(ast.expression, d)),

  ObjectProperty: (ast, d) => (o) => {
    o.element("span.key" + (ast.computed ? ".computed" : ""), node(ast.key, d));
    o.element("span.value", node(ast.value, d));
  },

  ObjectExpression: (ast, d) => (o) => {
    o.element("span.properties", (o) =>
      ast.properties.forEach((n) => o.element("span.property", node(n, d)))
    );
  },

  OptionalMemberExpression: (ast, d) => (o) => {
    o.element("span.object", node(ast.object, d));
    o.element(
      "span.property" + (ast.computed ? ".computed" : ""),
      node(ast.property, d)
    );
  },
  MemberExpression: (ast, d) => map.OptionalMemberExpression(ast, d),

  NullLiteral: (ast) => (o) => o.text(null),
  StringLiteral: (ast) => (o) => o.text(ast.extra.raw),
  NumericLiteral: (ast) => (o) => o.text(ast.value + ""),
  BooleanLiteral: (ast) => map.NumericLiteral(ast),

  CallExpression: (ast, d) => (o) => {
    o.element("span.callee", node(ast.callee, d));
    o.element("span.arguments", (o) =>
      ast.arguments.forEach((n, i) => o.element("span.argument", node(n, d)))
    );
  },

  ReturnStatement: (ast, d) => (o) =>
    o.element(
      "span.return",
      ast.argument ? node(ast.argument, d) : (o) => o.text(" ")
    ),

  BlockStatement: (ast, d) => (o) =>
    ast.body.forEach((n, i) => o.element("div.line", node(n, d))),

  ArrowFunctionExpression: (ast, d) => map.FunctionExpression(ast, d),
  FunctionDeclaration: (ast, d) => map.FunctionExpression(ast, d),
  FunctionExpression: (ast, d) => (o) => {
    if (ast.id) o.element("span.id", node(ast.id, d));
    o.element("span.params", (o) =>
      ast.params.forEach((n, i) => o.element("span.param", node(n, d)))
    );
    o.element(
      (ast.body.type === "BlockStatement" ? "div" : "span") +
        ".body.S" +
        (d + 1),
      node(ast.body, d + 1)
    );
  },
  AssignmentPattern: (ast, d) => (o) => {
    o.element("span.left", node(ast.left, d));
    o.element("span.right", node(ast.right, d));
  },

  AssignmentExpression: (ast, d) => map.BinaryExpression(ast, d),
  LogicalExpression: (ast, d) => map.BinaryExpression(ast, d),
  BinaryExpression: (ast, d) => (o) => {
    o.element("span.left", node(ast.left, d));
    o.element("span.operator", (o) => o.text(ast.operator));
    o.element("span.right", node(ast.right, d));
  },
  Identifier: (ast) => (o) => o.text(ast.name),
  VariableDeclarator: (ast, d) => (o) => {
    o.element("span.id", node(ast.id, d));
    if (ast.init) o.element("span.init", node(ast.init, d));
  },
  VariableDeclaration: (ast, d) => (o) => {
    o.element("span.kind", (o) => o.text(ast.kind));
    o.element("span.declarations", (o) =>
      ast.declarations.forEach((n, i) =>
        o.element("span.declaration", node(n, d))
      )
    );
  },
  Program: (ast, d) => map.BlockStatement(ast, d),
  File: (ast, d) => (o) => o.element("div.program", node(ast.program, d)),
};

const ast2html = (ast: { ... }, d: number) => (o) => {
  for (let key in ast) {
    const value = ast[key];
    if (Array.isArray(value))
      o.element("span." + key, (o) =>
        value.forEach((n) => o.element("span", ast2html(ast, d)))
      );
    else if (typeof value === "object" && value != null) {
      if (value.constructor.name === "Node")
        o.element("span." + key + "." + value.type, ast2html(value, d));
      else
        o.element("span." + key, (o) => {
          //
        });
    }
  }
};

const node = (ast, d: number) => (o) => {
  const type: string = ast.type + "";
  o.attr("class", type);
  o.on("click", (e) => {
    console.info(ast);
  });
  if (ast?.extra?.parenthesized) o.attr("class", type + " parenthesized");
  if (map[type]) map[type](ast, d)(o);
  else
    o.element("pre", (o) =>
      o.element("code", (o) => {
        o.text(JSON.stringify(ast));
        console.log(ast);
      })
    );
};
b((o) => {
  o.head((o) => {
    o.element("style", (o) => {
      o.text(`

.TemplateElement > pre {display: inline;}

.TemplateLiteral > .quasis::before {content: "}"}
.TemplateLiteral > .quasis::after {content: "$\{"}
.TemplateLiteral > :first-child::before {content: "\`"}
.TemplateLiteral > :last-child::after {content: "\`"}

body { font-family: Input Mono Compressed; }
.parenthesized::before {content: "(";}
.parenthesized::after {content: ")";}

.ForInStatement::before {content: "for(";}
.ForInStatement > .right::before {content: " in ";}
.ForInStatement > .right::after {content: ")";}

.ForOfStatement::before {content: "for(";}
.ForOfStatement > .right::before {content: " of ";}
.ForOfStatement > .right::after {content: ")";}

.AssignmentPattern > .right::before {content: " = ";}
.RestElement > .argument::before {content: "...";}
.SpreadElement > .argument::before {content: "...";}

.ConditionalExpression > .test::after {content: " ? ";}
.ConditionalExpression > .consequent::after {content: " : ";}

.IfStatement::before {content: "if ";}
.IfStatement > .test::before {content: "(";}
.IfStatement > .test::after {content: ")";}

.ObjectProperty > .key.computed::before {content: "["}
.ObjectProperty > .key.computed::after {content: "]"}
.ObjectProperty > .value::before {content: ":"}

.ArrayExpression > .elements::before {content: "["}
.ArrayExpression > .elements::after {content: "]"}
.ArrayExpression > .elements > .element::after {content: ", "}
.ArrayExpression > .elements > :last-child::after {content: ""}

.ObjectExpression > .properties::before {content: "{"}
.ObjectExpression > .properties::after {content: "}"}
.ObjectExpression > .properties > .property::after {content: ", "}
.ObjectExpression > .properties > :last-child::after {content: ""}

.OptionalMemberExpression > .property::before {content: "?."}
.OptionalMemberExpression > .property.computed::before {content: "["}
.OptionalMemberExpression > .property.computed::after {content: "]"}

.MemberExpression > .property::before {content: "."}
.MemberExpression > .property.computed::before {content: "["}
.MemberExpression > .property.computed::after {content: "]"}

.ReturnStatement::before {content: "return ";}

.VariableDeclaration > .kind::after {content: " ";}
.VariableDeclaration > .declarations > .declaration::after {content: ", ";}
.VariableDeclaration > .declarations > :last-child::after {content: "";}
.VariableDeclarator > .init::before {content: " = ";}


.SequenceExpression > .expressions::before {content:"(";}
.SequenceExpression > .expressions::after {content:")";}
.SequenceExpression > .expressions > .expression::after {content: ", ";}
.SequenceExpression > .expressions > :last-child::after {content:"";}

.CallExpression > .arguments::before {content:"(";}
.CallExpression > .arguments::after {content:")";}
.CallExpression > .arguments > .argument::after {content: ", ";}
.CallExpression > .arguments > :last-child::after {content:"";}


.FunctionExpression::before {content:"function ";}
.FunctionDeclaration::before {content:"function ";}
.params::before {content:"(";}
.params::after {content:")";}
.params > .param::after {content: ", ";}
.params > :last-child::after {content: "";display:none;}
.ArrowFunctionExpression > .params::after {content:") => ";}

span.body {
    border-radius: 13px;
    padding: 3px;
}
div.body {
    padding: 8px 5px 13px 21px;
    border-radius: 13px;
}
.S0 {
  background-color: #ffffff;
}
.S1 {
  background-color: #ffeeee;
}
.S2 {
  background-color: #ffdddd;
}
.S3 {
  background-color: #ffcccc;
}
.S4 {
  background-color: #ffbbbb;
}
.S5 {
  background-color: #ffaaaa;
}
.S6 {
  background-color: #ff9999;
}
.S7 {
  background-color: #ff8888;
}
.S8 {
  background-color: #ff7777;
}
`);
    });
  });
  node(ast, 0)(o);
});
console.info("AST", ast);
