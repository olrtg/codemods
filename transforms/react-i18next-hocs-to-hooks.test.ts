import { defineSnapshotTest } from 'jscodeshift/src/testUtils'
import transformer from './react-i18next-hocs-to-hooks'

describe('react-i18next HOCs to hooks', () => {
  defineSnapshotTest(
    transformer,
    {},
    "import { withTranslation } from 'react-i18next'",
  )
})
