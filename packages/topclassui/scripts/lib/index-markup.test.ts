import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { indexMarkupViolations, isClientRendering, isCoveredFolder, type ReadSibling } from './index-markup.js'

const SRC = join(process.cwd(), 'src')
const readAt = (folder: string): ReadSibling => (p) =>
  (existsSync(join(SRC, folder, p)) ? readFileSync(join(SRC, folder, p), 'utf8') : undefined)
const coveredFolders = ['components', 'connectors'].flatMap((root) =>
  readdirSync(join(SRC, root), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => `${root}/${e.name}`)
    .filter((folder) => isCoveredFolder(`src/${folder}`, readAt(folder)('meta.ts'))))

/** A folder made of the files given, each with the source given. */
const folder = (files: Record<string, string>): ReadSibling => (p) => files[p]

const SIBLINGS = folder({
  'client.tsx': "'use client'\nexport function DialogRoot() { return null }\n",
  'types.ts': 'export type DialogRootProps = object\n',
  'variants.ts': 'export const dialogVariants = 1\n',
  'skeleton.tsx': 'export function DialogSkeleton() { return <span /> }\n',
  'lib.ts': 'export const toast = 1\n',
  'parts/dialog-close.tsx': "'use client'\nexport function DialogClose() { return null }\n",
  'parts/dialog-title.tsx': 'export function DialogTitle() { return <h2 /> }\n',
})

const crlf = (s: string) => s.replace(/\n/g, '\r\n')

describe.each([
  ['LF', (s: string) => s],
  ['CRLF', crlf],
])('%s line endings', (_name, fix) => {
  const check = (lines: string[]) => indexMarkupViolations(fix([...lines, ''].join('\n')), SIBLINGS)

  it('accepts re-exports of the client parts, the types, the variants and the skeleton', () => {
    expect(check([
      '// R-5.1-2: re-exports only.',
      "export { DialogRoot } from './client.js'",
      "export type { DialogRootProps } from './types.js'",
      "export { dialogVariants } from './variants.js'",
      "export { DialogSkeleton } from './skeleton.js'",
      "export { toast } from './lib.js'",
      "export { DialogClose } from './parts/dialog-close.js'",
      "import type { IconName } from '#icons/names.generated.js'",
    ])).toEqual([])
  })

  it('accepts a type re-export from any file of the folder, since it erases', () => {
    expect(check([
      "export type { DialogTitle } from './parts/dialog-title.js'",
      "export { type DialogRootProps } from './types.js'",
    ])).toEqual([])
  })

  it('rejects a component that renders markup', () => {
    expect(check([
      "export { DialogRoot } from './client.js'",
      'export function Switch() { return <span /> }',
    ])).toEqual(['line 2: markup'])
  })

  it('rejects a fragment returned from an arrow function', () => {
    expect(check(['export const A = () => <></>'])).toEqual(['line 1: markup'])
  })

  it('rejects a local wrapper even when it holds no JSX', () => {
    expect(check([
      "import { DialogRoot } from './client.js'",
      'export const Switch = DialogRoot',
    ])).toEqual([
      'line 1: a statement that is not a re-export',
      'line 2: a statement that is not a re-export',
    ])
  })

  it('rejects a re-export from outside the folder, which hides markup elsewhere', () => {
    expect(check(["export { Button } from '#components/button/index.js'"]))
      .toEqual(['line 1: a re-export from outside the folder'])
  })

  it('rejects a ./ specifier that steps out of the folder', () => {
    expect(check([
      "export { Button } from './../button/index.js'",
      "export { Card } from './parts/../../card/index.js'",
    ])).toEqual([
      'line 1: a re-export from outside the folder',
      'line 2: a re-export from outside the folder',
    ])
  })

  it('rejects a value re-export from a directive-less file holding markup', () => {
    const withLibTsx = folder({ 'lib.tsx': 'export function Row() { return <li /> }\n' })
    expect(indexMarkupViolations(fix("export { Row } from './lib.js'\n"), withLibTsx)).toEqual([
      "line 1: a value re-export from lib.tsx, which is not client, variants, skeleton, lib.ts or a 'use client' file",
    ])
    expect(check([
      "export { DialogTitle } from './parts/dialog-title.js'",
      "export * from './parts/dialog-title.js'",
    ])).toEqual([
      "line 1: a value re-export from parts/dialog-title.tsx, which is not client, variants, skeleton, lib.ts or a 'use client' file",
      "line 2: a value re-export from parts/dialog-title.tsx, which is not client, variants, skeleton, lib.ts or a 'use client' file",
    ])
  })

  it('rejects a re-export from a file the folder does not have', () => {
    expect(check(["export { X } from './hook.js'"]))
      .toEqual(['line 1: a re-export from ./hook.js, which the folder does not have'])
  })
})

describe('isClientRendering', () => {
  it('reads C from meta.ts', () => {
    expect(isClientRendering("export const meta = {\n  rendering: 'client',\n}\n")).toBe(true)
    expect(isClientRendering('export const meta = { rendering: "client" } satisfies X\n')).toBe(true)
  })

  it('leaves S and Sp alone', () => {
    expect(isClientRendering("export const meta = { rendering: 'server' }\n")).toBe(false)
    expect(isClientRendering("export const meta = { rendering: 'split' }\n")).toBe(false)
  })

  it('ignores a comment that names client', () => {
    expect(isClientRendering("// rendering: 'client'\nexport const meta = { rendering: 'split' }\n")).toBe(false)
  })
})

describe('isCoveredFolder', () => {
  it('covers every connector, whatever its meta says', () => {
    expect(isCoveredFolder('src/connectors/adaptive-menu', undefined)).toBe(true)
    expect(isCoveredFolder('src/connectors/adaptive-menu', "export const meta = { rendering: 'split' }\n")).toBe(true)
  })

  it('covers a component whose meta says C, and no other', () => {
    expect(isCoveredFolder('src/components/dialog', "export const meta = { rendering: 'client' }\n")).toBe(true)
    expect(isCoveredFolder('src/components/banner', "export const meta = { rendering: 'split' }\n")).toBe(false)
    expect(isCoveredFolder('src/components/button', undefined)).toBe(false)
  })
})

describe('the tree', () => {
  it('finds the C components, so the walk cannot pass by finding none', () => {
    expect(coveredFolders).toContain('components/dialog')
    expect(coveredFolders).toContain('components/icon-registry')
    expect(coveredFolders).not.toContain('components/button')
  })

  it.each(coveredFolders)('%s/index.tsx re-exports only', (dir) => {
    expect(indexMarkupViolations(readAt(dir)('index.tsx') ?? '', readAt(dir))).toEqual([])
  })
})
