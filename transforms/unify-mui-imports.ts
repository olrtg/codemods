import core, { API, Collection, FileInfo, ImportDeclaration } from 'jscodeshift'

function getImportWithSourceMatching(
  j: core.JSCodeshift,
  source: Collection<any>,
  searchString: string,
): Collection<ImportDeclaration> {
  return source.find(j.ImportDeclaration).filter(path => {
    const value = path.node.source.value
    if (typeof value !== 'string') return false
    // Leave imports with import specifiers as is
    if (path.node.specifiers?.some(i => i.type === 'ImportSpecifier'))
      return false
    return value.startsWith(searchString)
  })
}

function convertToNamedImport(
  j: core.JSCodeshift,
  source: Collection<any>,
  importSource: string,
) {
  const componentFinalImports = source.find(j.ImportDeclaration, {
    source: { value: importSource },
  })

  const componentImports = getImportWithSourceMatching(
    j,
    source,
    `${importSource}/`,
  )

  const potentialSpecifiers = componentImports.paths().map(path => {
    const { value } = path.node.source
    if (typeof value !== 'string') return
    return value.split('/').at(-1)
  })

  const componentImportsDefaultSpecifiers = componentImports
    .find(j.ImportDefaultSpecifier)
    .paths()
    .map(path => {
      const { local } = path.node
      if (!local) return
      return local.name
    })

  const specifiers = potentialSpecifiers
    .map((potentialSpecifier, index) => {
      if (!potentialSpecifier) return

      const defaultSpecifier = componentImportsDefaultSpecifiers[index]

      if (defaultSpecifier && defaultSpecifier !== potentialSpecifier) {
        return j.importSpecifier(
          j.identifier(potentialSpecifier),
          j.identifier(defaultSpecifier),
        )
      }

      return j.importSpecifier(j.identifier(potentialSpecifier))
    })
    .filter(Boolean)

  if (componentFinalImports.length) {
    componentFinalImports.forEach(path => {
      j(path).replaceWith(
        j.importDeclaration(
          [...path.node.specifiers!, ...specifiers],
          path.node.source,
        ),
      )
    })
  } else if (componentImports.length) {
    componentImports
      .get()
      .insertBefore(
        j.importDeclaration(specifiers, j.stringLiteral(importSource)),
      )
  }

  componentImports.remove()
}

export default function transformer(file: FileInfo, { jscodeshift: j }: API) {
  const root = j(file.source)

  convertToNamedImport(j, root, '@mui/material')
  convertToNamedImport(j, root, '@mui/icons-material')
  convertToNamedImport(j, root, '@mui/styles')
  convertToNamedImport(j, root, '@mui/lab')

  return root.toSource()
}
