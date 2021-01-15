// A.1 Lexical grammar
// A.1.1 Lexical elements

function token(o) {
  o(keyword);
  o(identifier);
  o(constant);
  o(string_literal);
  o(punctuator);
}
function preprocessing_token(o) {
  o(header_name);
  o(identifier);
  o(pp_number);
  o(character_constant);
  o(string_literal);
  o(punctuator);
  //o(each non_white_space character that cannot be
  //  one of the above)
}

// A.1.2 Keywords

function keyword(o) {
  oneof(
    "auto",
    "break",
    "case",
    "char",
    "const",
    "continue",
    "default",
    "do",
    "double",
    "else",
    "enum",
    "extern",
    "float",
    "for",
    "goto",
    "∗",
    "if",
    "inline",
    "int",
    "long",
    "register",
    "restrict",
    "return",
    "short",
    "signed",
    "sizeof",
    "static",
    "struct",
    "switch",
    "typedef",
    "union",
    "unsigned",
    "void",
    "volatile",
    "while",
    "_Alignas",
    "_Alignof",
    "_Atomic",
    "_Bool",
    "_Complex",
    "_Generic",
    "_Imaginary",
    "_Noreturn",
    "_Static_assert",
    "_Thread_local"
  )(o);
}

// A.1.3 Identifiers

function identifier(o) {
  o(identifier_nondigit);
  o(identifier, identifier_nondigit);
  o(identifier, digit);
}
function identifier_nondigit(o) {
  o(nondigit);
  o(universal_character_name);
  //o(other implementation_defined characters)
}
// prettier-ignore
function nondigit(o) {
  oneof( "_",
  	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  )(o);
}
function digit(o) {
  oneof("0", "1", "2", "3", "4", "5", "6", "7", "8", "9")(o);
}

// A.1.4 Universal character names

function universal_character_name(o) {
  o("\\u", hex_quad);
  o("\\U", hex_quad, hex_quad);
}
function hex_quad(o) {
  o(hexadecimal_digit, hexadecimal_digit, hexadecimal_digit, hexadecimal_digit);
}

// A.1.5 Constants

