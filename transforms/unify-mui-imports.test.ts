import { defineSnapshotTest } from 'jscodeshift/src/testUtils'
import transformer from './unify-mui-imports'

describe('unify mui imports', () => {
  defineSnapshotTest(
    transformer,
    {},
    `import Box from '@mui/material/Box'
    import Button from '@mui/material/Button'
    import Grid from '@mui/material/Grid'
    import makeStyles from '@mui/styles/makeStyles'`,
  )
})
