// Plan 4, "Copy test, offline": init and add in a copy of each fixture against a freshly built registry,
// a written-out snapshot of the tree, and a type-check of the copied code with the fixture's own options.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import ts from 'typescript'
import { beforeAll, describe, expect, it } from 'vitest'

import { readLibrary, writeRegistry } from '../scripts/lib/registry-io.js'
import { buildRegistry } from '../scripts/lib/registry.js'
import type { Context } from '../src/context.js'
import { nodeFiles } from '../src/lib/files.js'
import { sha256 } from '../src/lib/lock.js'
import { jsoncReader } from '../src/lib/tsconfig.js'
import { main } from '../src/main.js'

const HERE = import.meta.dirname
// Inside packages/cli, so the copies resolve react, @base-ui/react and zod from its node_modules.
const TMP = join(HERE, '../.tmp/copy')
const FIXTURES = ['next-app', 'vite-react'] as const

let registry = ''

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function context(cwd: string, lines: string[]): Context {
  return {
    cwd: cwd.split(sep).join('/'),
    env: {},
    tty: false,
    files: nodeFiles,
    registry,
    out: (line) => lines.push(line),
    err: (line) => lines.push(`ERR ${line}`),
    ask: () => Promise.reject(new Error('a non-interactive run asked a question')),
    run: () => Promise.reject(new Error('--no-install ran the package manager')),
    readProject: () => jsoncReader(nodeFiles),
  }
}

async function cli(cwd: string, ...args: string[]): Promise<{ code: number; out: string }> {
  const lines: string[] = []
  const code = await main([...args, '--pm', 'npm'], context(cwd, lines))
  return { code, out: lines.join('\n') }
}

/** The copied tree as text: each path with the first 12 hex digits of its hash. */
function tree(folder: string): string {
  return walk(folder)
    .map((f) => `${relative(folder, f).split(sep).join('/')}  ${sha256(readFileSync(f, 'utf8')).slice(0, 12)}`)
    .sort()
    .join('\n')
}

function typeErrors(app: string, config: string, folder: string, types: string[]): string[] {
  const read = ts.readConfigFile(join(app, config), (p) => ts.sys.readFile(p))
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, app)
  // vite/client is the app's business; next-env.d.ts brings next's types, and with them Node's.
  const options = { ...parsed.options, types, noEmit: true, incremental: false, tsBuildInfoFile: undefined }
  const roots = walk(folder).filter((f) => /\.tsx?$/.test(f))
  const program = ts.createProgram(roots, options)
  return ts.getPreEmitDiagnostics(program).map((d) => {
    const where = d.file === undefined ? '' : `${relative(app, d.file.fileName)}: `
    return `${where}${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`
  })
}

beforeAll(() => {
  rmSync(TMP, { recursive: true, force: true })
  mkdirSync(TMP, { recursive: true })
  const built = buildRegistry(readLibrary(join(HERE, '../../topclassui')))
  expect(built.errors).toEqual([])
  registry = writeRegistry(built, TMP).split(sep).join('/')
})

describe.each(FIXTURES)('%s', (fixture) => {
  const app = join(TMP, fixture)
  const folder = join(app, 'src/topclassui')
  const css = fixture === 'next-app' ? 'src/app/globals.css' : 'src/index.css'

  beforeAll(() => {
    cpSync(join(HERE, 'fixtures', fixture), app, { recursive: true })
  })

  it('init, add button, add dialog, add select toast: each exits 0 without asking or installing', async () => {
    const init = await cli(app, 'init', '--yes', '--no-install')
    expect(init.code, init.out).toBe(0)
    // The ranges are the library's own, exact here and carets once the published manifest lands.
    expect(init.out).toMatch(/^Install them with: npm install @base-ui\/react@\S+ class-variance-authority@\S+ clsx@\S+ tailwind-merge@\S+ zod@\S+$/m)
    expect((await cli(app, 'add', 'button', '--yes', '--no-install')).code).toBe(0)
    const dialog = await cli(app, 'add', 'dialog', '--yes', '--no-install')
    expect(dialog.code, dialog.out).toBe(0)
    expect(dialog.out).toContain('dialog → src/topclassui/components/dialog/')
    expect(dialog.out).toContain('skipped components/dialog/dummy/with-tooltip.tsx: needs input, tooltip (--examples adds them)')
    expect((await cli(app, 'add', 'select', 'toast', '--yes', '--no-install')).code).toBe(0)
  })

  it('writes the tree, the CSS entry and topclassui.json of the snapshot', async () => {
    const config = readFileSync(join(app, 'topclassui.json'), 'utf8')
    const snapshot = [`# ${fixture}: the copied tree`, tree(folder), `# ${css}`, readFileSync(join(app, css), 'utf8'), '# topclassui.json', config].join('\n')
    await expect(snapshot).toMatchFileSnapshot(`snapshots/${fixture}.txt`)
  })

  it('leaves no alias and no package import in the copies', () => {
    const offenders = walk(folder).filter((f) => /from\s+['"](#shared\/|#icons\/|#components\/|topclassui)/.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })

  it(fixture === 'next-app' ? "keeps every 'use client'" : "strips every 'use client'", () => {
    const clients = walk(folder).filter((f) => /^['"]use client['"]/.test(readFileSync(f, 'utf8'))).map((f) => relative(folder, f).split(sep).join('/'))
    if (fixture === 'next-app') {
      expect(clients).toContain('components/dialog/client.tsx')
      expect(clients).toContain('shared/provider/provider.tsx')
      expect(clients.length).toBe(29)
    } else expect(clients).toEqual([])
  })

  it('type-checks the copied tree under the fixture compiler options', () => {
    const errors = fixture === 'next-app' ? typeErrors(app, 'tsconfig.json', folder, ['node']) : typeErrors(app, 'tsconfig.app.json', folder, [])
    expect(errors).toEqual([])
  })

  it('writes nothing when the same component is added again', async () => {
    const before = tree(folder)
    const again = await cli(app, 'add', 'dialog', '--yes', '--no-install')
    expect(again.code).toBe(0)
    expect(again.out).toContain('dialog → src/topclassui/components/dialog/, up to date')
    expect(tree(folder)).toBe(before)
  })

  it('reports a local edit through diff, exit 1, and add leaves it alone', async () => {
    const file = join(folder, 'components/dialog/classes.ts')
    writeFileSync(file, `${readFileSync(file, 'utf8')}// mine\n`)
    const result = await cli(app, 'diff', 'dialog')
    expect(result.code).toBe(1)
    expect(result.out).toContain('components/dialog/classes.ts: modified locally')
    expect((await cli(app, 'add', 'dialog', '--yes', '--no-install')).code).toBe(0)
    expect(readFileSync(file, 'utf8').endsWith('// mine\n')).toBe(true)
    const clean = await cli(app, 'diff', 'button')
    expect([clean.code, clean.out.split('\n').slice(1)]).toEqual([0, ['button: up to date']])
  })
})