function constant(o) {
  o(integer_constant);
  o(floating_constant);
  o(enumeration_constant);
  o(character_constant);
}
function integer_constant(o) {
  o(decimal_constant, opt(integer_suffix));
  o(octal_constant, opt(integer_suffix));
  o(hexadecimal_constant, opt(integer_suffix));
}
function decimal_constant(o) {
  o(nonzero_digit);
  o(decimal_constant, digit);
}
function octal_constant(o) {
  o("0");
  o(octal_constant, octal_digit);
}
function hexadecimal_constant(o) {
  o(hexadecimal_prefix, hexadecimal_digit);
  o(hexadecimal_constant, hexadecimal_digit);
}
function hexadecimal_prefix(o) {
  oneof("0x", "0X")(o);
}
function nonzero_digit(o) {
  oneof("1", "2", "3", "4", "5", "6", "7", "8", "9")(o);
}
function octal_digit(o) {
  oneof("0", "1", "2", "3", "4", "5", "6", "7")(o);
}
// prettier-ignore
function hexadecimal_digit(o) {
  oneof(
  	  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  	  "a", "b", "c", "d", "e", "f",
  	  "A", "B", "C", "D", "E", "F"
  )(o);
}
function integer_suffix(o) {
  o(unsigned_suffix, opt(long_suffix));
  o(unsigned_suffix, long_long_suffix);
  o(long_suffix, opt(unsigned_suffix));
  o(long_long_suffix, opt(unsigned_suffix));
}
function unsigned_suffix(o) {
  oneof("u", "U")(o);
}
function long_suffix(o) {
  oneof("l", "L")(o);
}
function long_long_suffix(o) {
  oneof("ll", "LL")(o);
}
function floating_constant(o) {
  o(decimal_floating_constant);
  o(hexadecimal_floating_constant);
}
function decimal_floating_constant(o) {
  o(fractional_constant, opt(exponent_part), opt(floating_suffix));
  o(digit_sequence, exponent_part, opt(floating_suffix));
}
function hexadecimal_floating_constant(o) {
  o(
    hexadecimal_prefix,
    hexadecimal_fractional_constant,
    binary_exponent_part,
    opt(floating_suffix)
  );
  o(
    hexadecimal_prefix,
    hexadecimal_digit_sequence,
    binary_exponent_part,
    opt(floating_suffix)
  );
}
function fractional_constant(o) {
  o(opt(digit_sequence), ".", digit_sequence);
  o(digit_sequence, ".");
}
function exponent_part(o) {
  o("e", opt(sign), digit_sequence);
  o("E", opt(sign), digit_sequence);
}
function sign(o) {
  oneof("+", "-")(o);
}
function digit_sequence(o) {
  o(digit);
  o(digit_sequence, digit);
}
function hexadecimal_fractional_constant(o) {
  o(opt(hexadecimal_digit_sequence), ".", hexadecimal_digit_sequence);
  o(hexadecimal_digit_sequence, ".");
}
function binary_exponent_part(o) {
  o("p", opt(sign), digit_sequence);
  o("P", opt(sign), digit_sequence);
}
function hexadecimal_digit_sequence(o) {
  o(hexadecimal_digit);
  o(hexadecimal_digit_sequence, hexadecimal_digit);
}
function floating_suffix(o) {
  oneof("f", "l", "F", "L")(o);
}
function enumeration_constant(o) {
  o(identifier);
}
function character_constant(o) {
  o("'", c_char_sequence, "'");
  o("L'", c_char_sequence, "'");
  o("u'", c_char_sequence, "'");
  o("U'", c_char_sequence, "'");
}
function c_char_sequence(o) {
  o(c_char);
  o(c_char_sequence, c_char);
}
function c_char(o) {
  //any member of the source character set except the single_quote ', backslash \, or new_line character
  o(escape_sequence);
}
function escape_sequence(o) {
  o(simple_escape_sequence);
  o(octal_escape_sequence);
  o(hexadecimal_escape_sequence);
  o(universal_character_name);
}
function simple_escape_sequence(o) {
  oneof(
    "\\'",
    '\\"',
    "\\?",
    `\\\\`,
    "\\a",
    "\\b",
    "\\f",
    "\\n",
    "\\r",
    "\\t",
    "\\v"
  )(o);
}
function octal_escape_sequence(o) {
  o("\\", octal_digit);
  o("\\", octal_digit, octal_digit);
  o("\\", octal_digit, octal_digit, octal_digit);
}
function hexadecimal_escape_sequence(o) {
  o("\\x", hexadecimal_digit);
  o(hexadecimal_escape_sequence, hexadecimal_digit);
}

//A.1.6 String literals

function string_literal(o) {
  o(opt(encoding_prefix), '"', opt(s_char_sequence), '"');
}
function encoding_prefix(o) {
  o("u8");
  o("u");
  o("U");
  o("L");
}
function s_char_sequence(o) {
  o(s_char);
  o(s_char_sequence, s_char);
}
function s_char(o) {
  //o(any member of the source character set except the double_quote ", backslash \, or new_line character)
  o(escape_sequence);
}

//A.1.7 Punctuators

function punctuator(o) {
  oneof(
    "[",
    "]",
    "(",
    ")",
    "{",
    "}",
    ".",
    "->",
    "++",
    "--",
    "&",
    "*",
    "+",
    "-",
    "~",
    "!",
    "/",
    "%",
    "<<",
    ">>",
    "<",
    ">",
    "<=",
    ">=",
    "==",
    "!=",
    "^",
    "|",
    "&&",
    "||",
    "?",
    ":",
    ";",
    "...",
    "=",
    "*=",
    "/=",
    "%=",
    "+=",
    "-=",
    "<<=",
    ">>=",
    "&=",
    "^=",
    "|=",
    ",",
    "#",
    "##",
    "<:",
    ":>",
    "<%",
    "%>",
    "%:",
    "%:%:"
  )(o);
}

//A.1.8 Header names

