"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

var parser = _interopRequireWildcard(require("@babel/parser"));

var _traverse = _interopRequireDefault(require("@babel/traverse"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const defaultOptions = {
  sourceType: 'module',
  plugins: ['flow']
};

function parse(code, options = defaultOptions) {
  const declarations = [];
  (0, _traverse.default)(parser.parse(code, options), {
    ExportNamedDeclaration(path) {
      const {
        type,
        async,
        id,
        params,
        generator
      } = path.node.declaration;
      if (type !== 'FunctionDeclaration' || params.length !== 1 || params[0].type !== 'Identifier' || params[0].name !== 'assert' || generator) return;
      const decl = {
        name: id.name,
        plan: 0
      };
      path.traverse({
        Identifier(path) {
          if (path.node.name !== 'assert' || path.parent.type !== 'MemberExpression' || path.parent.property.type !== 'NumericLiteral') return;
          decl.plan++;
        }

      });
      declarations.push(decl);
    }

  });
  return declarations;
}