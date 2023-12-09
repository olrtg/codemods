import { API, FileInfo } from 'jscodeshift'

export default function transformer(file: FileInfo, { jscodeshift: j }: API) {
  const root = j(file.source)

  const imports = root.find(j.ImportDeclaration, {
    source: { value: 'react-i18next' },
  })

  const hocsImports = imports.find(j.ImportSpecifier, {
    imported: { name: 'withTranslation' },
  })

  return root.toSource()
}
