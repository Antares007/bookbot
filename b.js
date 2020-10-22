// @flow strict
declare class BabelNodeComment {
  value: string;
  start: number;
  end: number;
  loc: BabelNodeSourceLocation;
}

declare class BabelNodeCommentBlock extends BabelNodeComment {
  type: "CommentBlock";
}

declare class BabelNodeCommentLine extends BabelNodeComment {
  type: "CommentLine";
}

declare class BabelNodeSourceLocation {
  start: {
    line: number;
    column: number;
  };

  end: {
    line: number;
    column: number;
  };
}

declare class BabelNode {
  leadingComments?: Array<BabelNodeComment>;
  innerComments?: Array<BabelNodeComment>;
  trailingComments?: Array<BabelNodeComment>;
  start: ?number;
  end: ?number;
  loc: ?BabelNodeSourceLocation;
  extra?: { [string]: mixed };
}

declare class BabelNodeArrayExpression extends BabelNode {
  type: "ArrayExpression";
  elements?: Array<null | BabelNodeExpression | BabelNodeSpreadElement>;
}

declare class BabelNodeAssignmentExpression extends BabelNode {
  type: "AssignmentExpression";
  operator: string;
  left: BabelNodeLVal;
  right: BabelNodeExpression;
}

declare class BabelNodeBinaryExpression extends BabelNode {
  type: "BinaryExpression";
  operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=";
  left: BabelNodeExpression | BabelNodePrivateName;
  right: BabelNodeExpression;
}

declare class BabelNodeInterpreterDirective extends BabelNode {
  type: "InterpreterDirective";
  value: string;
}

declare class BabelNodeDirective extends BabelNode {
  type: "Directive";
  value: BabelNodeDirectiveLiteral;
}

declare class BabelNodeDirectiveLiteral extends BabelNode {
  type: "DirectiveLiteral";
  value: string;
}

declare class BabelNodeBlockStatement extends BabelNode {
  type: "BlockStatement";
  body: Array<BabelNodeStatement>;
  directives?: Array<BabelNodeDirective>;
}

declare class BabelNodeBreakStatement extends BabelNode {
  type: "BreakStatement";
  label?: BabelNodeIdentifier;
}

declare class BabelNodeCallExpression extends BabelNode {
  type: "CallExpression";
  callee: BabelNodeExpression | BabelNodeV8IntrinsicIdentifier;
  arguments: Array<BabelNodeExpression | BabelNodeSpreadElement | BabelNodeJSXNamespacedName | BabelNodeArgumentPlaceholder>;
  optional?: true | false;
  typeArguments?: BabelNodeTypeParameterInstantiation;
  typeParameters?: BabelNodeTSTypeParameterInstantiation;
}

declare class BabelNodeCatchClause extends BabelNode {
  type: "CatchClause";
  param?: BabelNodeIdentifier | BabelNodeArrayPattern | BabelNodeObjectPattern;
  body: BabelNodeBlockStatement;
}

declare class BabelNodeConditionalExpression extends BabelNode {
  type: "ConditionalExpression";
  test: BabelNodeExpression;
  consequent: BabelNodeExpression;
  alternate: BabelNodeExpression;
}

declare class BabelNodeContinueStatement extends BabelNode {
  type: "ContinueStatement";
  label?: BabelNodeIdentifier;
}

declare class BabelNodeDebuggerStatement extends BabelNode {
  type: "DebuggerStatement";
}

