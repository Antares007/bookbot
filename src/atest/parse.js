// @flow
import * as parser from '@babel/parser'
import traverse from '@babel/traverse'

const defaultOptions = {
  sourceType: 'module',
  plugins: ['flow']
}

export function parse(
  code: string,
  options?: typeof defaultOptions = defaultOptions
): Array<{
  name: string,
  plan: number
}> {
  const declarations = []
  traverse(parser.parse(code, options), {
    ExportNamedDeclaration(path) {
      const { type, async, id, params, generator } = path.node.declaration
      if (
        type !== 'FunctionDeclaration' ||
        params.length !== 1 ||
        params[0].type !== 'Identifier' ||
        params[0].name !== 'assert' ||
        generator
      )
        return
      const decl = { name: id.name, plan: 0 }
      path.traverse({
        Identifier(path) {
          if (
            path.node.name !== 'assert' ||
            path.parent.type !== 'MemberExpression' ||
            path.parent.property.type !== 'NumericLiteral'
          )
            return
          decl.plan++
        }
      })
      declarations.push(decl)
    }
  })
  return declarations
}
