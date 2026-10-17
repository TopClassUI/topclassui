import { describe, expect, it } from 'vitest'

import { PLANNED_EXPORTS } from '../scripts/lib/planned-exports.js'
import { distPathOf, namesBareRoot, publicSubpath, rewriteImports, specifiersOf } from './rewrite-imports.js'

const rewrite = (source: string, slug = 'button') => rewriteImports(source, slug, PLANNED_EXPORTS)

describe('rewriteImports, against the release plan exports map', () => {
  it('maps the component itself, and its types and skeleton, to its subpath', () => {
    expect(rewrite("import { Button } from '../index.js'").code).toBe("import { Button } from 'topclassui/button'")
    expect(rewrite("import { ButtonSkeleton } from '../skeleton.js'").code).toBe("import { ButtonSkeleton } from 'topclassui/button'")
    expect(rewrite("import type { DialogPopupProps } from '../types.js'", 'dialog').code)
      .toBe("import type { DialogPopupProps } from 'topclassui/dialog'")
  })

  it('maps another component to its own subpath', () => {
    expect(rewrite("import { Kbd } from '#components/kbd/index.js'", 'command').code).toBe("import { Kbd } from 'topclassui/kbd'")
    expect(rewrite("import { SegmentedControl } from '#components/segmented-control/index.js'").code)
      .toBe("import { SegmentedControl } from 'topclassui/segmented-control'")
  })

  it('maps icon data and the icon types', () => {
    expect(rewrite("import { arrowRight } from '#icons/data/arrow-right.js'").code)
      .toBe("import { arrowRight } from 'topclassui/icons/arrow-right'")
    expect(rewrite("import type { IconData } from '#icons/types.js'", 'command').code)
      .toBe("import type { IconData } from 'topclassui/icons'")
  })

  it('maps each shared module to the public subpath that exports it', () => {
    expect(rewrite("import { TopClassProvider } from '#shared/provider/provider.js'").code)
      .toBe("import { TopClassProvider } from 'topclassui/provider'")
    expect(rewrite("import { ar } from '#shared/labels/ar.js'").code).toBe("import { ar } from 'topclassui/labels/ar'")
    expect(rewrite("import { getLabels } from '#shared/labels/get-labels.js'").code)
      .toBe("import { getLabels } from 'topclassui/labels/get-labels'")
    expect(rewrite("import { cn } from '#shared/cn.js'").code).toBe("import { cn } from 'topclassui/cn'")
    expect(rewrite("import { FOCUS_RING } from '#shared/classes.js'").code).toBe("import { FOCUS_RING } from 'topclassui/classes'")
  })

  it('leaves a package import alone and rewrites a multi-line import', () => {
    const source = "import { useState } from 'react'\nimport {\n  TabsList,\n  TabsRoot,\n} from '../index.js'\n"
    expect(rewrite(source, 'tabs')).toEqual({
      code: "import { useState } from 'react'\nimport {\n  TabsList,\n  TabsRoot,\n} from 'topclassui/tabs'\n",
      unresolved: [],
    })
  })

  it('reports a specifier with no public subpath and leaves it as written', () => {
    expect(rewrite("import { BUTTON_TONES } from '../constants.js'\nimport { x } from './other.js'\nimport { y } from '#shared/contracts/size.js'"))
      .toEqual({
        code: "import { BUTTON_TONES } from '../constants.js'\nimport { x } from './other.js'\nimport { y } from '#shared/contracts/size.js'",
        unresolved: ['../constants.js', './other.js', '#shared/contracts/size.js'],
      })
  })

  it('does not touch an import written inside a string', () => {
    const source = "const CODE = `import { CodeBlock } from 'topclassui/code-block'`"
    expect(rewrite(source, 'code-block').code).toBe(source)
  })
})

describe('publicSubpath', () => {
  it('prefers an exact key to a pattern', () => {
    expect(publicSubpath('./dist/icons/index.js', PLANNED_EXPORTS)).toBe('topclassui/icons')
  })

  it('never lets a wildcard span a folder', () => {
    expect(publicSubpath('./dist/components/button/dummy/variants.js', PLANNED_EXPORTS)).toBeNull()
    expect(publicSubpath('./dist/components/button/index.js', PLANNED_EXPORTS)).toBe('topclassui/button')
  })

  it('reads a plain string target as well as a condition object', () => {
    expect(publicSubpath('./dist/x.js', { './x': './dist/x.js' })).toBe('topclassui/x')
  })
})

describe('distPathOf', () => {
  it('returns null for a package or a sibling demo', () => {
    expect(distPathOf('react', 'button')).toBeNull()
    expect(distPathOf('./other.js', 'button')).toBeNull()
  })
})

describe('specifiersOf and namesBareRoot', () => {
  it('lists static, dynamic and side-effect imports in order', () => {
    expect(specifiersOf("import 'a.css'\nimport { b } from 'b'\nconst c = await import('c')")).toEqual(['a.css', 'b', 'c'])
  })

  it('finds the bare root in an import and in a string, but not a subpath or a command', () => {
    expect(namesBareRoot("import { CodeBlock } from 'topclassui'")).toBe(true)
    expect(namesBareRoot('<span>{`\'topclassui\'`}</span>')).toBe(true)
    expect(namesBareRoot('const a = "topclassui"')).toBe(true)
    expect(namesBareRoot("import { Button } from 'topclassui/button'")).toBe(false)
    expect(namesBareRoot('<p>Run npx topclassui add accordion.</p>')).toBe(false)
  })
})