function header_name(o) {
  o("<", h_char_sequence, ">");
  o('"', q_char_sequence, '"');
}
function h_char_sequence(o) {
  o(h_char);
  o(h_char_sequence, h_char);
}
function h_char(o) {
  //o(any member of the source character set except the new_line character and >)
}
function q_char_sequence(o) {
  o(q_char);
  o(q_char_sequence, q_char);
}
function q_char(o) {
  //o(any member of the source character set except the new_line character and ")
}

//A.1.9 Preprocessing numbers

function pp_number(o) {
  o(digit);
  o(".", digit);
  o(pp_number, digit);
  o(pp_number, identifier_nondigit);
  o(pp_number, "e", sign);
  o(pp_number, "E", sign);
  o(pp_number, "p", sign);
  o(pp_number, "P", sign);
  o(pp_number, ".");
}

// A.2 Phrase structure grammar
// A.2.1 Expressions

function primary_expression(o) {
  o(identifier);
  o(constant);
  o(string_literal);
  o("(", expression, ")");
  o(generic_selection);
}
function generic_selection(o) {
  o("_Generic", "(", assignment_expression, ",", generic_assoc_list, ")");
}
function generic_assoc_list(o) {
  o(generic_association);
  o(generic_assoc_list, ",", generic_association);
}
function generic_association(o) {
  o(type_name, ":", assignment_expression);
  o("default", ":", assignment_expression);
}
function postfix_expression(o) {
  o(primary_expression);
  o(postfix_expression, "[", expression, "]");
  o(postfix_expression, "(", opt(argument_expression_list), ")");
  o(postfix_expression, ".", identifier);
  o(postfix_expression, "->", identifier);
  o(postfix_expression, "++");
  o(postfix_expression, "__");
  o("(", type_name, ")", "{", initializer_list, "}");
  o("(", type_name, ")", "{", initializer_list, ",", "}");
}
function argument_expression_list(o) {
  o(assignment_expression);
  o(argument_expression_list, ",", assignment_expression);
}
function unary_expression(o) {
  o(postfix_expression);
  o("++", unary_expression);
  o("--", unary_expression);
  o(unary_operator, cast_expression);
  o("sizeof", unary_expression);
  o("sizeof", "(", type_name, ")");
  o("_Alignof", "(", type_name, ")");
}
function unary_operator(o) {
  oneof("&", "*", "+", "-", "~", "!")(o);
}
function cast_expression(o) {
  o(unary_expression);
  o("(", type_name, ")", cast_expression);
}
function multiplicative_expression(o) {
  o(cast_expression);
  o(multiplicative_expression, "*", cast_expression);
  o(multiplicative_expression, "/", cast_expression);
  o(multiplicative_expression, "%", cast_expression);
}
function additive_expression(o) {
  o(multiplicative_expression);
  o(additive_expression, "+", multiplicative_expression);
  o(additive_expression, "-", multiplicative_expression);
}
function shift_expression(o) {
  o(additive_expression);
  o(shift_expression, "<<", additive_expression);
  o(shift_expression, ">>", additive_expression);
}
function relational_expression(o) {
  o(shift_expression);
  o(relational_expression, "<", shift_expression);
  o(relational_expression, ">", shift_expression);
  o(relational_expression, "<=", shift_expression);
  o(relational_expression, ">=", shift_expression);
}
function equality_expression(o) {
  o(relational_expression);
  o(equality_expression, "==", relational_expression);
  o(equality_expression, "!=", relational_expression);
}
function AND_expression(o) {
  o(equality_expression);
  o(AND_expression, "&", equality_expression);
}
function exclusive_OR_expression(o) {
  o(AND_expression);
  o(exclusive_OR_expression, "^", AND_expression);
}
function inclusive_OR_expression(o) {
  o(exclusive_OR_expression);
  o(inclusive_OR_expression, "|", exclusive_OR_expression);
}
function logical_AND_expression(o) {
  o(inclusive_OR_expression);
  o(logical_AND_expression, "&&", inclusive_OR_expression);
}
function logical_OR_expression(o) {
  o(logical_AND_expression);
  o(logical_OR_expression, "||", logical_AND_expression);
}
function conditional_expression(o) {
  o(logical_OR_expression);
  o(logical_OR_expression, "?", expression, ":", conditional_expression);
}
function assignment_expression(o) {
  o(conditional_expression);
  o(unary_expression, assignment_operator, assignment_expression);
}
function assignment_operator(o) {
  oneof("=", "*=", "/=", "%=", "+=", "-=", "<<=", ">>=", "&=", "^=", "|=")(o);
}
function expression(o) {
  o(assignment_expression);
  o(expression, ",", assignment_expression);
}
function constant_expression(o) {
  o(conditional_expression);
}

