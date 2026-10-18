import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { INDEX_MARKUP_EXEMPT, indexMarkupViolations, isClientRendering } from './index-markup.js'

const COMPONENTS = join(process.cwd(), 'src', 'components')
const read = (slug: string, file: string) => readFileSync(join(COMPONENTS, slug, file), 'utf8')
const clientSlugs = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((e) => e.isDirectory() && isClientRendering(read(e.name, 'meta.ts')))
  .map((e) => e.name)

const crlf = (s: string) => s.replace(/\n/g, '\r\n')

describe.each([
  ['LF', (s: string) => s],
  ['CRLF', crlf],
])('%s line endings', (_name, fix) => {
  it('accepts re-exports of the client parts, the types, the variants and the skeleton', () => {
    const source = fix([
      '// R-5.1-2: re-exports only.',
      "export { DialogRoot, DialogPopup } from './client.js'",
      "export type { DialogRootProps } from './types.js'",
      "export { dialogVariants } from './variants.js'",
      "export { DialogSkeleton } from './skeleton.js'",
      "import type { IconName } from '#icons/names.generated.js'",
      '',
    ].join('\n'))
    expect(indexMarkupViolations(source)).toEqual([])
  })

  it('rejects a component that renders markup', () => {
    const source = fix([
      "export { SwitchRoot } from './client.js'",
      "export function Switch() { return <span /> }",
      '',
    ].join('\n'))
    expect(indexMarkupViolations(source)).toEqual(['line 2: markup'])
  })

  it('rejects a fragment returned from an arrow function', () => {
    expect(indexMarkupViolations(fix('export const A = () => <></>\n'))).toEqual(['line 1: markup'])
  })

  it('rejects a local wrapper even when it holds no JSX', () => {
    const source = fix([
      "import { SwitchRoot } from './client.js'",
      'export const Switch = SwitchRoot',
      '',
    ].join('\n'))
    expect(indexMarkupViolations(source)).toEqual([
      'line 1: a statement that is not a re-export',
      'line 2: a statement that is not a re-export',
    ])
  })

  it('rejects a re-export from outside the folder, which hides markup elsewhere', () => {
    expect(indexMarkupViolations(fix("export { Button } from '#components/button/index.js'\n")))
      .toEqual(['line 1: a statement that is not a re-export'])
  })
})

describe('isClientRendering', () => {
  it('reads C from meta.ts', () => {
    expect(isClientRendering("  rendering: 'client',\n")).toBe(true)
    expect(isClientRendering('  rendering: "client",\n')).toBe(true)
  })

  it('leaves S and Sp alone', () => {
    expect(isClientRendering("  rendering: 'server',\n")).toBe(false)
    expect(isClientRendering("  rendering: 'split',\n")).toBe(false)
  })
})

describe('the tree', () => {
  it('finds the C components, so the walk cannot pass by finding none', () => {
    expect(clientSlugs).toContain('dialog')
    expect(clientSlugs).toContain('tooltip')
    expect(clientSlugs).not.toContain('button')
  })

  it.each(clientSlugs.filter((s) => !INDEX_MARKUP_EXEMPT.has(s)))('%s/index.tsx re-exports only', (slug) => {
    expect(indexMarkupViolations(read(slug, 'index.tsx'))).toEqual([])
  })

  it('keeps each exemption earned: the exempt entry still holds markup', () => {
    for (const slug of INDEX_MARKUP_EXEMPT) {
      expect(indexMarkupViolations(read(slug, 'index.tsx')).some((v) => v.endsWith(': markup'))).toBe(true)
    }
  })
})
