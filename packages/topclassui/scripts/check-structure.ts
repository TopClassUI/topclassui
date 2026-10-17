// R-8.1-1, R-5.12-2, R-5.12-4, R-9.2-4, R-8.5-1: the folder contract, file size, naming and the collection contract.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'

import { collectionErrors } from './lib/collections.js'
import { FAIL_LINES, WARN_LINES, countLines, sizeVerdict, sourceFilesUnder } from './lib/file-sizes.js'
import { inlinePropInterfaces, screamingConstants } from './lib/source-checks.js'

const ROOT = process.cwd()
const COMPONENTS = join(ROOT, 'src', 'components')
const CONNECTORS = join(ROOT, 'src', 'connectors')

/** Every file a component folder may contain. A file exists only if it is needed. */
const ALLOWED_FILES = new Set([
  'index.tsx',
  'client.tsx',
  'hook.ts',
  'lib.ts',
  'lib.tsx',
  'variants.ts',
  'classes.ts',
  'constants.ts',
  'boundaries.ts',
  'types.ts',
  'schema.ts',
  'skeleton.tsx',
  'empty-state.tsx',
  'error-state.tsx',
  'meta.ts',
  'README.md',
])

const ALLOWED_DIRS = new Set(['dummy', 'parts', 'test'])

/** Names Next.js reserves in app/, which a component folder must never use. */
const RESERVED = new Map([
  ['loading.tsx', 'skeleton.tsx'],
  ['error.tsx', 'error-state.tsx'],
  ['page.tsx', 'index.tsx'],
  ['layout.tsx', 'index.tsx'],
  ['states.tsx', 'empty-state.tsx and error-state.tsx'],
  ['demos', 'dummy'],
])

const errors: string[] = []
const warnings: string[] = []

const rel = (p: string) => relative(ROOT, p).split(sep).join(posix.sep)