//A.2.2 Declarations

function declaration(o) {
  o(declaration_specifiers, opt(init_declarator_list), ";");
  o(static_assert_declaration);
}
function declaration_specifiers(o) {
  o(storage_class_specifier, opt(declaration_specifiers));
  o(type_specifier, opt(declaration_specifiers));
  o(type_qualifier, opt(declaration_specifiers));
  o(function_specifier, opt(declaration_specifiers));
  o(alignment_specifier, opt(declaration_specifiers));
}
function init_declarator_list(o) {
  o(init_declarator);
  o(init_declarator_list, ",", init_declarator);
}
function init_declarator(o) {
  o(declarator);
  o(declarator, "=", initializer);
}
function storage_class_specifier(o) {
  o("typedef");
  o("extern");
  o("static");
  o("_Thread_local");
  o("auto");
  o("register");
}
function type_specifier(o) {
  o("void");
  o("char");
  o("short");
  o("int");
  o("long");
  o("float");
  o("double");
  o("signed");
  o("unsigned");
  o("_Bool");
  o("_Complex");
  o(atomic_type_specifier);
  o(struct_or_union_specifier);
  o(enum_specifier);
  o(typedef_name);
}
function struct_or_union_specifier(o) {
  o(struct_or_union, opt(identifier), "{", struct_declaration_list, "}");
  o(struct_or_union, identifier);
}
function struct_or_union(o) {
  o("struct");
  o("union");
}
function struct_declaration_list(o) {
  o(struct_declaration);
  o(struct_declaration_list, struct_declaration);
}
function struct_declaration(o) {
  o(specifier_qualifier_list, opt(struct_declarator_list), ";");
  o(static_assert_declaration);
}
function specifier_qualifier_list(o) {
  o(type_specifier, opt(specifier_qualifier_list));
  o(type_qualifier, opt(specifier_qualifier_list));
}
function struct_declarator_list(o) {
  o(struct_declarator);
  o(struct_declarator_list, ",", struct_declarator);
}
function struct_declarator(o) {
  o(declarator);
  o(opt(declarator), ":", constant_expression);
}
function enum_specifier(o) {
  o("enum", opt(identifier), "{", enumerator_list, "}");
  o("enum", opt(identifier), "{", enumerator_list, ",", "}");
  o("enum", identifier);
}
function enumerator_list(o) {
  o(enumerator);
  o(enumerator_list, ",", enumerator);
}
function enumerator(o) {
  o(enumeration_constant);
  o(enumeration_constant, "=", constant_expression);
}
function atomic_type_specifier(o) {
  o("_Atomic", "(", type_name, ")");
}
function type_qualifier(o) {
  o("const");
  o("restrict");
  o("volatile");
  o("_Atomic");
}
function function_specifier(o) {
  o("inline");
  o("_Noreturn");
}
function alignment_specifier(o) {
  o("_Alignas", "(", type_name, ")");
  o("_Alignas", "(", constant_expression, ")");
}
function declarator(o) {
  o(opt(pointer), direct_declarator);
}
function direct_declarator(o) {
  o(identifier);
  o("(", declarator, ")");
  o(
    direct_declarator,
    "[",
    opt(type_qualifier_list),
    opt(assignment_expression),
    "]"
  );
  o(
    direct_declarator,
    "[",
    "static",
    opt(type_qualifier_list),
    assignment_expression,
    "]"
  );
  o(
    direct_declarator,
    "[",
    type_qualifier_list,
    "static",
    assignment_expression,
    "]"
  );
  o(direct_declarator, "[", opt(type_qualifier_list), "*", "]");
  o(direct_declarator, "(", parameter_type_list, ")");
  o(direct_declarator, "(", opt(identifier_list), ")");
}
function pointer(o) {
  o("*", opt(type_qualifier_list));
  o("*", opt(type_qualifier_list), pointer);
}
function type_qualifier_list(o) {
  o(type_qualifier);
  o(type_qualifier_list, type_qualifier);
}
function parameter_type_list(o) {
  o(parameter_list);
  o(parameter_list, ",", "...");
}
function parameter_list(o) {
  o(parameter_declaration);
  o(parameter_list, ",", parameter_declaration);
}
function parameter_declaration(o) {
  o(declaration_specifiers, declarator);
  o(declaration_specifiers, opt(abstract_declarator));
}
function identifier_list(o) {
  o(identifier);
  o(identifier_list, ",", identifier);
}
function type_name(o) {
  o(specifier_qualifier_list, opt(abstract_declarator));
}
function abstract_declarator(o) {
  o(pointer);
  o(opt(pointer), direct_abstract_declarator);
}
function direct_abstract_declarator(o) {
  o("(", abstract_declarator, ")");
  o(
    opt(direct_abstract_declarator),
    "[",
    opt(type_qualifier_list),
    opt(assignment_expression),
    "]"
  );
  o(
    opt(direct_abstract_declarator),
    "[",
    "static",
    opt(type_qualifier_list),
    assignment_expression,
    "]"
  );
  o(
    opt(direct_abstract_declarator),
    "[",
    type_qualifier_list,
    "static",
    assignment_expression,
    "]"
  );
  o(opt(direct_abstract_declarator), "[", "*", "]");
  o(opt(direct_abstract_declarator), "(", opt(parameter_type_list), ")");
}
function typedef_name(o) {
  o(identifier);
}
function initializer(o) {
  o(assignment_expression);
  o("{", initializer_list, "}");
  o("{", initializer_list, ",", "}");
}
function initializer_list(o) {
  o(opt(designation), initializer);
  o(initializer_list, ",", opt(designation), initializer);
}
function designation(o) {
  o(designator_list, "=");
}
function designator_list(o) {
  o(designator);
  o(designator_list, designator);
}
function designator(o) {
  o("[", constant_expression, "]");
  o(".", identifier);
}
function static_assert_declaration(o) {
  o("_Static_assert", "(", constant_expression, ",", string_literal, ")", ";");
}

