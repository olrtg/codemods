import { defineSnapshotTest } from 'jscodeshift/src/testUtils'
import transformer from './unify-mui-imports'

describe('unify mui imports', () => {
  defineSnapshotTest(
    transformer,
    {},
    `import Box from '@mui/material/Box'
    import Button from '@mui/material/Button'
    import Grid from '@mui/material/Grid'`,
    'converts to named imports',
  )

  defineSnapshotTest(
    transformer,
    {},
    `import Box from '@mui/material/Box'
    import Button from '@mui/material/Button'
    import { Grid } from '@mui/material'`,
    'converts to named imports using the existent import',
  )

  defineSnapshotTest(
    transformer,
    {},
    `import Box from '@mui/material/Box'
    import AliasedButton from '@mui/material/Button'
    import Grid from '@mui/material'`,
    'converts to named imports while using keeping the alias',
  )

  defineSnapshotTest(
    transformer,
    {},
    `import Box from '@mui/material/Box'
    import AliasedButton from '@mui/material/Button'
    import { Grid } from '@mui/material'`,
    'converts to named imports using the existent import while keeping the alias',
  )
})
