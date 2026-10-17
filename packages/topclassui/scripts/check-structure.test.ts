import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

const PACKAGE = process.cwd()
const made: string[] = []
afterAll(() => { for (const dir of made) rmSync(dir, { recursive: true, force: true }) })

/** A package root holding only the component folders given, each file by its path under src/components. */
function fixture(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'tc-structure-'))
  made.push(root)
  for (const [path, source] of Object.entries(files)) {
    const file = join(root, 'src', 'components', path)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, source)
  }
  return root
}

/** The real script, run from the fixture as pnpm check:structure runs it from the package. */
function checkStructure(root: string) {
  const cli = join(PACKAGE, 'node_modules', 'tsx', 'dist', 'cli.mjs')
  const run = spawnSync(process.execPath, [cli, join(PACKAGE, 'scripts', 'check-structure.ts')], { cwd: root, encoding: 'utf8' })
  return { status: run.status, errors: run.stderr.split('\n').filter((line) => line.startsWith('error ')) }
}

const folder = (slug: string, index: string, extra: Record<string, string> = {}) => ({
  [`${slug}/index.tsx`]: index,
  [`${slug}/meta.ts`]: '',
  [`${slug}/README.md`]: '',
  [`${slug}/test/${slug}.test.ts`]: '',
  ...Object.fromEntries(Object.entries(extra).map(([file, source]) => [`${slug}/${file}`, source])),
})

describe('check-structure, run on a fixture package', () => {
  const overlay = (slug: string, name: string, parts: string[]) =>
    folder(slug, `export { ${parts.map((p) => `${name}${p}`).join(', ')} } from './client.js'\n`)

  const root = fixture({
    ...overlay('dialog', 'Dialog', ['Root', 'Header', 'Footer']),
    ...overlay('drawer', 'Drawer', ['Root', 'Header', 'Body', 'Footer']),
    ...folder('card', "export { CardRoot } from './client.js'\n", {
      'client.tsx': "'use client'\nexport function CardRoot() { return null }\n",
      'hook.ts': "import { createContext } from 'react'\nexport const CardContext = createContext(0)\n",
      'lib.tsx': 'export const map = { a: 1 }\n',
      'parts/card-body.tsx': 'export function CardBody() { return null }\n',
      'parts/card-body.test.tsx': '',
    }),
  })
  const { status, errors } = checkStructure(root)

  it('fails', () => {
    expect(status).toBe(1)
  })

  it('reports a scrolling overlay with no Body, and passes the one with all four parts', () => {
    expect(errors).toContain('error src/components/dialog: index.tsx does not export DialogBody, a part every scrolling overlay has. (R-9.2-4)')
    expect(errors.filter((line) => line.includes('src/components/drawer'))).toEqual([])
  })

  it('reports an exported context in hook.ts and a table in lib.tsx', () => {
    expect(errors).toContain('error src/components/card/hook.ts: exports CardContext (context); hook.ts exports only use* hooks. (R-5.12-4)')
    expect(errors).toContain('error src/components/card/lib.tsx: exports map (value); lib.tsx exports only functions. (R-5.12-4)')
  })

  it('reports a test inside parts/ once, and passes the part beside it', () => {
    expect(errors.filter((line) => line.includes('/parts/'))).toEqual([
      'error src/components/card/parts/card-body.test.tsx: tests live in test/, not parts/ (R-8.1-1).',
    ])
  })
})