// A.2.3 Statements

function statement(o) {
  o(labeled_statement);
  o(compound_statement);
  o(expression_statement);
  o(selection_statement);
  o(iteration_statement);
  o(jump_statement);
}
function labeled_statement(o) {
  o(identifier, ":", statement);
  o("case", constant_expression, ":", statement);
  o("default", ":", statement);
}
function compound_statement(o) {
  o("{", opt(block_item_list), "}");
}
function block_item_list(o) {
  o(block_item);
  o(block_item_list, block_item);
}
function block_item(o) {
  o(declaration);
  o(statement);
}
function expression_statement(o) {
  o(opt(expression), ";");
}
function selection_statement(o) {
  o("if", "(", expression, ")", statement);
  o("if", "(", expression, ")", statement, "else", statement);
  o("switch", "(", expression, ")", statement);
}
function iteration_statement(o) {
  o("while", "(", expression, ")", statement);
  o("do", statement, "while", "(", expression, ")", ";");
  o(
    "for",
    "(",
    opt(expression),
    ";",
    opt(expression),
    ";",
    opt(expression),
    ")",
    statement
  );
  o(
    "for",
    "(",
    declaration,
    opt(expression),
    ";",
    opt(expression),
    ")",
    statement
  );
}
function jump_statement(o) {
  o("goto", identifier, ";");
  o("continue", ";");
  o("break", ";");
  o("return", opt(expression), ";");
}

// A.2.4 External definitions

function translation_unit(o) {
  o(external_declaration);
  o(translation_unit, external_declaration);
}
function external_declaration(o) {
  o(function_definition);
  o(declaration);
}
function function_definition(o) {
  o(
    declaration_specifiers,
    declarator,
    opt(declaration_list),
    compound_statement
  );
}
function declaration_list(o) {
  o(declaration);
  o(declaration_list, declaration);
}

