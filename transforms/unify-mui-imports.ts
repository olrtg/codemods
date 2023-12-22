import core, { API, Collection, FileInfo, ImportDeclaration } from 'jscodeshift'

function getImportWithSourceMatching(
  j: core.JSCodeshift,
  source: Collection<any>,
  searchString: string,
): Collection<ImportDeclaration> {
  return source.find(j.ImportDeclaration).filter(path => {
    const value = path.node.source.value
    if (typeof value !== 'string') return false
    return value.includes(searchString)
  })
}

export default function transformer(file: FileInfo, { jscodeshift: j }: API) {
  const root = j(file.source)

  // NOTE: COMPONENTS CASE
  const componentFinalImports = root.find(j.ImportDeclaration, {
    source: { value: '@mui/material' },
  })

  const componentImports = getImportWithSourceMatching(
    j,
    root,
    '@mui/material/',
  )

  const potentialSpecifiers = componentImports.paths().map(path => {
    const { value } = path.node.source
    if (typeof value !== 'string') return null
    return value.split('/').at(-1)!
  })

  const componentImportsDefaultSpecifiers = componentImports
    .find(j.ImportDefaultSpecifier)
    .paths()
    .map(path => {
      const { local } = path.node
      if (!local) return null
      return local.name
    })

  const specifiers = potentialSpecifiers
    .map((potentialSpecifier, index) => {
      if (!potentialSpecifier) return null

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
  } else {
    componentImports
      .get()
      .insertBefore(
        j.importDeclaration(specifiers, j.stringLiteral('@mui/material')),
      )
  }
  componentImports.remove()

  // NOTE: ICONS CASE
  const iconImports = getImportWithSourceMatching(
    j,
    root,
    '@mui/material-icons/',
  )
  const iconImportsDefaultSpecifiers = componentImports.find(
    j.ImportDefaultSpecifier,
  )

  return root.toSource()
}