declare class BabelNodeDoWhileStatement extends BabelNode {
  type: "DoWhileStatement";
  test: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeEmptyStatement extends BabelNode {
  type: "EmptyStatement";
}

declare class BabelNodeExpressionStatement extends BabelNode {
  type: "ExpressionStatement";
  expression: BabelNodeExpression;
}

declare class BabelNodeFile extends BabelNode {
  type: "File";
  program: BabelNodeProgram;
  comments?: Array<BabelNodeCommentBlock | BabelNodeCommentLine>;
  tokens?: Array<mixed>;
}

declare class BabelNodeForInStatement extends BabelNode {
  type: "ForInStatement";
  left: BabelNodeVariableDeclaration | BabelNodeLVal;
  right: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeForStatement extends BabelNode {
  type: "ForStatement";
  init?: BabelNodeVariableDeclaration | BabelNodeExpression;
  test?: BabelNodeExpression;
  update?: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeFunctionDeclaration extends BabelNode {
  type: "FunctionDeclaration";
  id?: BabelNodeIdentifier;
  params: Array<BabelNodeIdentifier | BabelNodePattern | BabelNodeRestElement | BabelNodeTSParameterProperty>;
  body: BabelNodeBlockStatement;
  generator?: boolean;
  async?: boolean;
  declare?: boolean;
  returnType?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
  typeParameters?: BabelNodeTypeParameterDeclaration | BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
}

declare class BabelNodeFunctionExpression extends BabelNode {
  type: "FunctionExpression";
  id?: BabelNodeIdentifier;
  params: Array<BabelNodeIdentifier | BabelNodePattern | BabelNodeRestElement | BabelNodeTSParameterProperty>;
  body: BabelNodeBlockStatement;
  generator?: boolean;
  async?: boolean;
  returnType?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
  typeParameters?: BabelNodeTypeParameterDeclaration | BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
}

declare class BabelNodeIdentifier extends BabelNode {
  type: "Identifier";
  name: string;
  decorators?: Array<BabelNodeDecorator>;
  optional?: boolean;
  typeAnnotation?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
}

declare class BabelNodeIfStatement extends BabelNode {
  type: "IfStatement";
  test: BabelNodeExpression;
  consequent: BabelNodeStatement;
  alternate?: BabelNodeStatement;
}

declare class BabelNodeLabeledStatement extends BabelNode {
  type: "LabeledStatement";
  label: BabelNodeIdentifier;
  body: BabelNodeStatement;
}

declare class BabelNodeStringLiteral extends BabelNode {
  type: "StringLiteral";
  value: string;
}

declare class BabelNodeNumericLiteral extends BabelNode {
  type: "NumericLiteral";
  value: number;
}

declare class BabelNodeNullLiteral extends BabelNode {
  type: "NullLiteral";
}

declare class BabelNodeBooleanLiteral extends BabelNode {
  type: "BooleanLiteral";
  value: boolean;
}

declare class BabelNodeRegExpLiteral extends BabelNode {
  type: "RegExpLiteral";
  pattern: string;
  flags?: string;
}

declare class BabelNodeLogicalExpression extends BabelNode {
  type: "LogicalExpression";
  operator: "||" | "&&" | "??";
  left: BabelNodeExpression;
  right: BabelNodeExpression;
}

declare class BabelNodeMemberExpression extends BabelNode {
  type: "MemberExpression";
  object: BabelNodeExpression;
  property: BabelNodeExpression | BabelNodeIdentifier | BabelNodePrivateName;
  computed?: boolean;
  optional?: true | false;
}

declare class BabelNodeNewExpression extends BabelNode {
  type: "NewExpression";
  callee: BabelNodeExpression | BabelNodeV8IntrinsicIdentifier;
  arguments: Array<BabelNodeExpression | BabelNodeSpreadElement | BabelNodeJSXNamespacedName | BabelNodeArgumentPlaceholder>;
  optional?: true | false;
  typeArguments?: BabelNodeTypeParameterInstantiation;
  typeParameters?: BabelNodeTSTypeParameterInstantiation;
}

declare class BabelNodeProgram extends BabelNode {
  type: "Program";
  body: Array<BabelNodeStatement>;
  directives?: Array<BabelNodeDirective>;
  sourceType?: "script" | "module";
  interpreter?: BabelNodeInterpreterDirective;
  sourceFile: string;
}

declare class BabelNodeObjectExpression extends BabelNode {
  type: "ObjectExpression";
  properties: Array<BabelNodeObjectMethod | BabelNodeObjectProperty | BabelNodeSpreadElement>;
}

declare class BabelNodeObjectMethod extends BabelNode {
  type: "ObjectMethod";
  kind?: "method" | "get" | "set";
  key: BabelNodeExpression | BabelNodeIdentifier | BabelNodeStringLiteral | BabelNodeNumericLiteral;
  params: Array<BabelNodeIdentifier | BabelNodePattern | BabelNodeRestElement | BabelNodeTSParameterProperty>;
  body: BabelNodeBlockStatement;
  computed?: boolean;
  generator?: boolean;
  async?: boolean;
  decorators?: Array<BabelNodeDecorator>;
  returnType?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
  typeParameters?: BabelNodeTypeParameterDeclaration | BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
}

declare class BabelNodeObjectProperty extends BabelNode {
  type: "ObjectProperty";
  key: BabelNodeExpression | BabelNodeIdentifier | BabelNodeStringLiteral | BabelNodeNumericLiteral;
  value: BabelNodeExpression | BabelNodePatternLike;
  computed?: boolean;
  shorthand?: boolean;
  decorators?: Array<BabelNodeDecorator>;
}

declare class BabelNodeRestElement extends BabelNode {
  type: "RestElement";
  argument: BabelNodeLVal;
  decorators?: Array<BabelNodeDecorator>;
  typeAnnotation?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
}

declare class BabelNodeReturnStatement extends BabelNode {
  type: "ReturnStatement";
  argument?: BabelNodeExpression;
}

declare class BabelNodeSequenceExpression extends BabelNode {
  type: "SequenceExpression";
  expressions: Array<BabelNodeExpression>;
}

declare class BabelNodeParenthesizedExpression extends BabelNode {
  type: "ParenthesizedExpression";
  expression: BabelNodeExpression;
}

declare class BabelNodeSwitchCase extends BabelNode {
  type: "SwitchCase";
  test?: BabelNodeExpression;
  consequent: Array<BabelNodeStatement>;
}

declare class BabelNodeSwitchStatement extends BabelNode {
  type: "SwitchStatement";
  discriminant: BabelNodeExpression;
  cases: Array<BabelNodeSwitchCase>;
}

declare class BabelNodeThisExpression extends BabelNode {
  type: "ThisExpression";
}

declare class BabelNodeThrowStatement extends BabelNode {
  type: "ThrowStatement";
  argument: BabelNodeExpression;
}

declare class BabelNodeTryStatement extends BabelNode {
  type: "TryStatement";
  block: BabelNodeBlockStatement;
  handler?: BabelNodeCatchClause;
  finalizer?: BabelNodeBlockStatement;
}

declare class BabelNodeUnaryExpression extends BabelNode {
  type: "UnaryExpression";
  operator: "void" | "throw" | "delete" | "!" | "+" | "-" | "~" | "typeof";
  argument: BabelNodeExpression;
  prefix?: boolean;
}

declare class BabelNodeUpdateExpression extends BabelNode {
  type: "UpdateExpression";
  operator: "++" | "--";
  argument: BabelNodeExpression;
  prefix?: boolean;
}

declare class BabelNodeVariableDeclaration extends BabelNode {
  type: "VariableDeclaration";
  kind: "var" | "let" | "const";
  declarations: Array<BabelNodeVariableDeclarator>;
  declare?: boolean;
}

declare class BabelNodeVariableDeclarator extends BabelNode {
  type: "VariableDeclarator";
  id: BabelNodeLVal;
  init?: BabelNodeExpression;
  definite?: boolean;
}

declare class BabelNodeWhileStatement extends BabelNode {
  type: "WhileStatement";
  test: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeWithStatement extends BabelNode {
  type: "WithStatement";
  object: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeAssignmentPattern extends BabelNode {
  type: "AssignmentPattern";
  left: BabelNodeIdentifier | BabelNodeObjectPattern | BabelNodeArrayPattern | BabelNodeMemberExpression;
  right: BabelNodeExpression;
  decorators?: Array<BabelNodeDecorator>;
  typeAnnotation?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
}

declare class BabelNodeArrayPattern extends BabelNode {
  type: "ArrayPattern";
  elements: Array<null | BabelNodePatternLike>;
  decorators?: Array<BabelNodeDecorator>;
  typeAnnotation?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
}

declare class BabelNodeArrowFunctionExpression extends BabelNode {
  type: "ArrowFunctionExpression";
  params: Array<BabelNodeIdentifier | BabelNodePattern | BabelNodeRestElement | BabelNodeTSParameterProperty>;
  body: BabelNodeBlockStatement | BabelNodeExpression;
  async?: boolean;
  expression: boolean;
  generator?: boolean;
  returnType?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
  typeParameters?: BabelNodeTypeParameterDeclaration | BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
}

declare class BabelNodeClassBody extends BabelNode {
  type: "ClassBody";
  body: Array<BabelNodeClassMethod | BabelNodeClassPrivateMethod | BabelNodeClassProperty | BabelNodeClassPrivateProperty | BabelNodeTSDeclareMethod | BabelNodeTSIndexSignature>;
}

declare class BabelNodeClassExpression extends BabelNode {
  type: "ClassExpression";
  id?: BabelNodeIdentifier;
  superClass?: BabelNodeExpression;
  body: BabelNodeClassBody;
  decorators?: Array<BabelNodeDecorator>;
  mixins?: BabelNodeInterfaceExtends;
  superTypeParameters?: BabelNodeTypeParameterInstantiation | BabelNodeTSTypeParameterInstantiation;
  typeParameters?: BabelNodeTypeParameterDeclaration | BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
}

declare class BabelNodeClassDeclaration extends BabelNode {
  type: "ClassDeclaration";
  id: BabelNodeIdentifier;
  superClass?: BabelNodeExpression;
  body: BabelNodeClassBody;
  decorators?: Array<BabelNodeDecorator>;
  abstract?: boolean;
  declare?: boolean;
  mixins?: BabelNodeInterfaceExtends;
  superTypeParameters?: BabelNodeTypeParameterInstantiation | BabelNodeTSTypeParameterInstantiation;
  typeParameters?: BabelNodeTypeParameterDeclaration | BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
}

declare class BabelNodeExportAllDeclaration extends BabelNode {
  type: "ExportAllDeclaration";
  source: BabelNodeStringLiteral;
}

declare class BabelNodeExportDefaultDeclaration extends BabelNode {
  type: "ExportDefaultDeclaration";
  declaration: BabelNodeFunctionDeclaration | BabelNodeTSDeclareFunction | BabelNodeClassDeclaration | BabelNodeExpression;
}

declare class BabelNodeExportNamedDeclaration extends BabelNode {
  type: "ExportNamedDeclaration";
  declaration?: BabelNodeDeclaration;
  specifiers?: Array<BabelNodeExportSpecifier | BabelNodeExportDefaultSpecifier | BabelNodeExportNamespaceSpecifier>;
  source?: BabelNodeStringLiteral;
  exportKind?: "type" | "value";
}

declare class BabelNodeExportSpecifier extends BabelNode {
  type: "ExportSpecifier";
  local: BabelNodeIdentifier;
  exported: BabelNodeIdentifier | BabelNodeStringLiteral;
}

declare class BabelNodeForOfStatement extends BabelNode {
  type: "ForOfStatement";
  left: BabelNodeVariableDeclaration | BabelNodeLVal;
  right: BabelNodeExpression;
  body: BabelNodeStatement;
}

declare class BabelNodeImportDeclaration extends BabelNode {
  type: "ImportDeclaration";
  specifiers: Array<BabelNodeImportSpecifier | BabelNodeImportDefaultSpecifier | BabelNodeImportNamespaceSpecifier>;
  source: BabelNodeStringLiteral;
  importKind?: "type" | "typeof" | "value";
}

declare class BabelNodeImportDefaultSpecifier extends BabelNode {
  type: "ImportDefaultSpecifier";
  local: BabelNodeIdentifier;
}

declare class BabelNodeImportNamespaceSpecifier extends BabelNode {
  type: "ImportNamespaceSpecifier";
  local: BabelNodeIdentifier;
}

declare class BabelNodeImportSpecifier extends BabelNode {
  type: "ImportSpecifier";
  local: BabelNodeIdentifier;
  imported: BabelNodeIdentifier | BabelNodeStringLiteral;
  importKind?: "type" | "typeof";
}

declare class BabelNodeMetaProperty extends BabelNode {
  type: "MetaProperty";
  meta: BabelNodeIdentifier;
  property: BabelNodeIdentifier;
}

declare class BabelNodeClassMethod extends BabelNode {
  type: "ClassMethod";
  kind?: "get" | "set" | "method" | "constructor";
  key: BabelNodeIdentifier | BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeExpression;
  params: Array<BabelNodeIdentifier | BabelNodePattern | BabelNodeRestElement | BabelNodeTSParameterProperty>;
  body: BabelNodeBlockStatement;
  computed?: boolean;
  generator?: boolean;
  async?: boolean;
  abstract?: boolean;
  access?: "public" | "private" | "protected";
  accessibility?: "public" | "private" | "protected";
  decorators?: Array<BabelNodeDecorator>;
  optional?: boolean;
  returnType?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
  typeParameters?: BabelNodeTypeParameterDeclaration | BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
}

declare class BabelNodeObjectPattern extends BabelNode {
  type: "ObjectPattern";
  properties: Array<BabelNodeRestElement | BabelNodeObjectProperty>;
  decorators?: Array<BabelNodeDecorator>;
  typeAnnotation?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
}

declare class BabelNodeSpreadElement extends BabelNode {
  type: "SpreadElement";
  argument: BabelNodeExpression;
}

declare class BabelNodeSuper extends BabelNode {
  type: "Super";
}

declare class BabelNodeTaggedTemplateExpression extends BabelNode {
  type: "TaggedTemplateExpression";
  tag: BabelNodeExpression;
  quasi: BabelNodeTemplateLiteral;
  typeParameters?: BabelNodeTypeParameterInstantiation | BabelNodeTSTypeParameterInstantiation;
}

declare class BabelNodeTemplateElement extends BabelNode {
  type: "TemplateElement";
  value: { raw: string, cooked?: string };
  tail?: boolean;
}

declare class BabelNodeTemplateLiteral extends BabelNode {
  type: "TemplateLiteral";
  quasis: Array<BabelNodeTemplateElement>;
  expressions: Array<BabelNodeExpression | BabelNodeTSType>;
}

declare class BabelNodeYieldExpression extends BabelNode {
  type: "YieldExpression";
  argument?: BabelNodeExpression;
  delegate?: boolean;
}

declare class BabelNodeAwaitExpression extends BabelNode {
  type: "AwaitExpression";
  argument: BabelNodeExpression;
}

declare class BabelNodeImport extends BabelNode {
  type: "Import";
}

declare class BabelNodeBigIntLiteral extends BabelNode {
  type: "BigIntLiteral";
  value: string;
}

declare class BabelNodeExportNamespaceSpecifier extends BabelNode {
  type: "ExportNamespaceSpecifier";
  exported: BabelNodeIdentifier;
}

declare class BabelNodeOptionalMemberExpression extends BabelNode {
  type: "OptionalMemberExpression";
  object: BabelNodeExpression;
  property: BabelNodeExpression | BabelNodeIdentifier;
  computed?: boolean;
  optional: boolean;
}

declare class BabelNodeOptionalCallExpression extends BabelNode {
  type: "OptionalCallExpression";
  callee: BabelNodeExpression;
  arguments: Array<BabelNodeExpression | BabelNodeSpreadElement | BabelNodeJSXNamespacedName>;
  optional: boolean;
  typeArguments?: BabelNodeTypeParameterInstantiation;
  typeParameters?: BabelNodeTSTypeParameterInstantiation;
}

declare class BabelNodeAnyTypeAnnotation extends BabelNode {
  type: "AnyTypeAnnotation";
}

declare class BabelNodeArrayTypeAnnotation extends BabelNode {
  type: "ArrayTypeAnnotation";
  elementType: BabelNodeFlowType;
}

declare class BabelNodeBooleanTypeAnnotation extends BabelNode {
  type: "BooleanTypeAnnotation";
}

declare class BabelNodeBooleanLiteralTypeAnnotation extends BabelNode {
  type: "BooleanLiteralTypeAnnotation";
  value: boolean;
}

declare class BabelNodeNullLiteralTypeAnnotation extends BabelNode {
  type: "NullLiteralTypeAnnotation";
}

declare class BabelNodeClassImplements extends BabelNode {
  type: "ClassImplements";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTypeParameterInstantiation;
}

declare class BabelNodeDeclareClass extends BabelNode {
  type: "DeclareClass";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTypeParameterDeclaration;
  body: BabelNodeObjectTypeAnnotation;
  mixins?: Array<BabelNodeInterfaceExtends>;
}

declare class BabelNodeDeclareFunction extends BabelNode {
  type: "DeclareFunction";
  id: BabelNodeIdentifier;
  predicate?: BabelNodeDeclaredPredicate;
}

declare class BabelNodeDeclareInterface extends BabelNode {
  type: "DeclareInterface";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTypeParameterDeclaration;
  body: BabelNodeObjectTypeAnnotation;
  mixins?: Array<BabelNodeInterfaceExtends>;
}

declare class BabelNodeDeclareModule extends BabelNode {
  type: "DeclareModule";
  id: BabelNodeIdentifier | BabelNodeStringLiteral;
  body: BabelNodeBlockStatement;
  kind?: "CommonJS" | "ES";
}

declare class BabelNodeDeclareModuleExports extends BabelNode {
  type: "DeclareModuleExports";
  typeAnnotation: BabelNodeTypeAnnotation;
}

declare class BabelNodeDeclareTypeAlias extends BabelNode {
  type: "DeclareTypeAlias";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTypeParameterDeclaration;
  right: BabelNodeFlowType;
}

declare class BabelNodeDeclareOpaqueType extends BabelNode {
  type: "DeclareOpaqueType";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTypeParameterDeclaration;
  supertype?: BabelNodeFlowType;
}

declare class BabelNodeDeclareVariable extends BabelNode {
  type: "DeclareVariable";
  id: BabelNodeIdentifier;
}

declare class BabelNodeDeclareExportDeclaration extends BabelNode {
  type: "DeclareExportDeclaration";
  declaration?: BabelNodeFlow;
  specifiers?: Array<BabelNodeExportSpecifier | BabelNodeExportNamespaceSpecifier>;
  source?: BabelNodeStringLiteral;
}

declare class BabelNodeDeclareExportAllDeclaration extends BabelNode {
  type: "DeclareExportAllDeclaration";
  source: BabelNodeStringLiteral;
  exportKind?: "type" | "value";
}

declare class BabelNodeDeclaredPredicate extends BabelNode {
  type: "DeclaredPredicate";
  value: BabelNodeFlow;
}

declare class BabelNodeExistsTypeAnnotation extends BabelNode {
  type: "ExistsTypeAnnotation";
}

declare class BabelNodeFunctionTypeAnnotation extends BabelNode {
  type: "FunctionTypeAnnotation";
  typeParameters?: BabelNodeTypeParameterDeclaration;
  params: Array<BabelNodeFunctionTypeParam>;
  rest?: BabelNodeFunctionTypeParam;
  returnType: BabelNodeFlowType;
}

declare class BabelNodeFunctionTypeParam extends BabelNode {
  type: "FunctionTypeParam";
  name?: BabelNodeIdentifier;
  typeAnnotation: BabelNodeFlowType;
  optional?: boolean;
}

declare class BabelNodeGenericTypeAnnotation extends BabelNode {
  type: "GenericTypeAnnotation";
  id: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier;
  typeParameters?: BabelNodeTypeParameterInstantiation;
}

declare class BabelNodeInferredPredicate extends BabelNode {
  type: "InferredPredicate";
}

declare class BabelNodeInterfaceExtends extends BabelNode {
  type: "InterfaceExtends";
  id: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier;
  typeParameters?: BabelNodeTypeParameterInstantiation;
}

declare class BabelNodeInterfaceDeclaration extends BabelNode {
  type: "InterfaceDeclaration";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTypeParameterDeclaration;
  body: BabelNodeObjectTypeAnnotation;
  mixins?: Array<BabelNodeInterfaceExtends>;
}

declare class BabelNodeInterfaceTypeAnnotation extends BabelNode {
  type: "InterfaceTypeAnnotation";
  body: BabelNodeObjectTypeAnnotation;
}

declare class BabelNodeIntersectionTypeAnnotation extends BabelNode {
  type: "IntersectionTypeAnnotation";
  types: Array<BabelNodeFlowType>;
}

declare class BabelNodeMixedTypeAnnotation extends BabelNode {
  type: "MixedTypeAnnotation";
}

declare class BabelNodeEmptyTypeAnnotation extends BabelNode {
  type: "EmptyTypeAnnotation";
}

declare class BabelNodeNullableTypeAnnotation extends BabelNode {
  type: "NullableTypeAnnotation";
  typeAnnotation: BabelNodeFlowType;
}

declare class BabelNodeNumberLiteralTypeAnnotation extends BabelNode {
  type: "NumberLiteralTypeAnnotation";
  value: number;
}

declare class BabelNodeNumberTypeAnnotation extends BabelNode {
  type: "NumberTypeAnnotation";
}

declare class BabelNodeObjectTypeAnnotation extends BabelNode {
  type: "ObjectTypeAnnotation";
  properties: Array<BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty>;
  indexers?: Array<BabelNodeObjectTypeIndexer>;
  callProperties?: Array<BabelNodeObjectTypeCallProperty>;
  internalSlots?: Array<BabelNodeObjectTypeInternalSlot>;
  exact?: boolean;
  inexact?: boolean;
}

declare class BabelNodeObjectTypeInternalSlot extends BabelNode {
  type: "ObjectTypeInternalSlot";
  id: BabelNodeIdentifier;
  value: BabelNodeFlowType;
  optional: boolean;
  method: boolean;
}

declare class BabelNodeObjectTypeCallProperty extends BabelNode {
  type: "ObjectTypeCallProperty";
  value: BabelNodeFlowType;
}

declare class BabelNodeObjectTypeIndexer extends BabelNode {
  type: "ObjectTypeIndexer";
  id?: BabelNodeIdentifier;
  key: BabelNodeFlowType;
  value: BabelNodeFlowType;
  variance?: BabelNodeVariance;
}

declare class BabelNodeObjectTypeProperty extends BabelNode {
  type: "ObjectTypeProperty";
  key: BabelNodeIdentifier | BabelNodeStringLiteral;
  value: BabelNodeFlowType;
  variance?: BabelNodeVariance;
  kind: "init" | "get" | "set";
  optional: boolean;
  proto: boolean;
}

declare class BabelNodeObjectTypeSpreadProperty extends BabelNode {
  type: "ObjectTypeSpreadProperty";
  argument: BabelNodeFlowType;
}

declare class BabelNodeOpaqueType extends BabelNode {
  type: "OpaqueType";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTypeParameterDeclaration;
  supertype?: BabelNodeFlowType;
  impltype: BabelNodeFlowType;
}

declare class BabelNodeQualifiedTypeIdentifier extends BabelNode {
  type: "QualifiedTypeIdentifier";
  id: BabelNodeIdentifier;
  qualification: BabelNodeIdentifier | BabelNodeQualifiedTypeIdentifier;
}

declare class BabelNodeStringLiteralTypeAnnotation extends BabelNode {
  type: "StringLiteralTypeAnnotation";
  value: string;
}

declare class BabelNodeStringTypeAnnotation extends BabelNode {
  type: "StringTypeAnnotation";
}

declare class BabelNodeSymbolTypeAnnotation extends BabelNode {
  type: "SymbolTypeAnnotation";
}

declare class BabelNodeThisTypeAnnotation extends BabelNode {
  type: "ThisTypeAnnotation";
}

declare class BabelNodeTupleTypeAnnotation extends BabelNode {
  type: "TupleTypeAnnotation";
  types: Array<BabelNodeFlowType>;
}

declare class BabelNodeTypeofTypeAnnotation extends BabelNode {
  type: "TypeofTypeAnnotation";
  argument: BabelNodeFlowType;
}

declare class BabelNodeTypeAlias extends BabelNode {
  type: "TypeAlias";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTypeParameterDeclaration;
  right: BabelNodeFlowType;
}

declare class BabelNodeTypeAnnotation extends BabelNode {
  type: "TypeAnnotation";
  typeAnnotation: BabelNodeFlowType;
}

declare class BabelNodeTypeCastExpression extends BabelNode {
  type: "TypeCastExpression";
  expression: BabelNodeExpression;
  typeAnnotation: BabelNodeTypeAnnotation;
}

declare class BabelNodeTypeParameter extends BabelNode {
  type: "TypeParameter";
  bound?: BabelNodeTypeAnnotation;
  variance?: BabelNodeVariance;
  name: string;
}

declare class BabelNodeTypeParameterDeclaration extends BabelNode {
  type: "TypeParameterDeclaration";
  params: Array<BabelNodeTypeParameter>;
}

declare class BabelNodeTypeParameterInstantiation extends BabelNode {
  type: "TypeParameterInstantiation";
  params: Array<BabelNodeFlowType>;
}

declare class BabelNodeUnionTypeAnnotation extends BabelNode {
  type: "UnionTypeAnnotation";
  types: Array<BabelNodeFlowType>;
}

declare class BabelNodeVariance extends BabelNode {
  type: "Variance";
  kind: "minus" | "plus";
}

declare class BabelNodeVoidTypeAnnotation extends BabelNode {
  type: "VoidTypeAnnotation";
}

declare class BabelNodeEnumDeclaration extends BabelNode {
  type: "EnumDeclaration";
  id: BabelNodeIdentifier;
  body: BabelNodeEnumBooleanBody | BabelNodeEnumNumberBody | BabelNodeEnumStringBody | BabelNodeEnumSymbolBody;
}

declare class BabelNodeEnumBooleanBody extends BabelNode {
  type: "EnumBooleanBody";
  members: Array<BabelNodeEnumBooleanMember>;
  explicit: boolean;
}

declare class BabelNodeEnumNumberBody extends BabelNode {
  type: "EnumNumberBody";
  members: Array<BabelNodeEnumNumberMember>;
  explicit: boolean;
}

declare class BabelNodeEnumStringBody extends BabelNode {
  type: "EnumStringBody";
  members: Array<BabelNodeEnumStringMember | BabelNodeEnumDefaultedMember>;
  explicit: boolean;
}

declare class BabelNodeEnumSymbolBody extends BabelNode {
  type: "EnumSymbolBody";
  members: Array<BabelNodeEnumDefaultedMember>;
}

declare class BabelNodeEnumBooleanMember extends BabelNode {
  type: "EnumBooleanMember";
  id: BabelNodeIdentifier;
  init: BabelNodeBooleanLiteral;
}

declare class BabelNodeEnumNumberMember extends BabelNode {
  type: "EnumNumberMember";
  id: BabelNodeIdentifier;
  init: BabelNodeNumericLiteral;
}

declare class BabelNodeEnumStringMember extends BabelNode {
  type: "EnumStringMember";
  id: BabelNodeIdentifier;
  init: BabelNodeStringLiteral;
}

declare class BabelNodeEnumDefaultedMember extends BabelNode {
  type: "EnumDefaultedMember";
  id: BabelNodeIdentifier;
}

declare class BabelNodeJSXAttribute extends BabelNode {
  type: "JSXAttribute";
  name: BabelNodeJSXIdentifier | BabelNodeJSXNamespacedName;
  value?: BabelNodeJSXElement | BabelNodeJSXFragment | BabelNodeStringLiteral | BabelNodeJSXExpressionContainer;
}

declare class BabelNodeJSXClosingElement extends BabelNode {
  type: "JSXClosingElement";
  name: BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression | BabelNodeJSXNamespacedName;
}

declare class BabelNodeJSXElement extends BabelNode {
  type: "JSXElement";
  openingElement: BabelNodeJSXOpeningElement;
  closingElement?: BabelNodeJSXClosingElement;
  children: Array<BabelNodeJSXText | BabelNodeJSXExpressionContainer | BabelNodeJSXSpreadChild | BabelNodeJSXElement | BabelNodeJSXFragment>;
  selfClosing?: boolean;
}

declare class BabelNodeJSXEmptyExpression extends BabelNode {
  type: "JSXEmptyExpression";
}

declare class BabelNodeJSXExpressionContainer extends BabelNode {
  type: "JSXExpressionContainer";
  expression: BabelNodeExpression | BabelNodeJSXEmptyExpression;
}

declare class BabelNodeJSXSpreadChild extends BabelNode {
  type: "JSXSpreadChild";
  expression: BabelNodeExpression;
}

declare class BabelNodeJSXIdentifier extends BabelNode {
  type: "JSXIdentifier";
  name: string;
}

declare class BabelNodeJSXMemberExpression extends BabelNode {
  type: "JSXMemberExpression";
  object: BabelNodeJSXMemberExpression | BabelNodeJSXIdentifier;
  property: BabelNodeJSXIdentifier;
}

declare class BabelNodeJSXNamespacedName extends BabelNode {
  type: "JSXNamespacedName";
  namespace: BabelNodeJSXIdentifier;
  name: BabelNodeJSXIdentifier;
}

declare class BabelNodeJSXOpeningElement extends BabelNode {
  type: "JSXOpeningElement";
  name: BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression | BabelNodeJSXNamespacedName;
  attributes: Array<BabelNodeJSXAttribute | BabelNodeJSXSpreadAttribute>;
  selfClosing?: boolean;
  typeParameters?: BabelNodeTypeParameterInstantiation | BabelNodeTSTypeParameterInstantiation;
}

declare class BabelNodeJSXSpreadAttribute extends BabelNode {
  type: "JSXSpreadAttribute";
  argument: BabelNodeExpression;
}

declare class BabelNodeJSXText extends BabelNode {
  type: "JSXText";
  value: string;
}

declare class BabelNodeJSXFragment extends BabelNode {
  type: "JSXFragment";
  openingFragment: BabelNodeJSXOpeningFragment;
  closingFragment: BabelNodeJSXClosingFragment;
  children: Array<BabelNodeJSXText | BabelNodeJSXExpressionContainer | BabelNodeJSXSpreadChild | BabelNodeJSXElement | BabelNodeJSXFragment>;
}

declare class BabelNodeJSXOpeningFragment extends BabelNode {
  type: "JSXOpeningFragment";
}

declare class BabelNodeJSXClosingFragment extends BabelNode {
  type: "JSXClosingFragment";
}

declare class BabelNodeNoop extends BabelNode {
  type: "Noop";
}

declare class BabelNodePlaceholder extends BabelNode {
  type: "Placeholder";
  expectedNode: "Identifier" | "StringLiteral" | "Expression" | "Statement" | "Declaration" | "BlockStatement" | "ClassBody" | "Pattern";
  name: BabelNodeIdentifier;
}

declare class BabelNodeV8IntrinsicIdentifier extends BabelNode {
  type: "V8IntrinsicIdentifier";
  name: string;
}

declare class BabelNodeArgumentPlaceholder extends BabelNode {
  type: "ArgumentPlaceholder";
}

declare class BabelNodeBindExpression extends BabelNode {
  type: "BindExpression";
  object: BabelNodeExpression;
  callee: BabelNodeExpression;
}

declare class BabelNodeClassProperty extends BabelNode {
  type: "ClassProperty";
  key: BabelNodeIdentifier | BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeExpression;
  value?: BabelNodeExpression;
  typeAnnotation?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
  decorators?: Array<BabelNodeDecorator>;
  computed?: boolean;
  abstract?: boolean;
  accessibility?: "public" | "private" | "protected";
  declare?: boolean;
  definite?: boolean;
  optional?: boolean;
  readonly?: boolean;
}

declare class BabelNodePipelineTopicExpression extends BabelNode {
  type: "PipelineTopicExpression";
  expression: BabelNodeExpression;
}

declare class BabelNodePipelineBareFunction extends BabelNode {
  type: "PipelineBareFunction";
  callee: BabelNodeExpression;
}

declare class BabelNodePipelinePrimaryTopicReference extends BabelNode {
  type: "PipelinePrimaryTopicReference";
}

declare class BabelNodeClassPrivateProperty extends BabelNode {
  type: "ClassPrivateProperty";
  key: BabelNodePrivateName;
  value?: BabelNodeExpression;
  decorators?: Array<BabelNodeDecorator>;
}

declare class BabelNodeClassPrivateMethod extends BabelNode {
  type: "ClassPrivateMethod";
  kind?: "get" | "set" | "method" | "constructor";
  key: BabelNodePrivateName;
  params: Array<BabelNodeIdentifier | BabelNodePattern | BabelNodeRestElement | BabelNodeTSParameterProperty>;
  body: BabelNodeBlockStatement;
  abstract?: boolean;
  access?: "public" | "private" | "protected";
  accessibility?: "public" | "private" | "protected";
  async?: boolean;
  computed?: boolean;
  decorators?: Array<BabelNodeDecorator>;
  generator?: boolean;
  optional?: boolean;
  returnType?: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | BabelNodeNoop;
  typeParameters?: BabelNodeTypeParameterDeclaration | BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
}

declare class BabelNodeImportAttribute extends BabelNode {
  type: "ImportAttribute";
  key: BabelNodeIdentifier | BabelNodeStringLiteral;
  value: BabelNodeStringLiteral;
}

declare class BabelNodeDecorator extends BabelNode {
  type: "Decorator";
  expression: BabelNodeExpression;
}

declare class BabelNodeDoExpression extends BabelNode {
  type: "DoExpression";
  body: BabelNodeBlockStatement;
}

declare class BabelNodeExportDefaultSpecifier extends BabelNode {
  type: "ExportDefaultSpecifier";
  exported: BabelNodeIdentifier;
}

declare class BabelNodePrivateName extends BabelNode {
  type: "PrivateName";
  id: BabelNodeIdentifier;
}

declare class BabelNodeRecordExpression extends BabelNode {
  type: "RecordExpression";
  properties: Array<BabelNodeObjectProperty | BabelNodeSpreadElement>;
}

declare class BabelNodeTupleExpression extends BabelNode {
  type: "TupleExpression";
  elements?: Array<BabelNodeExpression | BabelNodeSpreadElement>;
}

declare class BabelNodeDecimalLiteral extends BabelNode {
  type: "DecimalLiteral";
  value: string;
}

declare class BabelNodeStaticBlock extends BabelNode {
  type: "StaticBlock";
  body: Array<BabelNodeStatement>;
}

declare class BabelNodeTSParameterProperty extends BabelNode {
  type: "TSParameterProperty";
  parameter: BabelNodeIdentifier | BabelNodeAssignmentPattern;
  accessibility?: "public" | "private" | "protected";
  readonly?: boolean;
}

declare class BabelNodeTSDeclareFunction extends BabelNode {
  type: "TSDeclareFunction";
  id?: BabelNodeIdentifier;
  typeParameters?: BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
  params: Array<BabelNodeIdentifier | BabelNodePattern | BabelNodeRestElement | BabelNodeTSParameterProperty>;
  returnType?: BabelNodeTSTypeAnnotation | BabelNodeNoop;
  async?: boolean;
  declare?: boolean;
  generator?: boolean;
}

declare class BabelNodeTSDeclareMethod extends BabelNode {
  type: "TSDeclareMethod";
  decorators?: Array<BabelNodeDecorator>;
  key: BabelNodeIdentifier | BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeExpression;
  typeParameters?: BabelNodeTSTypeParameterDeclaration | BabelNodeNoop;
  params: Array<BabelNodeIdentifier | BabelNodePattern | BabelNodeRestElement | BabelNodeTSParameterProperty>;
  returnType?: BabelNodeTSTypeAnnotation | BabelNodeNoop;
  abstract?: boolean;
  access?: "public" | "private" | "protected";
  accessibility?: "public" | "private" | "protected";
  async?: boolean;
  computed?: boolean;
  generator?: boolean;
  kind?: "get" | "set" | "method" | "constructor";
  optional?: boolean;
}

declare class BabelNodeTSQualifiedName extends BabelNode {
  type: "TSQualifiedName";
  left: BabelNodeTSEntityName;
  right: BabelNodeIdentifier;
}

declare class BabelNodeTSCallSignatureDeclaration extends BabelNode {
  type: "TSCallSignatureDeclaration";
  typeParameters?: BabelNodeTSTypeParameterDeclaration;
  parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
  typeAnnotation?: BabelNodeTSTypeAnnotation;
}

declare class BabelNodeTSConstructSignatureDeclaration extends BabelNode {
  type: "TSConstructSignatureDeclaration";
  typeParameters?: BabelNodeTSTypeParameterDeclaration;
  parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
  typeAnnotation?: BabelNodeTSTypeAnnotation;
}

declare class BabelNodeTSPropertySignature extends BabelNode {
  type: "TSPropertySignature";
  key: BabelNodeExpression;
  typeAnnotation?: BabelNodeTSTypeAnnotation;
  initializer?: BabelNodeExpression;
  computed?: boolean;
  optional?: boolean;
  readonly?: boolean;
}

declare class BabelNodeTSMethodSignature extends BabelNode {
  type: "TSMethodSignature";
  key: BabelNodeExpression;
  typeParameters?: BabelNodeTSTypeParameterDeclaration;
  parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
  typeAnnotation?: BabelNodeTSTypeAnnotation;
  computed?: boolean;
  optional?: boolean;
}

declare class BabelNodeTSIndexSignature extends BabelNode {
  type: "TSIndexSignature";
  parameters: Array<BabelNodeIdentifier>;
  typeAnnotation?: BabelNodeTSTypeAnnotation;
  readonly?: boolean;
}

declare class BabelNodeTSAnyKeyword extends BabelNode {
  type: "TSAnyKeyword";
}

declare class BabelNodeTSBooleanKeyword extends BabelNode {
  type: "TSBooleanKeyword";
}

declare class BabelNodeTSBigIntKeyword extends BabelNode {
  type: "TSBigIntKeyword";
}

declare class BabelNodeTSIntrinsicKeyword extends BabelNode {
  type: "TSIntrinsicKeyword";
}

declare class BabelNodeTSNeverKeyword extends BabelNode {
  type: "TSNeverKeyword";
}

declare class BabelNodeTSNullKeyword extends BabelNode {
  type: "TSNullKeyword";
}

declare class BabelNodeTSNumberKeyword extends BabelNode {
  type: "TSNumberKeyword";
}

declare class BabelNodeTSObjectKeyword extends BabelNode {
  type: "TSObjectKeyword";
}

declare class BabelNodeTSStringKeyword extends BabelNode {
  type: "TSStringKeyword";
}

declare class BabelNodeTSSymbolKeyword extends BabelNode {
  type: "TSSymbolKeyword";
}

declare class BabelNodeTSUndefinedKeyword extends BabelNode {
  type: "TSUndefinedKeyword";
}

declare class BabelNodeTSUnknownKeyword extends BabelNode {
  type: "TSUnknownKeyword";
}

declare class BabelNodeTSVoidKeyword extends BabelNode {
  type: "TSVoidKeyword";
}

declare class BabelNodeTSThisType extends BabelNode {
  type: "TSThisType";
}

declare class BabelNodeTSFunctionType extends BabelNode {
  type: "TSFunctionType";
  typeParameters?: BabelNodeTSTypeParameterDeclaration;
  parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
  typeAnnotation?: BabelNodeTSTypeAnnotation;
}

declare class BabelNodeTSConstructorType extends BabelNode {
  type: "TSConstructorType";
  typeParameters?: BabelNodeTSTypeParameterDeclaration;
  parameters: Array<BabelNodeIdentifier | BabelNodeRestElement>;
  typeAnnotation?: BabelNodeTSTypeAnnotation;
}

declare class BabelNodeTSTypeReference extends BabelNode {
  type: "TSTypeReference";
  typeName: BabelNodeTSEntityName;
  typeParameters?: BabelNodeTSTypeParameterInstantiation;
}

declare class BabelNodeTSTypePredicate extends BabelNode {
  type: "TSTypePredicate";
  parameterName: BabelNodeIdentifier | BabelNodeTSThisType;
  typeAnnotation?: BabelNodeTSTypeAnnotation;
  asserts?: boolean;
}

declare class BabelNodeTSTypeQuery extends BabelNode {
  type: "TSTypeQuery";
  exprName: BabelNodeTSEntityName | BabelNodeTSImportType;
}

declare class BabelNodeTSTypeLiteral extends BabelNode {
  type: "TSTypeLiteral";
  members: Array<BabelNodeTSTypeElement>;
}

declare class BabelNodeTSArrayType extends BabelNode {
  type: "TSArrayType";
  elementType: BabelNodeTSType;
}

declare class BabelNodeTSTupleType extends BabelNode {
  type: "TSTupleType";
  elementTypes: Array<BabelNodeTSType | BabelNodeTSNamedTupleMember>;
}

declare class BabelNodeTSOptionalType extends BabelNode {
  type: "TSOptionalType";
  typeAnnotation: BabelNodeTSType;
}

declare class BabelNodeTSRestType extends BabelNode {
  type: "TSRestType";
  typeAnnotation: BabelNodeTSType;
}

declare class BabelNodeTSNamedTupleMember extends BabelNode {
  type: "TSNamedTupleMember";
  label: BabelNodeIdentifier;
  elementType: BabelNodeTSType;
  optional?: boolean;
}

declare class BabelNodeTSUnionType extends BabelNode {
  type: "TSUnionType";
  types: Array<BabelNodeTSType>;
}

declare class BabelNodeTSIntersectionType extends BabelNode {
  type: "TSIntersectionType";
  types: Array<BabelNodeTSType>;
}

declare class BabelNodeTSConditionalType extends BabelNode {
  type: "TSConditionalType";
  checkType: BabelNodeTSType;
  extendsType: BabelNodeTSType;
  trueType: BabelNodeTSType;
  falseType: BabelNodeTSType;
}

declare class BabelNodeTSInferType extends BabelNode {
  type: "TSInferType";
  typeParameter: BabelNodeTSTypeParameter;
}

declare class BabelNodeTSParenthesizedType extends BabelNode {
  type: "TSParenthesizedType";
  typeAnnotation: BabelNodeTSType;
}

declare class BabelNodeTSTypeOperator extends BabelNode {
  type: "TSTypeOperator";
  typeAnnotation: BabelNodeTSType;
  operator: string;
}

declare class BabelNodeTSIndexedAccessType extends BabelNode {
  type: "TSIndexedAccessType";
  objectType: BabelNodeTSType;
  indexType: BabelNodeTSType;
}

declare class BabelNodeTSMappedType extends BabelNode {
  type: "TSMappedType";
  typeParameter: BabelNodeTSTypeParameter;
  typeAnnotation?: BabelNodeTSType;
  nameType?: BabelNodeTSType;
  optional?: boolean;
  readonly?: boolean;
}

declare class BabelNodeTSLiteralType extends BabelNode {
  type: "TSLiteralType";
  literal: BabelNodeNumericLiteral | BabelNodeStringLiteral | BabelNodeBooleanLiteral | BabelNodeBigIntLiteral;
}

declare class BabelNodeTSExpressionWithTypeArguments extends BabelNode {
  type: "TSExpressionWithTypeArguments";
  expression: BabelNodeTSEntityName;
  typeParameters?: BabelNodeTSTypeParameterInstantiation;
}

declare class BabelNodeTSInterfaceDeclaration extends BabelNode {
  type: "TSInterfaceDeclaration";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTSTypeParameterDeclaration;
  body: BabelNodeTSInterfaceBody;
  declare?: boolean;
}

declare class BabelNodeTSInterfaceBody extends BabelNode {
  type: "TSInterfaceBody";
  body: Array<BabelNodeTSTypeElement>;
}

declare class BabelNodeTSTypeAliasDeclaration extends BabelNode {
  type: "TSTypeAliasDeclaration";
  id: BabelNodeIdentifier;
  typeParameters?: BabelNodeTSTypeParameterDeclaration;
  typeAnnotation: BabelNodeTSType;
  declare?: boolean;
}

declare class BabelNodeTSAsExpression extends BabelNode {
  type: "TSAsExpression";
  expression: BabelNodeExpression;
  typeAnnotation: BabelNodeTSType;
}

declare class BabelNodeTSTypeAssertion extends BabelNode {
  type: "TSTypeAssertion";
  typeAnnotation: BabelNodeTSType;
  expression: BabelNodeExpression;
}

declare class BabelNodeTSEnumDeclaration extends BabelNode {
  type: "TSEnumDeclaration";
  id: BabelNodeIdentifier;
  members: Array<BabelNodeTSEnumMember>;
  declare?: boolean;
  initializer?: BabelNodeExpression;
}

declare class BabelNodeTSEnumMember extends BabelNode {
  type: "TSEnumMember";
  id: BabelNodeIdentifier | BabelNodeStringLiteral;
  initializer?: BabelNodeExpression;
}

declare class BabelNodeTSModuleDeclaration extends BabelNode {
  type: "TSModuleDeclaration";
  id: BabelNodeIdentifier | BabelNodeStringLiteral;
  body: BabelNodeTSModuleBlock | BabelNodeTSModuleDeclaration;
  declare?: boolean;
  global?: boolean;
}

declare class BabelNodeTSModuleBlock extends BabelNode {
  type: "TSModuleBlock";
  body: Array<BabelNodeStatement>;
}

declare class BabelNodeTSImportType extends BabelNode {
  type: "TSImportType";
  argument: BabelNodeStringLiteral;
  qualifier?: BabelNodeTSEntityName;
  typeParameters?: BabelNodeTSTypeParameterInstantiation;
}

declare class BabelNodeTSImportEqualsDeclaration extends BabelNode {
  type: "TSImportEqualsDeclaration";
  id: BabelNodeIdentifier;
  moduleReference: BabelNodeTSEntityName | BabelNodeTSExternalModuleReference;
  isExport: boolean;
}

declare class BabelNodeTSExternalModuleReference extends BabelNode {
  type: "TSExternalModuleReference";
  expression: BabelNodeStringLiteral;
}

declare class BabelNodeTSNonNullExpression extends BabelNode {
  type: "TSNonNullExpression";
  expression: BabelNodeExpression;
}

declare class BabelNodeTSExportAssignment extends BabelNode {
  type: "TSExportAssignment";
  expression: BabelNodeExpression;
}

declare class BabelNodeTSNamespaceExportDeclaration extends BabelNode {
  type: "TSNamespaceExportDeclaration";
  id: BabelNodeIdentifier;
}

declare class BabelNodeTSTypeAnnotation extends BabelNode {
  type: "TSTypeAnnotation";
  typeAnnotation: BabelNodeTSType;
}

declare class BabelNodeTSTypeParameterInstantiation extends BabelNode {
  type: "TSTypeParameterInstantiation";
  params: Array<BabelNodeTSType>;
}

declare class BabelNodeTSTypeParameterDeclaration extends BabelNode {
  type: "TSTypeParameterDeclaration";
  params: Array<BabelNodeTSTypeParameter>;
}

declare class BabelNodeTSTypeParameter extends BabelNode {
  type: "TSTypeParameter";
  constraint?: BabelNodeTSType;
  name: string;
}

type BabelNodeExpression = BabelNodeArrayExpression | BabelNodeAssignmentExpression | BabelNodeBinaryExpression | BabelNodeCallExpression | BabelNodeConditionalExpression | BabelNodeFunctionExpression | BabelNodeIdentifier | BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeNullLiteral | BabelNodeBooleanLiteral | BabelNodeRegExpLiteral | BabelNodeLogicalExpression | BabelNodeMemberExpression | BabelNodeNewExpression | BabelNodeObjectExpression | BabelNodeSequenceExpression | BabelNodeParenthesizedExpression | BabelNodeThisExpression | BabelNodeUnaryExpression | BabelNodeUpdateExpression | BabelNodeArrowFunctionExpression | BabelNodeClassExpression | BabelNodeMetaProperty | BabelNodeSuper | BabelNodeTaggedTemplateExpression | BabelNodeTemplateLiteral | BabelNodeYieldExpression | BabelNodeAwaitExpression | BabelNodeImport | BabelNodeBigIntLiteral | BabelNodeOptionalMemberExpression | BabelNodeOptionalCallExpression | BabelNodeTypeCastExpression | BabelNodeJSXElement | BabelNodeJSXFragment | BabelNodeBindExpression | BabelNodePipelinePrimaryTopicReference | BabelNodeDoExpression | BabelNodeRecordExpression | BabelNodeTupleExpression | BabelNodeDecimalLiteral | BabelNodeTSAsExpression | BabelNodeTSTypeAssertion | BabelNodeTSNonNullExpression;
type BabelNodeBinary = BabelNodeBinaryExpression | BabelNodeLogicalExpression;
type BabelNodeScopable = BabelNodeBlockStatement | BabelNodeCatchClause | BabelNodeDoWhileStatement | BabelNodeForInStatement | BabelNodeForStatement | BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeProgram | BabelNodeObjectMethod | BabelNodeSwitchStatement | BabelNodeWhileStatement | BabelNodeArrowFunctionExpression | BabelNodeClassExpression | BabelNodeClassDeclaration | BabelNodeForOfStatement | BabelNodeClassMethod | BabelNodeClassPrivateMethod | BabelNodeStaticBlock | BabelNodeTSModuleBlock;
type BabelNodeBlockParent = BabelNodeBlockStatement | BabelNodeCatchClause | BabelNodeDoWhileStatement | BabelNodeForInStatement | BabelNodeForStatement | BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeProgram | BabelNodeObjectMethod | BabelNodeSwitchStatement | BabelNodeWhileStatement | BabelNodeArrowFunctionExpression | BabelNodeForOfStatement | BabelNodeClassMethod | BabelNodeClassPrivateMethod | BabelNodeStaticBlock | BabelNodeTSModuleBlock;
type BabelNodeBlock = BabelNodeBlockStatement | BabelNodeProgram | BabelNodeTSModuleBlock;
type BabelNodeStatement = BabelNodeBlockStatement | BabelNodeBreakStatement | BabelNodeContinueStatement | BabelNodeDebuggerStatement | BabelNodeDoWhileStatement | BabelNodeEmptyStatement | BabelNodeExpressionStatement | BabelNodeForInStatement | BabelNodeForStatement | BabelNodeFunctionDeclaration | BabelNodeIfStatement | BabelNodeLabeledStatement | BabelNodeReturnStatement | BabelNodeSwitchStatement | BabelNodeThrowStatement | BabelNodeTryStatement | BabelNodeVariableDeclaration | BabelNodeWhileStatement | BabelNodeWithStatement | BabelNodeClassDeclaration | BabelNodeExportAllDeclaration | BabelNodeExportDefaultDeclaration | BabelNodeExportNamedDeclaration | BabelNodeForOfStatement | BabelNodeImportDeclaration | BabelNodeDeclareClass | BabelNodeDeclareFunction | BabelNodeDeclareInterface | BabelNodeDeclareModule | BabelNodeDeclareModuleExports | BabelNodeDeclareTypeAlias | BabelNodeDeclareOpaqueType | BabelNodeDeclareVariable | BabelNodeDeclareExportDeclaration | BabelNodeDeclareExportAllDeclaration | BabelNodeInterfaceDeclaration | BabelNodeOpaqueType | BabelNodeTypeAlias | BabelNodeEnumDeclaration | BabelNodeTSDeclareFunction | BabelNodeTSInterfaceDeclaration | BabelNodeTSTypeAliasDeclaration | BabelNodeTSEnumDeclaration | BabelNodeTSModuleDeclaration | BabelNodeTSImportEqualsDeclaration | BabelNodeTSExportAssignment | BabelNodeTSNamespaceExportDeclaration;
type BabelNodeTerminatorless = BabelNodeBreakStatement | BabelNodeContinueStatement | BabelNodeReturnStatement | BabelNodeThrowStatement | BabelNodeYieldExpression | BabelNodeAwaitExpression;
type BabelNodeCompletionStatement = BabelNodeBreakStatement | BabelNodeContinueStatement | BabelNodeReturnStatement | BabelNodeThrowStatement;
type BabelNodeConditional = BabelNodeConditionalExpression | BabelNodeIfStatement;
type BabelNodeLoop = BabelNodeDoWhileStatement | BabelNodeForInStatement | BabelNodeForStatement | BabelNodeWhileStatement | BabelNodeForOfStatement;
type BabelNodeWhile = BabelNodeDoWhileStatement | BabelNodeWhileStatement;
type BabelNodeExpressionWrapper = BabelNodeExpressionStatement | BabelNodeParenthesizedExpression | BabelNodeTypeCastExpression;
type BabelNodeFor = BabelNodeForInStatement | BabelNodeForStatement | BabelNodeForOfStatement;
type BabelNodeForXStatement = BabelNodeForInStatement | BabelNodeForOfStatement;
type BabelNodeFunction = BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeObjectMethod | BabelNodeArrowFunctionExpression | BabelNodeClassMethod | BabelNodeClassPrivateMethod;
type BabelNodeFunctionParent = BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeObjectMethod | BabelNodeArrowFunctionExpression | BabelNodeClassMethod | BabelNodeClassPrivateMethod;
type BabelNodePureish = BabelNodeFunctionDeclaration | BabelNodeFunctionExpression | BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeNullLiteral | BabelNodeBooleanLiteral | BabelNodeRegExpLiteral | BabelNodeArrowFunctionExpression | BabelNodeBigIntLiteral | BabelNodeDecimalLiteral;
type BabelNodeDeclaration = BabelNodeFunctionDeclaration | BabelNodeVariableDeclaration | BabelNodeClassDeclaration | BabelNodeExportAllDeclaration | BabelNodeExportDefaultDeclaration | BabelNodeExportNamedDeclaration | BabelNodeImportDeclaration | BabelNodeDeclareClass | BabelNodeDeclareFunction | BabelNodeDeclareInterface | BabelNodeDeclareModule | BabelNodeDeclareModuleExports | BabelNodeDeclareTypeAlias | BabelNodeDeclareOpaqueType | BabelNodeDeclareVariable | BabelNodeDeclareExportDeclaration | BabelNodeDeclareExportAllDeclaration | BabelNodeInterfaceDeclaration | BabelNodeOpaqueType | BabelNodeTypeAlias | BabelNodeEnumDeclaration | BabelNodeTSDeclareFunction | BabelNodeTSInterfaceDeclaration | BabelNodeTSTypeAliasDeclaration | BabelNodeTSEnumDeclaration | BabelNodeTSModuleDeclaration;
type BabelNodePatternLike = BabelNodeIdentifier | BabelNodeRestElement | BabelNodeAssignmentPattern | BabelNodeArrayPattern | BabelNodeObjectPattern;
type BabelNodeLVal = BabelNodeIdentifier | BabelNodeMemberExpression | BabelNodeRestElement | BabelNodeAssignmentPattern | BabelNodeArrayPattern | BabelNodeObjectPattern | BabelNodeTSParameterProperty;
type BabelNodeTSEntityName = BabelNodeIdentifier | BabelNodeTSQualifiedName;
type BabelNodeLiteral = BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeNullLiteral | BabelNodeBooleanLiteral | BabelNodeRegExpLiteral | BabelNodeTemplateLiteral | BabelNodeBigIntLiteral | BabelNodeDecimalLiteral;
type BabelNodeImmutable = BabelNodeStringLiteral | BabelNodeNumericLiteral | BabelNodeNullLiteral | BabelNodeBooleanLiteral | BabelNodeBigIntLiteral | BabelNodeJSXAttribute | BabelNodeJSXClosingElement | BabelNodeJSXElement | BabelNodeJSXExpressionContainer | BabelNodeJSXSpreadChild | BabelNodeJSXOpeningElement | BabelNodeJSXText | BabelNodeJSXFragment | BabelNodeJSXOpeningFragment | BabelNodeJSXClosingFragment | BabelNodeDecimalLiteral;
type BabelNodeUserWhitespacable = BabelNodeObjectMethod | BabelNodeObjectProperty | BabelNodeObjectTypeInternalSlot | BabelNodeObjectTypeCallProperty | BabelNodeObjectTypeIndexer | BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty;
type BabelNodeMethod = BabelNodeObjectMethod | BabelNodeClassMethod | BabelNodeClassPrivateMethod;
type BabelNodeObjectMember = BabelNodeObjectMethod | BabelNodeObjectProperty;
type BabelNodeProperty = BabelNodeObjectProperty | BabelNodeClassProperty | BabelNodeClassPrivateProperty;
type BabelNodeUnaryLike = BabelNodeUnaryExpression | BabelNodeSpreadElement;
type BabelNodePattern = BabelNodeAssignmentPattern | BabelNodeArrayPattern | BabelNodeObjectPattern;
type BabelNodeClass = BabelNodeClassExpression | BabelNodeClassDeclaration;
type BabelNodeModuleDeclaration = BabelNodeExportAllDeclaration | BabelNodeExportDefaultDeclaration | BabelNodeExportNamedDeclaration | BabelNodeImportDeclaration;
type BabelNodeExportDeclaration = BabelNodeExportAllDeclaration | BabelNodeExportDefaultDeclaration | BabelNodeExportNamedDeclaration;
type BabelNodeModuleSpecifier = BabelNodeExportSpecifier | BabelNodeImportDefaultSpecifier | BabelNodeImportNamespaceSpecifier | BabelNodeImportSpecifier | BabelNodeExportNamespaceSpecifier | BabelNodeExportDefaultSpecifier;
type BabelNodeFlow = BabelNodeAnyTypeAnnotation | BabelNodeArrayTypeAnnotation | BabelNodeBooleanTypeAnnotation | BabelNodeBooleanLiteralTypeAnnotation | BabelNodeNullLiteralTypeAnnotation | BabelNodeClassImplements | BabelNodeDeclareClass | BabelNodeDeclareFunction | BabelNodeDeclareInterface | BabelNodeDeclareModule | BabelNodeDeclareModuleExports | BabelNodeDeclareTypeAlias | BabelNodeDeclareOpaqueType | BabelNodeDeclareVariable | BabelNodeDeclareExportDeclaration | BabelNodeDeclareExportAllDeclaration | BabelNodeDeclaredPredicate | BabelNodeExistsTypeAnnotation | BabelNodeFunctionTypeAnnotation | BabelNodeFunctionTypeParam | BabelNodeGenericTypeAnnotation | BabelNodeInferredPredicate | BabelNodeInterfaceExtends | BabelNodeInterfaceDeclaration | BabelNodeInterfaceTypeAnnotation | BabelNodeIntersectionTypeAnnotation | BabelNodeMixedTypeAnnotation | BabelNodeEmptyTypeAnnotation | BabelNodeNullableTypeAnnotation | BabelNodeNumberLiteralTypeAnnotation | BabelNodeNumberTypeAnnotation | BabelNodeObjectTypeAnnotation | BabelNodeObjectTypeInternalSlot | BabelNodeObjectTypeCallProperty | BabelNodeObjectTypeIndexer | BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty | BabelNodeOpaqueType | BabelNodeQualifiedTypeIdentifier | BabelNodeStringLiteralTypeAnnotation | BabelNodeStringTypeAnnotation | BabelNodeSymbolTypeAnnotation | BabelNodeThisTypeAnnotation | BabelNodeTupleTypeAnnotation | BabelNodeTypeofTypeAnnotation | BabelNodeTypeAlias | BabelNodeTypeAnnotation | BabelNodeTypeCastExpression | BabelNodeTypeParameter | BabelNodeTypeParameterDeclaration | BabelNodeTypeParameterInstantiation | BabelNodeUnionTypeAnnotation | BabelNodeVariance | BabelNodeVoidTypeAnnotation;
type BabelNodeFlowType = BabelNodeAnyTypeAnnotation | BabelNodeArrayTypeAnnotation | BabelNodeBooleanTypeAnnotation | BabelNodeBooleanLiteralTypeAnnotation | BabelNodeNullLiteralTypeAnnotation | BabelNodeExistsTypeAnnotation | BabelNodeFunctionTypeAnnotation | BabelNodeGenericTypeAnnotation | BabelNodeInterfaceTypeAnnotation | BabelNodeIntersectionTypeAnnotation | BabelNodeMixedTypeAnnotation | BabelNodeEmptyTypeAnnotation | BabelNodeNullableTypeAnnotation | BabelNodeNumberLiteralTypeAnnotation | BabelNodeNumberTypeAnnotation | BabelNodeObjectTypeAnnotation | BabelNodeStringLiteralTypeAnnotation | BabelNodeStringTypeAnnotation | BabelNodeSymbolTypeAnnotation | BabelNodeThisTypeAnnotation | BabelNodeTupleTypeAnnotation | BabelNodeTypeofTypeAnnotation | BabelNodeUnionTypeAnnotation | BabelNodeVoidTypeAnnotation;
type BabelNodeFlowBaseAnnotation = BabelNodeAnyTypeAnnotation | BabelNodeBooleanTypeAnnotation | BabelNodeNullLiteralTypeAnnotation | BabelNodeMixedTypeAnnotation | BabelNodeEmptyTypeAnnotation | BabelNodeNumberTypeAnnotation | BabelNodeStringTypeAnnotation | BabelNodeSymbolTypeAnnotation | BabelNodeThisTypeAnnotation | BabelNodeVoidTypeAnnotation;
type BabelNodeFlowDeclaration = BabelNodeDeclareClass | BabelNodeDeclareFunction | BabelNodeDeclareInterface | BabelNodeDeclareModule | BabelNodeDeclareModuleExports | BabelNodeDeclareTypeAlias | BabelNodeDeclareOpaqueType | BabelNodeDeclareVariable | BabelNodeDeclareExportDeclaration | BabelNodeDeclareExportAllDeclaration | BabelNodeInterfaceDeclaration | BabelNodeOpaqueType | BabelNodeTypeAlias;
type BabelNodeFlowPredicate = BabelNodeDeclaredPredicate | BabelNodeInferredPredicate;
type BabelNodeEnumBody = BabelNodeEnumBooleanBody | BabelNodeEnumNumberBody | BabelNodeEnumStringBody | BabelNodeEnumSymbolBody;
type BabelNodeEnumMember = BabelNodeEnumBooleanMember | BabelNodeEnumNumberMember | BabelNodeEnumStringMember | BabelNodeEnumDefaultedMember;
type BabelNodeJSX = BabelNodeJSXAttribute | BabelNodeJSXClosingElement | BabelNodeJSXElement | BabelNodeJSXEmptyExpression | BabelNodeJSXExpressionContainer | BabelNodeJSXSpreadChild | BabelNodeJSXIdentifier | BabelNodeJSXMemberExpression | BabelNodeJSXNamespacedName | BabelNodeJSXOpeningElement | BabelNodeJSXSpreadAttribute | BabelNodeJSXText | BabelNodeJSXFragment | BabelNodeJSXOpeningFragment | BabelNodeJSXClosingFragment;
type BabelNodePrivate = BabelNodeClassPrivateProperty | BabelNodeClassPrivateMethod | BabelNodePrivateName;
type BabelNodeTSTypeElement = BabelNodeTSCallSignatureDeclaration | BabelNodeTSConstructSignatureDeclaration | BabelNodeTSPropertySignature | BabelNodeTSMethodSignature | BabelNodeTSIndexSignature;
type BabelNodeTSType = BabelNodeTSAnyKeyword | BabelNodeTSBooleanKeyword | BabelNodeTSBigIntKeyword | BabelNodeTSIntrinsicKeyword | BabelNodeTSNeverKeyword | BabelNodeTSNullKeyword | BabelNodeTSNumberKeyword | BabelNodeTSObjectKeyword | BabelNodeTSStringKeyword | BabelNodeTSSymbolKeyword | BabelNodeTSUndefinedKeyword | BabelNodeTSUnknownKeyword | BabelNodeTSVoidKeyword | BabelNodeTSThisType | BabelNodeTSFunctionType | BabelNodeTSConstructorType | BabelNodeTSTypeReference | BabelNodeTSTypePredicate | BabelNodeTSTypeQuery | BabelNodeTSTypeLiteral | BabelNodeTSArrayType | BabelNodeTSTupleType | BabelNodeTSOptionalType | BabelNodeTSRestType | BabelNodeTSUnionType | BabelNodeTSIntersectionType | BabelNodeTSConditionalType | BabelNodeTSInferType | BabelNodeTSParenthesizedType | BabelNodeTSTypeOperator | BabelNodeTSIndexedAccessType | BabelNodeTSMappedType | BabelNodeTSLiteralType | BabelNodeTSExpressionWithTypeArguments | BabelNodeTSImportType;
type BabelNodeTSBaseType = BabelNodeTSAnyKeyword | BabelNodeTSBooleanKeyword | BabelNodeTSBigIntKeyword | BabelNodeTSIntrinsicKeyword | BabelNodeTSNeverKeyword | BabelNodeTSNullKeyword | BabelNodeTSNumberKeyword | BabelNodeTSObjectKeyword | BabelNodeTSStringKeyword | BabelNodeTSSymbolKeyword | BabelNodeTSUndefinedKeyword | BabelNodeTSUnknownKeyword | BabelNodeTSVoidKeyword | BabelNodeTSThisType | BabelNodeTSLiteralType;
