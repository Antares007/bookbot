// flow strict
const ast = require("../lib/babel");
export function bexp(f: (...args: Array<mixed>) => mixed, mae: string): string {
  const code = `(${f.toString()})`;
  const params = ast.parse(code).program.body[0].expression.params;
  if (params.length === 1 && params[0].type === "ObjectPattern") {
    var pc = [];
    ObjectPattern(params[0], mae, pc.push.bind(pc));
    return [
      pc.join(" &&\n\t"),
      code.slice(params[0].start, params[0].end).replace(/\n| |"/g, ""),
    ];
  } else if (params.length === 0) {
    return ["true", "true"];
  } else {
    return ["false", "false"];
  }
}
function ObjectPattern({ properties }, mae, o) {
  var len = properties.length;
  const hasRest = len > 0 && properties[len - 1].type === "RestElement";
  if (hasRest) o(`Object.keys(${mae}).length >= ${--len}`);
  else o(`Object.keys(${mae}).length === ${len}`);
  for (let i = 0; i < len; i++) {
    const n = properties[i];
    if (n.type === "ObjectProperty") {
      if (n.key.type !== "Identifier") throw new Error("empty");
      const id = n.key.name;
      const v = n.value;
      if (v.type === "ArrayPattern") ArrayPattern(v, mae + "." + id, o);
      else if (v.type === "Identifier");
      else throw new Error(v?.type);
    } else if (n.type === "RestElement") {
      hasrest = true;
    } else {
      throw new Error(n?.type);
    }
  }
}
function ArrayPattern({ elements }, mae, o) {
  var len = elements.length;
  var hasrest = false;
  var n;
  while (len > 0) {
    n = elements[len - 1];
    if (n.type === "RestElement") {
      hasrest = true;
      len--;
    } else if (n.type === "AssignmentPattern" && n.right.type === "NullLiteral")
      len--;
    else break;
  }
  if (elements.length === len) o(`${mae}.length === ${len}`);
  else if (hasrest) o(`${mae}.length >= ${len}`);
  else o(`${mae}.length >= ${len} && ${mae}.length <= ${elements.length}`);
  for (let i = 0; i < len; i++) {
    n = elements[i];
    if ("Identifier" === n.type);
    else if ("AssignmentPattern" === n.type) {
      if (
        "StringLiteral" === n.right.type ||
        "NumericLiteral" === n.right.type ||
        "BooleanLiteral" === n.right.type
      )
        o(`${mae}[${i}] === "${n.right.value}"`);
      else throw new Error(n?.type);
    } else throw new Error(n?.type);
  }
}
