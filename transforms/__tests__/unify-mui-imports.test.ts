import { defineInlineTest } from 'jscodeshift/src/testUtils'
import transformer from '../unify-mui-imports'

describe('unify mui imports', () => {
  defineInlineTest(
    transformer,
    {},
    "import Divider from '@mui/material/Divider'",
    'import { Divider } from "@mui/material";',
    'component with same default specifier as the module',
  )

  defineInlineTest(
    transformer,
    {},
    `
    import Divider from '@mui/material/Divider'
    import Grid from '@mui/material/Grid'
    `,
    'import { Divider, Grid } from "@mui/material";',
    'component creating new import declaration',
  )

  defineInlineTest(
    transformer,
    {},
    `
    import { Divider } from '@mui/material'
    import Grid from '@mui/material/Grid'
    `,
    "import { Divider, Grid } from '@mui/material';",
    'component reusing existent import declaration',
  )

  defineInlineTest(
    transformer,
    {},
    `
    import { Divider } from '@mui/material'
    import GridCustom from '@mui/material/Grid'
    `,
    "import { Divider, Grid as GridCustom } from '@mui/material';",
    'component with a custom default specifier reusing existent import declaration',
  )

  defineInlineTest(
    transformer,
    {},
    "import CheckBoxIcon from '@mui/icons-material/CheckBox'",
    'import { CheckBox as CheckBoxIcon } from "@mui/icons-material";',
    'icon with custom default specifier',
  )

  defineInlineTest(
    transformer,
    {},
    "import CheckBox from '@mui/icons-material/CheckBox'",
    'import { CheckBox } from "@mui/icons-material";',
    'icon with same default specifier as the module',
  )

  defineInlineTest(
    transformer,
    {},
    `
    import { CheckBox } from '@mui/icons-material'
    import Edit from '@mui/icons-material/Edit'
    `,
    "import { CheckBox, Edit } from '@mui/icons-material';",
    'icon with same default specifier as the module reusing existent import declaration',
  )

  defineInlineTest(
    transformer,
    {},
    `
    import { CheckBox } from '@mui/icons-material'
    import EditIcon from '@mui/icons-material/Edit'
    `,
    "import { CheckBox, Edit as EditIcon } from '@mui/icons-material';",
    'icon with custom default specifier reusing existent import declaration',
  )

  defineInlineTest(
    transformer,
    {},
    `
    import { CheckboxProps } from '@mui/material/Checkbox/Checkbox'
    import { emphasize } from '@mui/material/styles'
    `,
    `
    import { CheckboxProps } from '@mui/material/Checkbox/Checkbox'
    import { emphasize } from '@mui/material/styles'
    `,
    'the imports stay the same in case of named import specifiers',
  )
})
