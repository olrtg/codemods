import { API, FileInfo } from 'jscodeshift'

function isReactComponent(name: string) {
  const firstChar = name[0]
  return firstChar === firstChar.toUpperCase()
}

export default function transformer(file: FileInfo, { jscodeshift: j }: API) {
  const root = j(file.source)

  const imports = root.find(j.ImportDeclaration, {
    source: { value: 'react-i18next' },
  })

  imports
    .find(j.ImportSpecifier, {
      imported: { name: 'withTranslation' },
    })
    .replaceWith(j.importSpecifier(j.identifier('useTranslation')))

  root
    .find(j.ExportDefaultDeclaration)
    .find(j.CallExpression, { callee: { name: 'withTranslation' } })
    .remove()

  const fnComponents = root.find(j.FunctionDeclaration).filter(path => {
    if (!path.node.id) return false
    return isReactComponent(path.node.id.name)
  })

  fnComponents.find(j.ObjectProperty)

  fnComponents.find(j.BlockStatement).forEach(path => {
    const t = j.objectProperty(j.identifier('t'), j.identifier('t'))
    t.shorthand = true

    const newHook = j.variableDeclaration('const', [
      j.variableDeclarator(
        j.objectPattern([t]),
        j.callExpression(j.identifier('useTranslation'), []),
      ),
    ])

    j(path).replaceWith(j.blockStatement([newHook, ...path.node.body]))
  })

  root.find(j.VariableDeclarator).filter(path => {
    if (path.node.id.type !== 'Identifier') return false
    return isReactComponent(path.node.id.name)
  })

  return root.toSource()
}
