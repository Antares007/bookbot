// @flow strict
export type Comment = {
  value: string,
  start: number,
  end: number,
  loc: SourceLocation,
};

export type CommentBlock = { ...Comment, type: "CommentBlock" };

export type CommentLine = { ...Comment, type: "CommentLine" };

export type SourceLocation = {
  start: {
    line: number,
    column: number,
  },

  end: {
    line: number,
    column: number,
  },
};

export type Node = {
  type: string,
  leadingComments?: Comment[],
  innerComments?: Comment[],
  trailingComments?: Comment[],
  start: number,
  end: number,
  loc: SourceLocation,
};

export type ArrayExpression = {
  ...Node,
  type: "ArrayExpression",
  elements: Array<null | Expression | SpreadElement>,
};

export type AssignmentExpression = {
  ...Node,
  type: "AssignmentExpression",
  operator:
    | "="
    | "+="
    | "-="
    | "*="
    | "/="
    | "%="
    | "<<="
    | ">>="
    | ">>>="
    | "|="
    | "^="
    | "&=",
  left: LVal,
  right: Expression,
};

export type BinaryExpression = {
  ...Node,
  type: "BinaryExpression",
  operator:
    | "+"
    | "-"
    | "/"
    | "%"
    | "*"
    | "**"
    | "&"
    | "|"
    | ">>"
    | ">>>"
    | "<<"
    | "^"
    | "=="
    | "==="
    | "!="
    | "!=="
    | "in"
    | "instanceof"
    | ">"
    | "<"
    | ">="
    | "<=",
  left: Expression,
  right: Expression,
};

export type Directive = { ...Node, type: "Directive", value: DirectiveLiteral };

export type DirectiveLiteral = {
  ...Node,
  type: "DirectiveLiteral",
  value: string,
};

export type BlockStatement = {
  //...Node,
  type: "BlockStatement",
  directives?: Directive[],
  body: Statement[],
};

export type BreakStatement = {
  ...Node,
  type: "BreakStatement",
  label: Identifier,
};

export type CallExpression = {
  ...Node,
  type: "CallExpression",
  callee: Expression | Super,
  arguments: Array<Expression | SpreadElement>,
};

export type CatchClause = {
  ...Node,
  type: "CatchClause",
  param: Identifier,
  body: BlockStatement,
};

export type ConditionalExpression = {
  ...Node,
  type: "ConditionalExpression",
  test: Expression,
  consequent: Expression,
  alternate: Expression,
};

export type ContinueStatement = {
  ...Node,
  type: "ContinueStatement",
  label: Identifier,
};

export type DebuggerStatement = {
  //...Node,
  type: "DebuggerStatement",
};

export type DoWhileStatement = {
  ...Node,
  type: "DoWhileStatement",
  test: Expression,
  body: Statement,
};

export type EmptyStatement = { ...Node, type: "EmptyStatement" };

export type ExpressionStatement = {
  ...Node,
  type: "ExpressionStatement",
  expression: Expression,
};

export type File = {
  ...Node,
  type: "File",
  program: Program,
  comments: Comment[],
  tokens: mixed[],
};

export type ForInStatement = {
  ...Node,
  type: "ForInStatement",
  left: VariableDeclaration | LVal,
  right: Expression,
  body: Statement,
};

export type ForStatement = {
  ...Node,
  type: "ForStatement",
  init: VariableDeclaration | Expression,
  test: Expression,
  update: Expression,
  body: Statement,
};

