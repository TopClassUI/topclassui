import { describe, expect, it } from 'vitest'

import { importRowsOf } from './highlight'

describe('the import lines of a sample', () => {
  it('marks every line of an import, from its import line through its from line', () => {
    expect(importRowsOf(["import {", '  DialogBody,', "} from 'topclassui/dialog'", "import 'x.css'", '', '<DialogRoot />'])).toEqual([true, true, true, true, false, false])
  })
})