function listDir(dir: string) {
  try {
    return readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

function isKebab(name: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)
}

function checkFileSize(file: string) {
  const lines = countLines(file)
  const verdict = sizeVerdict(lines)
  if (verdict === 'fail') errors.push(`${rel(file)}: ${lines} lines, over the ${FAIL_LINES} limit (R-5.12-2). Move parts into parts/.`)
  else if (verdict === 'warn') warnings.push(`${rel(file)}: ${lines} lines, over the ${WARN_LINES} warning line (R-5.12-2).`)
}

function checkComponentFolder(dir: string, slug: string) {
  if (!isKebab(slug)) errors.push(`${rel(dir)}: folder names are kebab-case (R-5.12-4).`)

  const entries = listDir(dir)
  const files = entries.filter((e) => e.isFile()).map((e) => e.name)
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

  if (!files.includes('index.tsx')) errors.push(`${rel(dir)}: index.tsx is required (R-8.1-1).`)
  if (!files.includes('meta.ts')) errors.push(`${rel(dir)}: meta.ts is required (R-8.1-2).`)
  if (!files.includes('README.md')) errors.push(`${rel(dir)}: README.md is required. Run pnpm readme:build (R-8.1-3).`)

  // R-8.1-1 names index.test.tsx as required, so a folder can never ship untested.
  const ownTests = files.filter((f) => /\.test\.tsx?$/.test(f))
  const folderTests = dirs.includes('test')
    ? listDir(join(dir, 'test')).filter((e) => e.isFile() && /\.test\.tsx?$/.test(e.name))
    : []
  if (ownTests.length + folderTests.length === 0) {
    errors.push(`${rel(dir)}: has no test file, in the folder or in test/ (R-8.1-1).`)
  }

  for (const name of [...files, ...dirs]) {
    const replacement = RESERVED.get(name)
    if (replacement) {
      errors.push(`${rel(join(dir, name))}: "${name}" is not allowed here. Use ${replacement} (R-8.1-1).`)
      continue
    }
    const isTest = /\.test\.tsx?$/.test(name)
    if (files.includes(name) && !ALLOWED_FILES.has(name) && !isTest) {
      errors.push(`${rel(join(dir, name))}: not in the folder contract (R-8.1-1). Allowed: ${[...ALLOWED_FILES].join(', ')}.`)
    }
    if (dirs.includes(name) && !ALLOWED_DIRS.has(name)) {
      errors.push(`${rel(join(dir, name))}: only ${[...ALLOWED_DIRS].join(', ')} are allowed as folders (R-8.1-1).`)
    }
  }

  if (files.includes('hook.ts') && !files.includes('client.tsx')) {
    errors.push(`${rel(dir)}: hook.ts exists with no client.tsx. Only client.tsx may import it (R-8.1-1).`)
  }

  // R-5.12-4: a SCREAMING_CASE table is data or classes, so it lives in the file for that.
  const CONSTANT_HOMES = new Set(['constants.ts', 'classes.ts', 'boundaries.ts'])
  for (const f of files) {
    if (CONSTANT_HOMES.has(f) || /\.test\.tsx?$/.test(f)) continue
    for (const name of screamingConstants(readFileSync(join(dir, f), 'utf8'))) {
      errors.push(
        `${rel(join(dir, f))}: declares ${name}.`
        + ' A SCREAMING_CASE constant lives in constants.ts or classes.ts (R-5.12-4).',
      )
    }
  }

  // R-8.3-4: a prop interface is declared in types.ts, never inline in a component file.
  for (const f of files) {
    if (f !== 'index.tsx' && f !== 'client.tsx') continue
    for (const name of inlinePropInterfaces(readFileSync(join(dir, f), 'utf8'))) {
      errors.push(
        `${rel(join(dir, f))}: declares ${name} inline.`
        + ' A prop interface lives in types.ts and is re-exported (R-8.3-4).',
      )
    }
  }

  // R-8.5-1: a component that renders items windows them through useCollection in its hook, or is exempt by decision.
  const source = (f: string) => (files.includes(f) ? readFileSync(join(dir, f), 'utf8') : null)
  const rest = ['schema.ts', 'classes.ts', 'client.tsx'].map((f) => source(f) ?? '').join('\n')
  for (const error of collectionErrors({ slug, types: source('types.ts'), hook: source('hook.ts'), rest })) {
    errors.push(`${rel(dir)}: ${error} (R-8.5-1).`)
  }

  // parts/: one component per file, named after the file.
  if (dirs.includes('parts')) {
    for (const e of listDir(join(dir, 'parts'))) {
      if (!e.isFile()) { errors.push(`${rel(join(dir, 'parts', e.name))}: parts/ holds files, not folders (R-8.1-1).`); continue }
      if (!isKebab(e.name.replace(/\.tsx?$/, ''))) errors.push(`${rel(join(dir, 'parts', e.name))}: part files are kebab-case (R-5.12-4).`)
    }
  }

  // dummy/: one example per file.
  if (dirs.includes('dummy')) {
    for (const e of listDir(join(dir, 'dummy'))) {
      if (!e.isFile()) errors.push(`${rel(join(dir, 'dummy', e.name))}: dummy/ holds files, not folders (R-8.1-1).`)
      else if (!isKebab(e.name.replace(/\.tsx?$/, '')) && e.name !== 'index.ts') {
        errors.push(`${rel(join(dir, 'dummy', e.name))}: example files are kebab-case (R-5.12-4).`)
      }
    }
  }

  // test/: at least one test, so a component can never ship untested.
  if (dirs.includes('test')) {
    const tests = listDir(join(dir, 'test')).filter((e) => e.isFile() && /\.test\.tsx?$/.test(e.name))
    if (tests.length === 0) errors.push(`${rel(join(dir, 'test'))}: holds no test file (R-8.1-1).`)
  }
}

function walk(root: string) {
  for (const e of listDir(root)) {
    if (!e.isDirectory()) continue
    const dir = join(root, e.name)
    if (statSync(dir).isDirectory()) checkComponentFolder(dir, e.name)
  }
}

walk(COMPONENTS)
walk(CONNECTORS)
for (const file of sourceFilesUnder(join(ROOT, 'src'))) checkFileSize(file)

for (const w of warnings) console.warn(`warn  ${w}`)
for (const e of errors) console.error(`error ${e}`)

if (errors.length) {
  console.error(`\ncheck-structure: ${errors.length} error${errors.length === 1 ? '' : 's'}.`)
  process.exit(1)
}
console.log(`check-structure: ok${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? '' : 's'})` : ''}`)