export type FunctionDeclaration = {
  ...Node,
  type: "FunctionDeclaration",
  id: Identifier,
  params: LVal[],
  body: BlockStatement,
  generator: boolean,
  async: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type FunctionExpression = {
  ...Node,
  type: "FunctionExpression",
  id: Identifier,
  params: LVal[],
  body: BlockStatement,
  generator: boolean,
  async: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type Identifier = {
  ...Node,
  type: "Identifier",
  name: string,
  typeAnnotation?: TypeAnnotation,
};

export type IfStatement = {
  ...Node,
  type: "IfStatement",
  test: Expression,
  consequent: Statement,
  alternate: Statement,
};

export type LabeledStatement = {
  ...Node,
  type: "LabeledStatement",
  label: Identifier,
  body: Statement,
};

export type StringLiteral = { ...Node, type: "StringLiteral", value: string };

export type NumericLiteral = { ...Node, type: "NumericLiteral", value: number };

export type NullLiteral = { ...Node, type: "NullLiteral" };

export type BooleanLiteral = {
  ...Node,
  type: "BooleanLiteral",
  value: boolean,
};

export type RegExpLiteral = {
  ...Node,
  type: "RegExpLiteral",
  pattern: string,
  flags?: string,
};

export type LogicalExpression = {
  ...Node,
  type: "LogicalExpression",
  operator: "||" | "&&",
  left: Expression,
  right: Expression,
};

export type MemberExpression = {
  ...Node,
  type: "MemberExpression",
  object: Expression | Super,
  property: Expression,
  computed: boolean,
};

export type NewExpression = {
  ...Node,
  type: "NewExpression",
  callee: Expression | Super,
  arguments: Array<Expression | SpreadElement>,
};

export type Program = {
  ...Node,
  type: "Program",
  sourceType: "script" | "module",
  directives?: Directive[],
  body: Array<Statement | ModuleDeclaration>,
};

export type ObjectExpression = {
  ...Node,
  type: "ObjectExpression",
  properties: Array<ObjectProperty | ObjectMethod | SpreadProperty>,
};

export type ObjectMethod = {
  ...Node,
  type: "ObjectMethod",
  key: Expression,
  kind: "get" | "set" | "method",
  shorthand: boolean,
  computed: boolean,
  value: Expression,
  decorators?: Decorator[],
  id: Identifier,
  params: LVal[],
  body: BlockStatement,
  generator: boolean,
  async: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type ObjectProperty = {
  ...Node,
  type: "ObjectProperty",
  key: Expression,
  computed: boolean,
  value: Expression,
  decorators?: Decorator[],
  shorthand: boolean,
};

export type RestElement = {
  ...Node,
  type: "RestElement",
  argument: LVal,
  typeAnnotation?: TypeAnnotation,
};

export type ReturnStatement = {
  ...Node,
  type: "ReturnStatement",
  argument: Expression,
};

export type SequenceExpression = {
  ...Node,
  type: "SequenceExpression",
  expressions: Expression[],
};

export type SwitchCase = {
  ...Node,
  type: "SwitchCase",
  test: Expression,
  consequent: Statement[],
};

export type SwitchStatement = {
  ...Node,
  type: "SwitchStatement",
  discriminant: Expression,
  cases: SwitchCase[],
};

export type ThisExpression = { ...Node, type: "ThisExpression" };

export type ThrowStatement = {
  ...Node,
  type: "ThrowStatement",
  argument: Expression,
};

export type TryStatement = {
  ...Node,
  type: "TryStatement",
  block: BlockStatement,
  handler: CatchClause,
  finalizer: BlockStatement,
};

export type UnaryExpression = {
  ...Node,
  type: "UnaryExpression",
  operator: "-" | "+" | "!" | "~" | "typeof" | "void" | "delete",
  prefix: boolean,
  argument: Expression,
};

export type UpdateExpression = {
  ...Node,
  type: "UpdateExpression",
  operator: "++" | "--",
  prefix: boolean,
  argument: Expression,
};

export type VariableDeclaration = {
  ...Node,
  type: "VariableDeclaration",
  declarations: VariableDeclarator[],
  kind: "var" | "let" | "const",
};

export type VariableDeclarator = {
  ...Node,
  type: "VariableDeclarator",
  id: LVal,
  init: Expression,
};

export type WhileStatement = {
  ...Node,
  type: "WhileStatement",
  test: Expression,
  body: Statement,
};

export type WithStatement = {
  ...Node,
  type: "WithStatement",
  object: Expression,
  body: BlockStatement | Statement,
};

export type AssignmentPattern = {
  ...Node,
  type: "AssignmentPattern",
  left: Identifier,
  right: Expression,
};

export type ArrayPattern = {
  ...Node,
  type: "ArrayPattern",
  elements: Expression[],
  typeAnnotation?: TypeAnnotation,
};

export type ArrowFunctionExpression = {
  ...Node,
  type: "ArrowFunctionExpression",
  id: Identifier,
  params: LVal[],
  body: BlockStatement | Expression,
  generator: boolean,
  async: boolean,
  expression: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

export type ClassBody = {
  ...Node,
  type: "ClassBody",
  body: Array<ClassMethod | ClassProperty>,
};

export type ClassDeclaration = {
  ...Node,
  type: "ClassDeclaration",
  id: Identifier,
  superClass: Expression,
  body: ClassBody,
  decorators?: Decorator[],
  implements?: ClassImplements[],
  mixins?: mixed[],
  typeParameters?: TypeParameterDeclaration,
  superTypeParameters?: TypeParameterInstantiation,
};

export type ClassExpression = {
  ...Node,
  type: "ClassExpression",
  id: Identifier,
  superClass: Expression,
  body: ClassBody,
  decorators?: Decorator[],
  implements?: ClassImplements[],
  mixins?: mixed[],
  typeParameters?: TypeParameterDeclaration,
  superTypeParameters?: TypeParameterInstantiation,
};

export type ExportAllDeclaration = {
  ...Node,
  type: "ExportAllDeclaration",
  source: StringLiteral,
};

export type ExportDefaultDeclaration = {
  ...Node,
  type: "ExportDefaultDeclaration",
  declaration: Declaration | Expression,
};

export type ExportNamedDeclaration = {
  ...Node,
  type: "ExportNamedDeclaration",
  declaration: Declaration,
  specifiers: ExportSpecifier[],
  source: StringLiteral | null,
};

export type ExportSpecifier = {
  ...Node,
  type: "ExportSpecifier",
  local: Identifier,
  imported: Identifier,
  exported: Identifier,
};

export type ForOfStatement = {
  ...Node,
  type: "ForOfStatement",
  left: VariableDeclaration | LVal,
  right: Expression,
  body: Statement,
};

export type ImportDeclaration = {
  ...Node,
  type: "ImportDeclaration",
  specifiers: Array<
    ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
  >,
  source: StringLiteral,
};

export type ImportDefaultSpecifier = {
  ...Node,
  type: "ImportDefaultSpecifier",
  local: Identifier,
};

export type ImportNamespaceSpecifier = {
  ...Node,
  type: "ImportNamespaceSpecifier",
  local: Identifier,
};

export type ImportSpecifier = {
  ...Node,
  type: "ImportSpecifier",
  local: Identifier,
  imported: Identifier,
};

export type MetaProperty = {
  ...Node,
  type: "MetaProperty",
  meta: Identifier,
  property: Identifier,
};

export type ClassMethod = {
  ...Node,
  type: "ClassMethod",
  key: Expression,
  value?: FunctionExpression,
  kind: "constructor" | "method" | "get" | "set",
  computed: boolean,
  static: boolean,
  decorators?: Decorator[],
  id: Identifier,
  params: LVal[],
  body: BlockStatement,
  generator: boolean,
  async: boolean,
  expression: boolean,
  returnType?: TypeAnnotation,
  typeParameters?: TypeParameterDeclaration,
};

// See: https://github.com/babel/babel/blob/master/doc/ast/spec.md#objectpattern
export type AssignmentProperty = {
  ...Node,
  type: "ObjectProperty",
  key: Expression,
  computed: boolean,
  value: Pattern,
  decorators?: Decorator[],
  shorthand: boolean,
};

export type ObjectPattern = {
  ...Node,
  type: "ObjectPattern",
  properties: Array<AssignmentProperty | RestProperty>,
  typeAnnotation?: TypeAnnotation,
};

export type SpreadElement = {
  ...Node,
  type: "SpreadElement",
  argument: Expression,
};

export type Super = { ...Node, type: "Super" };

export type TaggedTemplateExpression = {
  ...Node,
  type: "TaggedTemplateExpression",
  tag: Expression,
  quasi: TemplateLiteral,
};

export type TemplateElement = {
  ...Node,
  type: "TemplateElement",
  tail: boolean,
  value: {
    cooked: string,
    raw: string,
  },
};

export type TemplateLiteral = {
  ...Node,
  type: "TemplateLiteral",
  quasis: TemplateElement[],
  expressions: Expression[],
};

export type YieldExpression = {
  ...Node,
  type: "YieldExpression",
  argument: Expression,
  delegate: boolean,
};

export type AnyTypeAnnotation = { ...Node, type: "AnyTypeAnnotation" };

export type ArrayTypeAnnotation = {
  ...Node,
  type: "ArrayTypeAnnotation",
  elementType: FlowTypeAnnotation,
};

export type BooleanTypeAnnotation = { ...Node, type: "BooleanTypeAnnotation" };

export type BooleanLiteralTypeAnnotation = {
  ...Node,
  type: "BooleanLiteralTypeAnnotation",
};

export type NullLiteralTypeAnnotation = {
  ...Node,
  type: "NullLiteralTypeAnnotation",
};

export type ClassImplements = {
  ...Node,
  type: "ClassImplements",
  id: Identifier,
  typeParameters: TypeParameterInstantiation,
};

export type ClassProperty = {
  ...Node,
  type: "ClassProperty",
  key: Identifier,
  value: Expression,
  decorators?: Decorator[],
  typeAnnotation?: TypeAnnotation,
};

export type DeclareClass = {
  ...Node,
  type: "DeclareClass",
  id: Identifier,
  typeParameters: TypeParameterDeclaration,
  extends: InterfaceExtends[],
  body: ObjectTypeAnnotation,
};

export type DeclareFunction = {
  ...Node,
  type: "DeclareFunction",
  id: Identifier,
};

export type DeclareInterface = {
  ...Node,
  type: "DeclareInterface",
  id: Identifier,
  typeParameters: TypeParameterDeclaration,
  extends: InterfaceExtends[],
  body: ObjectTypeAnnotation,
};

export type DeclareModule = {
  ...Node,
  type: "DeclareModule",
  id: StringLiteral | Identifier,
  body: BlockStatement,
};

export type DeclareTypeAlias = {
  ...Node,
  type: "DeclareTypeAlias",
  id: Identifier,
  typeParameters: TypeParameterDeclaration,
  right: FlowTypeAnnotation,
};

export type DeclareVariable = {
  ...Node,
  type: "DeclareVariable",
  id: Identifier,
};

export type ExistentialTypeParam = { ...Node, type: "ExistentialTypeParam" };

export type FunctionTypeAnnotation = {
  ...Node,
  type: "FunctionTypeAnnotation",
  typeParameters: TypeParameterDeclaration,
  params: FunctionTypeParam[],
  rest: FunctionTypeParam,
  returnType: FlowTypeAnnotation,
};

export type FunctionTypeParam = {
  ...Node,
  type: "FunctionTypeParam",
  name: Identifier,
  typeAnnotation: FlowTypeAnnotation,
};

export type GenericTypeAnnotation = {
  ...Node,
  type: "GenericTypeAnnotation",
  id: Identifier,
  typeParameters: TypeParameterInstantiation,
};

export type InterfaceExtends = {
  ...Node,
  type: "InterfaceExtends",
  id: Identifier,
  typeParameters: TypeParameterInstantiation,
};

export type InterfaceDeclaration = {
  ...Node,
  type: "InterfaceDeclaration",
  id: Identifier,
  typeParameters: TypeParameterDeclaration,
  extends: InterfaceExtends[],
  mixins?: mixed[],
  body: ObjectTypeAnnotation,
};

export type IntersectionTypeAnnotation = {
  ...Node,
  type: "IntersectionTypeAnnotation",
  types: FlowTypeAnnotation[],
};

export type MixedTypeAnnotation = { ...Node, type: "MixedTypeAnnotation" };

export type NullableTypeAnnotation = {
  ...Node,
  type: "NullableTypeAnnotation",
  typeAnnotation: FlowTypeAnnotation,
};

export type NumericLiteralTypeAnnotation = {
  ...Node,
  type: "NumericLiteralTypeAnnotation",
};

export type NumberTypeAnnotation = { ...Node, type: "NumberTypeAnnotation" };

export type StringLiteralTypeAnnotation = {
  ...Node,
  type: "StringLiteralTypeAnnotation",
};

export type StringTypeAnnotation = { ...Node, type: "StringTypeAnnotation" };

export type ThisTypeAnnotation = { ...Node, type: "ThisTypeAnnotation" };

export type TupleTypeAnnotation = {
  ...Node,
  type: "TupleTypeAnnotation",
  types: FlowTypeAnnotation[],
};

export type TypeofTypeAnnotation = {
  ...Node,
  type: "TypeofTypeAnnotation",
  argument: FlowTypeAnnotation,
};

export type TypeAlias = {
  ...Node,
  type: "TypeAlias",
  id: Identifier,
  typeParameters: TypeParameterDeclaration,
  right: FlowTypeAnnotation,
};

export type TypeAnnotation = {
  ...Node,
  type: "TypeAnnotation",
  typeAnnotation: FlowTypeAnnotation,
};

export type TypeCastExpression = {
  ...Node,
  type: "TypeCastExpression",
  expression: Expression,
  typeAnnotation: FlowTypeAnnotation,
};

export type TypeParameter = {
  ...Node,
  type: "TypeParameterDeclaration",
  bound: TypeAnnotation | null,
  default: Flow | null,
  name: string | null,
};

export type TypeParameterDeclaration = {
  ...Node,
  type: "TypeParameterDeclaration",
  params: Identifier[],
};

export type TypeParameterInstantiation = {
  ...Node,
  type: "TypeParameterInstantiation",
  params: FlowTypeAnnotation[],
};

export type ObjectTypeAnnotation = {
  ...Node,
  type: "ObjectTypeAnnotation",
  properties: ObjectTypeProperty[],
  indexers: ObjectTypeIndexer[],
  callProperties: ObjectTypeCallProperty[],
};

export type ObjectTypeCallProperty = {
  ...Node,
  type: "ObjectTypeCallProperty",
  value: FlowTypeAnnotation,
};

export type ObjectTypeIndexer = {
  ...Node,
  type: "ObjectTypeIndexer",
  id: Expression,
  key: FlowTypeAnnotation,
  value: FlowTypeAnnotation,
};

export type ObjectTypeProperty = {
  ...Node,
  type: "ObjectTypeProperty",
  key: Expression,
  value: FlowTypeAnnotation,
};

export type QualifiedTypeIdentifier = {
  ...Node,
  type: "QualifiedTypeIdentifier",
  id: Identifier,
  qualification: Identifier | QualifiedTypeIdentifier,
};

export type UnionTypeAnnotation = {
  ...Node,
  type: "UnionTypeAnnotation",
  types: FlowTypeAnnotation[],
};

export type VoidTypeAnnotation = { ...Node, type: "VoidTypeAnnotation" };

export type JSXAttribute = {
  ...Node,
  type: "JSXAttribute",
  name: JSXIdentifier | JSXNamespacedName,
  value: JSXElement | StringLiteral | JSXExpressionContainer | null,
};

export type JSXClosingElement = {
  ...Node,
  type: "JSXClosingElement",
  name: JSXIdentifier | JSXMemberExpression,
};

export type JSXElement = {
  ...Node,
  type: "JSXElement",
  openingElement: JSXOpeningElement,
  closingElement: JSXClosingElement,
  children: Array<JSXElement | JSXExpressionContainer | JSXText>,
  selfClosing?: boolean,
};

export type JSXEmptyExpression = { ...Node, type: "JSXEmptyExpression" };

export type JSXExpressionContainer = {
  ...Node,
  type: "JSXExpressionContainer",
  expression: Expression,
};

export type JSXIdentifier = { ...Node, type: "JSXIdentifier", name: string };

export type JSXMemberExpression = {
  ...Node,
  type: "JSXMemberExpression",
  object: JSXMemberExpression | JSXIdentifier,
  property: JSXIdentifier,
};

export type JSXNamespacedName = {
  ...Node,
  type: "JSXNamespacedName",
  namespace: JSXIdentifier,
  name: JSXIdentifier,
};

export type JSXOpeningElement = {
  ...Node,
  type: "JSXOpeningElement",
  name: JSXIdentifier | JSXMemberExpression,
  selfClosing: boolean,
  attributes: JSXAttribute[],
};

export type JSXSpreadAttribute = {
  ...Node,
  type: "JSXSpreadAttribute",
  argument: Expression,
};

export type JSXText = { ...Node, type: "JSXText", value: string };

export type Noop = { ...Node, type: "Noop" };

export type ParenthesizedExpression = {
  ...Node,
  type: "ParenthesizedExpression",
  expression: Expression,
};

export type AwaitExpression = {
  ...Node,
  type: "AwaitExpression",
  argument: Expression,
};

export type BindExpression = {
  ...Node,
  type: "BindExpression",
  object: Expression,
  callee: Expression,
};

export type Decorator = { ...Node, type: "Decorator", expression: Expression };

export type DoExpression = {
  ...Node,
  type: "DoExpression",
  body: BlockStatement,
};

export type ExportDefaultSpecifier = {
  ...Node,
  type: "ExportDefaultSpecifier",
  exported: Identifier,
};

export type ExportNamespaceSpecifier = {
  ...Node,
  type: "ExportNamespaceSpecifier",
  exported: Identifier,
};

export type RestProperty = { ...Node, type: "RestProperty", argument: LVal };

export type SpreadProperty = {
  ...Node,
  type: "SpreadProperty",
  argument: Expression,
};

export type TSAnyKeyword = { ...Node, type: "TSAnyKeyword" };

export type TSArrayType = { ...Node, type: "TSArrayType", elementType: TSType };

export type TSAsExpression = {
  ...Node,
  type: "TSAsExpression",
  expression: Expression,
  typeAnnotation: TSType,
};

export type TSBooleanKeyword = { ...Node, type: "TSBooleanKeyword" };

export type TSCallSignatureDeclaration = {
  ...Node,
  type: "TSCallSignatureDeclaration",
  typeParameters: TypeParameterDeclaration | null,
  parameters: Array<Identifier | RestElement> | null,
  typeAnnotation: TSTypeAnnotation | null,
};

export type TSConstructSignatureDeclaration = {
  ...Node,
  type: "TSConstructSignatureDeclaration",
  typeParameters: TypeParameterDeclaration | null,
  parameters: Array<Identifier | RestElement> | null,
  typeAnnotation: TSTypeAnnotation | null,
};

export type TSConstructorType = {
  ...Node,
  type: "TSConstructorType",
  typeParameters: TypeParameterDeclaration | null,
  typeAnnotation: TSTypeAnnotation | null,
  parameters: Array<Identifier | RestElement> | null,
};

export type TSDeclareFunction = {
  ...Node,
  type: "TSDeclareFunction",
  id: Identifier | null,
  typeParameters: TypeParameterDeclaration | Noop | null,
  params: LVal[],
  returnType: TypeAnnotation | TSTypeAnnotation | Noop | null,
  async: boolean,
  declare: boolean | null,
  generator: boolean,
};

export type TSDeclareMethod = {
  ...Node,
  type: "TSDeclareMethod",
  decorators: Decorator[] | null,
  key: Expression,
  typeParameters: TypeParameterDeclaration | Noop | null,
  params: LVal[],
  returnType: TypeAnnotation | TSTypeAnnotation | Noop | null,
  abstract: boolean | null,
  access: "public" | "private" | "protected" | null,
  accessibility: "public" | "private" | "protected" | null,
  async: boolean,
  computed: boolean,
  generator: boolean,
  kind: "get" | "set" | "method" | "constructor",
  optional: boolean | null,
  static: boolean | null,
};

export type TSEnumDeclaration = {
  ...Node,
  type: "TSEnumDeclaration",
  id: Identifier,
  members: TSEnumMember[],
  const: boolean | null,
  declare: boolean | null,
  initializer: Expression | null,
};

export type TSEnumMember = {
  ...Node,
  type: "TSEnumMember",
  id: Identifier | StringLiteral,
  initializer: Expression | null,
};

export type TSExportAssignment = {
  ...Node,
  type: "TSExportAssignment",
  expression: Expression,
};

export type TSExpressionWithTypeArguments = {
  ...Node,
  type: "TSExpressionWithTypeArguments",
  expression: TSEntityName,
  typeParameters: TypeParameterInstantiation | null,
};

export type TSExternalModuleReference = {
  ...Node,
  type: "TSExternalModuleReference",
  expression: StringLiteral,
};

export type TSFunctionType = {
  ...Node,
  type: "TSFunctionType",
  typeParameters: TypeParameterDeclaration | null,
  typeAnnotation: TSTypeAnnotation | null,
  parameters: Array<Identifier | RestElement> | null,
};

export type TSImportEqualsDeclaration = {
  ...Node,
  type: "TSImportEqualsDeclaration",
  id: Identifier,
  moduleReference: TSEntityName | TSExternalModuleReference,
  isExport: boolean | null,
};

export type TSIndexSignature = {
  ...Node,
  type: "TSIndexSignature",
  parameters: Identifier[],
  typeAnnotation: TSTypeAnnotation | null,
  readonly: boolean | null,
};

export type TSIndexedAccessType = {
  ...Node,
  type: "TSIndexedAccessType",
  objectType: TSType,
  indexType: TSType,
};

export type TSInterfaceBody = {
  ...Node,
  type: "TSInterfaceBody",
  body: TSTypeElement[],
};

export type TSInterfaceDeclaration = {
  ...Node,
  type: "TSInterfaceDeclaration",
  id: Identifier,
  typeParameters: TypeParameterDeclaration | null,
  extends: TSExpressionWithTypeArguments[] | null,
  body: TSInterfaceBody,
  declare: boolean | null,
};

export type TSIntersectionType = {
  ...Node,
  type: "TSIntersectionType",
  types: TSType[],
};

export type TSLiteralType = {
  ...Node,
  type: "TSLiteralType",
  literal: NumericLiteral | StringLiteral | BooleanLiteral,
};

export type TSMappedType = {
  ...Node,
  type: "TSMappedType",
  typeParameter: TypeParameter,
  typeAnnotation: TSType | null,
  optional: boolean | null,
  readonly: boolean | null,
};

export type TSMethodSignature = {
  ...Node,
  type: "TSMethodSignature",
  key: Expression,
  typeParameters: TypeParameterDeclaration | null,
  parameters: Array<Identifier | RestElement> | null,
  typeAnnotation: TSTypeAnnotation | null,
  computed: boolean | null,
  optional: boolean | null,
};

export type TSModuleBlock = {
  ...Node,
  type: "TSModuleBlock",
  body: Statement[],
};

export type TSModuleDeclaration = {
  ...Node,
  type: "TSModuleDeclaration",
  id: Identifier | StringLiteral,
  body: TSModuleBlock | TSModuleDeclaration,
  declare: boolean | null,
  global: boolean | null,
};

export type TSNamespaceExportDeclaration = {
  ...Node,
  type: "TSNamespaceExportDeclaration",
  id: Identifier,
};

export type TSNeverKeyword = { ...Node, type: "TSNeverKeyword" };

export type TSNonNullExpression = {
  ...Node,
  type: "TSNonNullExpression",
  expression: Expression,
};

export type TSNullKeyword = { ...Node, type: "TSNullKeyword" };

export type TSNumberKeyword = { ...Node, type: "TSNumberKeyword" };

export type TSObjectKeyword = { ...Node, type: "TSObjectKeyword" };

export type TSParameterProperty = {
  ...Node,
  type: "TSParameterProperty",
  parameter: Identifier | AssignmentPattern,
  accessibility: "public" | "private" | "protected" | null,
  readonly: boolean | null,
};

export type TSParenthesizedType = {
  ...Node,
  type: "TSParenthesizedType",
  typeAnnotation: TSType,
};

export type TSPropertySignature = {
  ...Node,
  type: "TSPropertySignature",
  key: Expression,
  typeAnnotation: TSTypeAnnotation | null,
  initializer: Expression | null,
  computed: boolean | null,
  optional: boolean | null,
  readonly: boolean | null,
};

export type TSQualifiedName = {
  ...Node,
  type: "TSQualifiedName",
  left: TSEntityName,
  right: Identifier,
};

export type TSStringKeyword = { ...Node, type: "TSStringKeyword" };

export type TSSymbolKeyword = { ...Node, type: "TSSymbolKeyword" };

export type TSThisType = { ...Node, type: "TSThisType" };

export type TSTupleType = {
  ...Node,
  type: "TSTupleType",
  elementTypes: TSType[],
};

export type TSTypeAliasDeclaration = {
  ...Node,
  type: "TSTypeAliasDeclaration",
  id: Identifier,
  typeParameters: TypeParameterDeclaration | null,
  typeAnnotation: TSType,
  declare: boolean | null,
};

export type TSTypeAnnotation = {
  ...Node,
  type: "TSTypeAnnotation",
  typeAnnotation: TSType,
};

export type TSTypeAssertion = {
  ...Node,
  type: "TSTypeAssertion",
  typeAnnotation: TSType,
  expression: Expression,
};

export type TSTypeLiteral = {
  ...Node,
  type: "TSTypeLiteral",
  members: TSTypeElement[],
};

export type TSTypeOperator = {
  ...Node,
  type: "TSTypeOperator",
  typeAnnotation: TSType,
  operator: string | null,
};

export type TSTypeParameter = {
  ...Node,
  type: "TSTypeParameter",
  constraint: TSType | null,
  default: TSType | null,
  name: string | null,
};

export type TSTypeParameterDeclaration = {
  ...Node,
  type: "TSTypeParameterDeclaration",
  params: TSTypeParameter[],
};

export type TSTypeParameterInstantiation = {
  ...Node,
  type: "TSTypeParameterInstantiation",
  params: TSType[],
};

export type TSTypePredicate = {
  ...Node,
  type: "TSTypePredicate",
  parameterName: Identifier | TSThisType,
  typeAnnotation: TSTypeAnnotation,
};

export type TSTypeQuery = {
  ...Node,
  type: "TSTypeQuery",
  exprName: TSEntityName,
};

export type TSTypeReference = {
  ...Node,
  type: "TSTypeReference",
  typeName: TSEntityName,
  typeParameters: TypeParameterInstantiation | null,
};

export type TSUndefinedKeyword = { ...Node, type: "TSUndefinedKeyword" };

export type TSUnionType = { ...Node, type: "TSUnionType", types: TSType[] };

export type TSVoidKeyword = { ...Node, type: "TSVoidKeyword" };

export type Expression =
  | ArrayExpression
  | AssignmentExpression
  | BinaryExpression
  | CallExpression
  | ConditionalExpression
  | FunctionExpression
  | Identifier
  | StringLiteral
  | NumericLiteral
  | BooleanLiteral
  | NullLiteral
  | RegExpLiteral
  | LogicalExpression
  | MemberExpression
  | NewExpression
  | ObjectExpression
  | SequenceExpression
  | ThisExpression
  | UnaryExpression
  | UpdateExpression
  | ArrowFunctionExpression
  | ClassExpression
  | MetaProperty
  | Super
  | TaggedTemplateExpression
  | TemplateLiteral
  | YieldExpression
  | TypeCastExpression
  | JSXElement
  | JSXEmptyExpression
  | JSXIdentifier
  | JSXMemberExpression
  | ParenthesizedExpression
  | AwaitExpression
  | BindExpression
  | DoExpression
  | TSAsExpression
  | TSNonNullExpression
  | TSTypeAssertion;

export type Binary = BinaryExpression | LogicalExpression;

export type Scopable =
  | BlockStatement
  | CatchClause
  | DoWhileStatement
  | ForInStatement
  | ForStatement
  | FunctionDeclaration
  | FunctionExpression
  | Program
  | ObjectMethod
  | SwitchStatement
  | WhileStatement
  | ArrowFunctionExpression
  | ClassDeclaration
  | ClassExpression
  | ForOfStatement
  | ClassMethod;

export type BlockParent =
  | BlockStatement
  | DoWhileStatement
  | ForInStatement
  | ForStatement
  | FunctionDeclaration
  | FunctionExpression
  | Program
  | ObjectMethod
  | SwitchStatement
  | WhileStatement
  | ArrowFunctionExpression
  | ForOfStatement
  | ClassMethod;

export type Block = BlockStatement | Program;

export type Statement =
  | BlockStatement
  | BreakStatement
  | ContinueStatement
  | DebuggerStatement
  | DoWhileStatement
  | EmptyStatement
  | ExpressionStatement
  | ForInStatement
  | ForStatement
  | FunctionDeclaration
  | IfStatement
  | LabeledStatement
  | ReturnStatement
  | SwitchStatement
  | ThrowStatement
  | TryStatement
  | VariableDeclaration
  | WhileStatement
  | WithStatement
  | ClassDeclaration
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ForOfStatement
  | ImportDeclaration
  | DeclareClass
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareTypeAlias
  | DeclareVariable
  | InterfaceDeclaration
  | TypeAlias
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSExportAssignment
  | TSImportEqualsDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSNamespaceExportDeclaration
  | TSTypeAliasDeclaration;

export type Terminatorless =
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | ThrowStatement
  | YieldExpression
  | AwaitExpression;
export type CompletionStatement =
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | ThrowStatement;
export type Conditional = ConditionalExpression | IfStatement;
export type Loop =
  | DoWhileStatement
  | ForInStatement
  | ForStatement
  | WhileStatement
  | ForOfStatement;
export type While = DoWhileStatement | WhileStatement;
export type ExpressionWrapper =
  | ExpressionStatement
  | TypeCastExpression
  | ParenthesizedExpression;
export type For = ForInStatement | ForStatement | ForOfStatement;
export type ForXStatement = ForInStatement | ForOfStatement;
export type Function =
  | FunctionDeclaration
  | FunctionExpression
  | ObjectMethod
  | ArrowFunctionExpression
  | ClassMethod;
export type FunctionParent =
  | FunctionDeclaration
  | FunctionExpression
  | Program
  | ObjectMethod
  | ArrowFunctionExpression
  | ClassMethod;
export type Pureish =
  | FunctionDeclaration
  | FunctionExpression
  | StringLiteral
  | NumericLiteral
  | BooleanLiteral
  | NullLiteral
  | ArrowFunctionExpression
  | ClassDeclaration
  | ClassExpression;

export type Declaration =
  | FunctionDeclaration
  | VariableDeclaration
  | ClassDeclaration
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ImportDeclaration
  | DeclareClass
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareTypeAlias
  | DeclareVariable
  | InterfaceDeclaration
  | TypeAlias
  | TSDeclareFunction
  | TSEnumDeclaration
  | TSInterfaceDeclaration
  | TSModuleDeclaration
  | TSTypeAliasDeclaration;

export type LVal =
  | Identifier
  | MemberExpression
  | RestElement
  | AssignmentPattern
  | ArrayPattern
  | ObjectPattern
  | TSParameterProperty;
export type Literal =
  | StringLiteral
  | NumericLiteral
  | BooleanLiteral
  | NullLiteral
  | RegExpLiteral
  | TemplateLiteral;
export type Immutable =
  | StringLiteral
  | NumericLiteral
  | BooleanLiteral
  | NullLiteral
  | JSXAttribute
  | JSXClosingElement
  | JSXElement
  | JSXExpressionContainer
  | JSXOpeningElement;
export type UserWhitespacable =
  | ObjectMethod
  | ObjectProperty
  | ObjectTypeCallProperty
  | ObjectTypeIndexer
  | ObjectTypeProperty;
export type Method = ObjectMethod | ClassMethod;
export type ObjectMember = ObjectMethod | ObjectProperty;
export type Property = ObjectProperty | ClassProperty;
export type UnaryLike =
  | UnaryExpression
  | SpreadElement
  | RestProperty
  | SpreadProperty;
export type Pattern = AssignmentPattern | ArrayPattern | ObjectPattern;
export type Class = ClassDeclaration | ClassExpression;
export type ModuleDeclaration =
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration
  | ImportDeclaration;
export type ExportDeclaration =
  | ExportAllDeclaration
  | ExportDefaultDeclaration
  | ExportNamedDeclaration;
export type ModuleSpecifier =
  | ExportSpecifier
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportSpecifier
  | ExportDefaultSpecifier
  | ExportNamespaceSpecifier;

export type Flow =
  | AnyTypeAnnotation
  | ArrayTypeAnnotation
  | BooleanTypeAnnotation
  | BooleanLiteralTypeAnnotation
  | ClassImplements
  | ClassProperty
  | DeclareClass
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareTypeAlias
  | DeclareVariable
  | ExistentialTypeParam
  | FunctionTypeAnnotation
  | FunctionTypeParam
  | GenericTypeAnnotation
  | InterfaceExtends
  | InterfaceDeclaration
  | IntersectionTypeAnnotation
  | MixedTypeAnnotation
  | NullableTypeAnnotation
  | NumericLiteralTypeAnnotation
  | NumberTypeAnnotation
  | StringLiteralTypeAnnotation
  | StringTypeAnnotation
  | ThisTypeAnnotation
  | TupleTypeAnnotation
  | TypeofTypeAnnotation
  | TypeAlias
  | TypeAnnotation
  | TypeCastExpression
  | TypeParameterDeclaration
  | TypeParameterInstantiation
  | ObjectTypeAnnotation
  | ObjectTypeCallProperty
  | ObjectTypeIndexer
  | ObjectTypeProperty
  | QualifiedTypeIdentifier
  | UnionTypeAnnotation
  | VoidTypeAnnotation;

export type FlowTypeAnnotation =
  | AnyTypeAnnotation
  | ArrayTypeAnnotation
  | BooleanTypeAnnotation
  | BooleanLiteralTypeAnnotation
  | FunctionTypeAnnotation
  | GenericTypeAnnotation
  | IntersectionTypeAnnotation
  | MixedTypeAnnotation
  | NullableTypeAnnotation
  | NumericLiteralTypeAnnotation
  | NumberTypeAnnotation
  | StringLiteralTypeAnnotation
  | StringTypeAnnotation
  | ThisTypeAnnotation
  | TupleTypeAnnotation
  | TypeofTypeAnnotation
  | TypeAnnotation
  | ObjectTypeAnnotation
  | UnionTypeAnnotation
  | VoidTypeAnnotation;

export type FlowBaseAnnotation =
  | AnyTypeAnnotation
  | BooleanTypeAnnotation
  | MixedTypeAnnotation
  | NumberTypeAnnotation
  | StringTypeAnnotation
  | ThisTypeAnnotation
  | VoidTypeAnnotation;
export type FlowDeclaration =
  | DeclareClass
  | DeclareFunction
  | DeclareInterface
  | DeclareModule
  | DeclareTypeAlias
  | DeclareVariable
  | InterfaceDeclaration
  | TypeAlias;

export type JSX =
  | JSXAttribute
  | JSXClosingElement
  | JSXElement
  | JSXEmptyExpression
  | JSXExpressionContainer
  | JSXIdentifier
  | JSXMemberExpression
  | JSXNamespacedName
  | JSXOpeningElement
  | JSXSpreadAttribute
  | JSXText;

export type TSType =
  | TSAnyKeyword
  | TSArrayType
  | TSBooleanKeyword
  | TSConstructorType
  | TSExpressionWithTypeArguments
  | TSFunctionType
  | TSIndexedAccessType
  | TSIntersectionType
  | TSLiteralType
  | TSMappedType
  | TSNeverKeyword
  | TSNullKeyword
  | TSNumberKeyword
  | TSObjectKeyword
  | TSParenthesizedType
  | TSStringKeyword
  | TSSymbolKeyword
  | TSThisType
  | TSTupleType
  | TSTypeLiteral
  | TSTypeOperator
  | TSTypePredicate
  | TSTypeQuery
  | TSTypeReference
  | TSUndefinedKeyword
  | TSUnionType
  | TSVoidKeyword;

export type TSEntityName = Identifier | TSQualifiedName;

export type TSTypeElement =
  | TSCallSignatureDeclaration
  | TSConstructSignatureDeclaration
  | TSIndexSignature
  | TSMethodSignature
  | TSPropertySignature;
