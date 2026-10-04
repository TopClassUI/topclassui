// R-8.1-1, R-5.12-2, R-5.12-4, R-9.2-4: the folder contract, file size and naming.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'

import { inlinePropInterfaces } from './lib/source-checks.js'

const ROOT = process.cwd()
const COMPONENTS = join(ROOT, 'src', 'components')
const CONNECTORS = join(ROOT, 'src', 'connectors')

/** Every file a component folder may contain. A file exists only if it is needed. */
const ALLOWED_FILES = new Set([
  'index.tsx',
  'client.tsx',
  'hook.ts',
  'lib.ts',
  'variants.ts',
  'classes.ts',
  'constants.ts',
  'types.ts',
  'schema.ts',
  'skeleton.tsx',
  'empty-state.tsx',
  'error-state.tsx',
  'meta.ts',
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

const WARN_LINES = 200
const FAIL_LINES = 300

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

function countLines(file: string) {
  return readFileSync(file, 'utf8').split(/\r?\n/).length
}

function isKebab(name: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)
}

function checkFileSize(file: string) {
  const lines = countLines(file)
  if (lines > FAIL_LINES) errors.push(`${rel(file)}: ${lines} lines, over the ${FAIL_LINES} limit (R-5.12-2). Move parts into parts/.`)
  else if (lines > WARN_LINES) warnings.push(`${rel(file)}: ${lines} lines, over the ${WARN_LINES} warning line (R-5.12-2).`)
}

function checkComponentFolder(dir: string, slug: string) {
  if (!isKebab(slug)) errors.push(`${rel(dir)}: folder names are kebab-case (R-5.12-4).`)

  const entries = listDir(dir)
  const files = entries.filter((e) => e.isFile()).map((e) => e.name)
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name)

  if (!files.includes('index.tsx')) errors.push(`${rel(dir)}: index.tsx is required (R-8.1-1).`)

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

  for (const f of files) checkFileSize(join(dir, f))

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

  // parts/: one component per file, named after the file.
  if (dirs.includes('parts')) {
    for (const e of listDir(join(dir, 'parts'))) {
      if (!e.isFile()) { errors.push(`${rel(join(dir, 'parts', e.name))}: parts/ holds files, not folders (R-8.1-1).`); continue }
      if (!isKebab(e.name.replace(/\.tsx?$/, ''))) errors.push(`${rel(join(dir, 'parts', e.name))}: part files are kebab-case (R-5.12-4).`)
      checkFileSize(join(dir, 'parts', e.name))
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
    for (const t of tests) checkFileSize(join(dir, 'test', t.name))
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

for (const w of warnings) console.warn(`warn  ${w}`)
for (const e of errors) console.error(`error ${e}`)

if (errors.length) {
  console.error(`\ncheck-structure: ${errors.length} error${errors.length === 1 ? '' : 's'}.`)
  process.exit(1)
}
console.log(`check-structure: ok${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? '' : 's'})` : ''}`)
