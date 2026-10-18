import { describe, expect, it } from 'vitest'

import { importsFromRepo } from './samples.js'

describe('importsFromRepo', () => {
  it('points a component subpath at its index in src', () => {
    expect(importsFromRepo("import { Button } from 'topclassui/button'")).toBe("import { Button } from '#components/button/index.js'")
    expect(importsFromRepo("import { Icon } from 'topclassui/icon'")).toBe("import { Icon } from '#components/icon/index.js'")
  })

  it('rewrites every line of a sample, in both quote styles', () => {
    const sample = [
      "import { Icon } from 'topclassui/icon'",
      'import { SidebarRoot } from "topclassui/sidebar"',
    ].join('\n')
    expect(importsFromRepo(sample)).toBe([
      "import { Icon } from '#components/icon/index.js'",
      'import { SidebarRoot } from "#components/sidebar/index.js"',
    ].join('\n'))
  })

  it('knows where the provider, the theme script, cn, classes and the icon surface live', () => {
    expect(importsFromRepo("from 'topclassui/provider'")).toBe("from '#shared/provider/provider.js'")
    expect(importsFromRepo("from 'topclassui/theme'")).toBe("from '#shared/theme/theme-script.js'")
    expect(importsFromRepo("from 'topclassui/cn'")).toBe("from '#shared/cn.js'")
    expect(importsFromRepo("from 'topclassui/classes'")).toBe("from '#shared/classes.js'")
    expect(importsFromRepo("from 'topclassui/icons'")).toBe("from '#icons/index.js'")
  })

  it('maps the pattern subpaths: a label file, an icon, a schema and a meta', () => {
    expect(importsFromRepo("from 'topclassui/labels/ar'")).toBe("from '#shared/labels/ar.js'")
    expect(importsFromRepo("from 'topclassui/icons/check'")).toBe("from '#icons/data/check.js'")
    expect(importsFromRepo("from 'topclassui/schemas/button'")).toBe("from '#components/button/schema.js'")
    expect(importsFromRepo("from 'topclassui/meta/button'")).toBe("from '#components/button/meta.js'")
  })

  it('leaves code with no package import as it is', () => {
    expect(importsFromRepo('<Button>Save</Button>')).toBe('<Button>Save</Button>')
  })

  it('throws on the bare package name, which has no root barrel', () => {
    expect(() => importsFromRepo("import { Button } from 'topclassui'"))
      .toThrow("importsFromRepo: 'topclassui' is not a subpath this repo can map; a sample imports from 'topclassui/<slug>'.")
  })

  it('throws on a subpath with a trailing slash and nothing after it', () => {
    expect(() => importsFromRepo("import { x } from 'topclassui/'")).toThrow("'topclassui/' is not a subpath")
  })
})
