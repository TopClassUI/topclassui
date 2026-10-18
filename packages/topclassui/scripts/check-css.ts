// R-4-1 every authored rule sits in a cascade layer, no file reads a token the
// tokens file never declares, and R-5.3-2 directional motion follows --tc-dir.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'

import { findPhysicalDirection } from './lib/css-direction.js'
import { findLongComments, findUnlayeredDeclarations } from './lib/css-layers.js'
import { definedTokens, findUndefinedReferences } from './lib/token-refs.js'
import { readBlocks, tokensMissingPerMode } from './lib/tokens.js'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const TOKENS = join(SRC, 'tokens.css')
const rel = (p: string) => relative(ROOT, p).split(sep).join(posix.sep)

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(css|tsx?)$/.test(e.name)) out.push(p)
  }
  return out
}

let files: string[] = []
try {
  files = walk(SRC)
} catch {
  console.log('check-css: ok (no src yet)')
  process.exit(0)
}

const errors: string[] = []
const stylesheets = files.filter((f) => f.endsWith('.css'))

for (const file of stylesheets) {
  const css = readFileSync(file, 'utf8')
  for (const o of findUnlayeredDeclarations(css)) {
    errors.push(
      `${rel(file)}:${String(o.line)} R-4-1: '${o.property}' on '${o.selector}' is outside a cascade layer`,
    )
  }
  for (const c of findLongComments(css)) {
    errors.push(`${rel(file)}:${String(c.line)} R-5.12-3: comment spans ${String(c.span)} lines, one is the maximum`)
  }
  for (const d of findPhysicalDirection(css)) {
    errors.push(`${rel(file)}:${String(d.line)} R-5.3-2: '${d.property}: ${d.value}' ${d.hint}`)
  }
}

if (existsSync(TOKENS)) {
  const tokensCss = readFileSync(TOKENS, 'utf8')
  for (const m of tokensMissingPerMode(readBlocks(tokensCss))) {
    errors.push(`src/tokens.css R-4-2: '${m.token}' is not declared in the '${m.mode}' mode`)
  }

  const defined = definedTokens(tokensCss)
  const readers = files
    .filter((f) => f !== TOKENS && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'))
    .map((file) => ({ file, content: readFileSync(file, 'utf8') }))

  for (const r of findUndefinedReferences(defined, readers)) {
    errors.push(
      `${rel(r.file)}:${String(r.line)} R-4-2: reads '${r.token}', which src/tokens.css never declares`,
    )
  }
}

for (const e of errors) console.error(`error ${e}`)

if (errors.length) {
  console.error(`\ncheck-css: ${String(errors.length)} failure${errors.length === 1 ? '' : 's'}.`)
  process.exit(1)
}
console.log(`check-css: ok (${String(stylesheets.length)} stylesheets, ${String(files.length)} files scanned)`)
