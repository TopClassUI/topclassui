import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { readLibrary } from '../scripts/lib/registry-io.js'
import { buildRegistry, findCycle, isShipped, type Library } from '../scripts/lib/registry.js'

const LIBRARY = join(import.meta.dirname, '../../topclassui')

describe('the registry of the library in this repository', () => {
  const registry = buildRegistry(readLibrary(LIBRARY))
  const entry = (name: string) => registry.index.items.find((i) => i.name === name)

  it('builds with no errors: every specifier rewritable, every file present, no cycle, no stray package', () => {
    expect(registry.errors).toEqual([])
  })

  it('lists the 52 component folders and base', () => {
    expect(registry.index.items.length).toBe(53)
    expect(registry.index.items.filter((i) => i.type === 'registry:ui').length).toBe(52)
    expect(Object.keys(registry.icons).length).toBe(84)
  })

  it('records the dependencies between components of plan F2', () => {
    expect(entry('dialog')?.registryDependencies).toEqual(['svg'])
    expect(entry('toast')?.registryDependencies).toEqual(['button', 'svg'])
    expect(entry('avatar-group')?.registryDependencies).toEqual(['avatar'])
    expect(entry('icon-registry')?.registryDependencies).toEqual(['icon', 'svg'])
    expect(entry('svg')?.registryDependencies).toEqual([])
  })

  it('gives base the toast its provider renders', () => {
    expect(entry('base')?.registryDependencies).toEqual(['toast'])
    expect(entry('base')?.files).toContain('shared/provider/provider.tsx')
    expect(entry('base')?.files).not.toContain('shared/meta.ts')
    expect(entry('base')?.files).not.toContain('icons/loaders.generated.ts')
  })

  it('copies the icon loader map with icon only, which therefore needs all 84 icons', () => {
    expect(entry('icon')?.files).toEqual(['components/icon/index.tsx', 'components/icon/lib.ts', 'components/icon/types.ts', 'icons/loaders.generated.ts'])
    expect(entry('icon')?.icons.length).toBe(84)
    expect(entry('icon')?.dependencies).toEqual(['server-only'])
  })

  it('lists button with its own files and demos, never meta, README or tests', () => {
    const files = entry('button')?.files ?? []
    expect(files.filter((f) => !f.includes('/dummy/'))).toEqual([
      'components/button/boundaries.ts',
      'components/button/classes.ts',
      'components/button/constants.ts',
      'components/button/index.tsx',
      'components/button/schema.ts',
      'components/button/skeleton.tsx',
      'components/button/types.ts',
      'components/button/variants.ts',
    ])
    expect(entry('button')?.icons).toEqual(['spinner'])
    expect(entry('button')?.dependencies).toEqual(['class-variance-authority', 'react', 'zod'])
  })

  it('maps each dialog demo to the components it imports', () => {
    const dialog = registry.items.find((i) => i.name === 'dialog')
    expect(dialog?.meta.topclassui.examples['components/dialog/dummy/basic.tsx']).toEqual({ components: ['button', 'svg'], icons: ['x'] })
    expect(dialog?.meta.topclassui.examples['components/dialog/dummy/with-tooltip.tsx']).toEqual({
      components: ['button', 'input', 'svg', 'tooltip'],
      icons: ['copy', 'x'],
    })
  })

  it('writes items in the shadcn shape, ranges included', () => {
    const dialog = registry.items.find((i) => i.name === 'dialog')
    expect(dialog?.$schema).toBe('https://ui.shadcn.com/schema/registry-item.json')
    expect(dialog?.dependencies).toEqual(['@base-ui/react@1.8.0', 'react', 'zod@4.6.5'])
    expect(dialog?.files[0]?.target).toBe('~/topclassui/components/dialog/classes.ts')
    expect(dialog?.files[0]?.content).toContain('#shared/')
  })
})

function fake(files: Record<string, string>, dependencies: Record<string, string> = { zod: '4.6.5' }): Library {
  return { version: '0.0.0', dependencies, peers: { react: '^19.0.0' }, files: new Map(Object.entries(files)) }
}

describe('the build fails on what the copy could not handle', () => {
  it('a #test/ import, an unknown alias and a missing file', () => {
    const lib = fake({
      'components/a/index.tsx': "import { t } from '#test/render.js'\nimport { u } from '#utils/u.js'\nimport { m } from './missing.js'\n",
    })
    expect(buildRegistry(lib).errors).toEqual([
      "components/a/index.tsx: '#test/render.js' is not an alias the copy can rewrite",
      "components/a/index.tsx: '#utils/u.js' is not an alias the copy can rewrite",
      "components/a/index.tsx: './missing.js' names no file",
    ])
  })

  it('a package the library does not depend on', () => {
    const lib = fake({ 'components/a/index.tsx': "import x from 'lodash'\nimport { z } from 'zod/mini'\n" })
    expect(buildRegistry(lib).errors).toEqual(['components/a/index.tsx: imports lodash, which is not a dependency of the library'])
  })

  it('a cycle between components', () => {
    const lib = fake({
      'components/a/index.tsx': "export { b } from '#components/b/index.js'\n",
      'components/b/index.tsx': "export { a } from '#components/a/index.js'\n",
    })
    expect(buildRegistry(lib).errors).toEqual(['registry dependencies form a cycle: a -> b -> a'])
    expect(findCycle(new Map([['x', ['y']], ['y', []]]))).toBeNull()
  })

  it('a shipped file that names the package', () => {
    const lib = fake({ 'components/a/index.tsx': "export const hint = 'topclassui/button'\n" })
    expect(buildRegistry(lib).errors).toEqual(['components/a/index.tsx: names the topclassui package, which a copy may not have'])
  })

  it('never ships tests, READMEs or meta', () => {
    expect(['components/a/test/a.test.tsx', 'components/a/README.md', 'components/a/meta.ts', 'shared/meta.ts', 'shared/cn.test.ts'].map(isShipped)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ])
    expect(['components/a/index.tsx', 'components/a/dummy/basic.tsx', 'shared/cn.ts', 'tokens.css'].map(isShipped)).toEqual([true, true, true, true])
  })
})