// A.3 Preprocessing directives

function preprocessing_file(o) {
  o(opt(group));
}
function group(o) {
  o(group_part);
  o(group, group_part);
}
function group_part(o) {
  o(if_section);
  o(control_line);
  o(text_line);
  o("#", non_directive);
}
function if_section(o) {
  o(if_group, opt(elif_groups), opt(else_group), endif_line);
}
function if_group(o) {
  o("#", "if", constant_expression, new_line, opt(group));
  o("#", "ifdef", identifier, new_line, opt(group));
  o("#", "ifndef", identifier, new_line, opt(group));
}
function elif_groups(o) {
  o(elif_group);
  o(elif_groups, elif_group);
}
function elif_group(o) {
  o("#", "elif", constant_expression, new_line, opt(group));
}
function else_group(o) {
  o("#", "else", new_line, opt(group));
}
function endif_line(o) {
  o("#", "endif", new_line);
}
function control_line(o) {
  o("#", "include", pp_tokens, new_line);
  o("#", "define", identifier, replacement_list, new_line);
  o(
    "#",
    "define",
    identifier,
    lparen,
    opt(identifier_list),
    ")",
    replacement_list,
    new_line
  );
  o("#", "define", identifier, lparen, "...", ")", replacement_list, new_line);
  o(
    "#",
    "define",
    identifier,
    lparen,
    identifier_list,
    ",",
    "...",
    ")",
    replacement_list,
    new_line
  );
  o("#", "undef", identifier, new_line);
  o("#", "line", pp_tokens, new_line);
  o("#", "error", opt(pp_tokens), new_line);
  o("#", "pragma", opt(pp_tokens), new_line);
  o("#", new_line);
}
function text_line(o) {
  o(opt(pp_tokens), new_line);
}
function non_directive(o) {
  o(pp_tokens, new_line);
}
function lparen(o) {
  //o(a ( character not immediately preceded by white_space)
}
function replacement_list(o) {
  o(opt(pp_tokens));
}
function pp_tokens(o) {
  o(preprocessing_token);
  o(pp_tokens, preprocessing_token);
}
function new_line(o) {
  //o(the new_line character)
}

function opt(nar) {
  return new Function(
    "const nar=arguments[0];return function " +
      nar.name +
      "_opt(o){o(nar);o('');}"
  )(nar);
}
function oneof(...terms) {
  return (o) => {
    terms.forEach((t) => o(t));
  };
}
function isVar(s) {
  return "function" === typeof s && s.name.length > 0 && s.name[0] !== "_";
}
function enumvars(s, o) {
  var d = 0;
  const sent = {};
  bark(s);
  function end() {}
  function error(msg) {}
  function shift(term) {}
  function reduce(nt, prod) {}
  function bark(s) {
    if (!isVar(s) || sent[s.name]) return;
    sent[s.name] = true;
    o(s, d++, shift, reduce, end, error);
    s(pith);
    d--;
  }
  function pith(...p) {
    for (let s of p) bark(s);
  }
}
function logvar(v, i) {
  i = 0;
  console.log("".padStart(i * 2 + " ") + v.name + "→");
  v((...p) =>
    console.log(
      "".padStart((i + 1) * 2, " ") +
        p.map((s) => ("function" === typeof s ? s.name : s ? s : "ε")).join(" ")
    )
  );
}
function logasm(v) {
  console.log("global " + v.name);
  console.log(v.name + ":");
  const a = [];
  v((...args) => a.push(args));
  for (let p of a) {
    const islast = p === a[a.length - 1];
    let str = "Ξ ";
    str += islast ? "0" : "Ν";
    str += ", ";
    str += p
      .map(
        (s) =>
          "{" +
          (typeof s === "string"
            ? "Τ " + (s.includes('"') ? "'" + s + "'" : '"' + s + '"')
            : "Α " + s.name) +
          "}"
      )
      .join(", ");
    str += ", {Γ _}";
    console.log(str);
  }
}
function print(g) {
  enumvars(g, logasm);
}
console.clear();
print(declaration);
