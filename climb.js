class Tokenizer {
  constructor(expr) {
    const tokens = [];
    for (let i = 0; i < expr.length; i++)
      if (expr[i] === "(") tokens.push({ name: "LEFTPAREN", value: "(" });
      else if (expr[i] === ")") tokens.push({ name: "RIGHTPAREN", value: ")" });
      else if ("0" <= expr[i] && expr[i] <= "9")
        tokens.push({ name: "NUMBER", value: parseInt(expr[i], 10) });
      else tokens.push({ name: "BINOP", value: expr[i] });
    this._tokens = tokens;
    this.cur_token = null;
  }
  get_next_token() {
    this.cur_token = this._tokens.shift() || null;
    return this.cur_token;
  }
}
function parse_error(msg) {
  console.log(msg);
}
function compute_atom(tokenizer) {
  var tok = tokenizer.cur_token;
  if (tok.name === "LEFTPAREN") {
    tokenizer.get_next_token();
    var val = compute_expr(tokenizer, 1);
    if (tokenizer.cur_token.name !== "RIGHTPAREN") parse_error('unmatched "("');
    tokenizer.get_next_token();
    //val.parenthesized = true;
    return val;
  } else if (tok === null) {
    parse_error("source ended unexpectedly");
  } else if (tok.name === "BINOP") {
    parse_error(`expected an atom, not an operator "${tok.value}"`);
  } else {
    if (tok.name !== "NUMBER") throw new Error("NN");
    tokenizer.get_next_token();
    return tok.value;
  }
}
function compute_expr(tokenizer, min_prec = 1) {
  var atom_lhs = compute_atom(tokenizer);
  while (true) {
    const cur = tokenizer.cur_token;
    if (
      cur === null ||
      cur.name !== "BINOP" ||
      OPINFO_MAP[cur.value].prec < min_prec
    ) {
      break;
    }
    // Inside this loop the current token is a binary operator
    assert(cur.name === "BINOP");
    // Get the operator's precedence and associativity, and compute a
    // minimal precedence for the recursive call
    const op = cur.value;
    const { prec, assoc } = OPINFO_MAP[op];
    const next_min_prec = assoc === "LEFT" ? prec + 1 : prec;
    // Consume the current token and prepare the next one for the
    // recursive call
    tokenizer.get_next_token();
    const atom_rhs = compute_expr(tokenizer, next_min_prec);
    // Update lhs with the new value
    //atom_lhs = compute_op(op, atom_lhs, atom_rhs);
    atom_lhs = {
      o: op,
      l: atom_lhs,
      r: atom_rhs,
    };
  }
  return atom_lhs;
}
// For each operator, a (precedence, associativity) pair.
const OPINFO_MAP = {
  "+": { prec: 1, assoc: "LEFT" },
  "-": { prec: 1, assoc: "LEFT" },
  "*": { prec: 2, assoc: "LEFT" },
  "/": { prec: 2, assoc: "LEFT" },
  "^": { prec: 3, assoc: "RIGHT" },
};
parse("1*2+3");

function compute_op(op, lhs, rhs) {
  if (op == "+") return lhs + rhs;
  else if (op == "-") return lhs - rhs;
  else if (op == "*") return lhs * rhs;
  else if (op == "/") return lhs / rhs;
  else if (op == "^") return lhs ** rhs;
  else parse_error(`unknown operator "${op}"`);
}
function assert(b) {
  if (!b) throw new Error("assert");
}
function parse(expr) {
  const tokenizer = new Tokenizer(expr);
  tokenizer.get_next_token();
  console.log(
    require("util").inspect(compute_expr(tokenizer), {
      depth: 10,
      colors: true,
    })
  );
}
