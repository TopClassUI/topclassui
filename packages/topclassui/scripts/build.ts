// pnpm build: tsc emits dist, then the three things tsc cannot do: the #alias rewrite,
// the CSS copy, and the proof that 'use client' and server-only survived.
import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { createInterface } from 'node:readline'

import {
  DIST,
  isCompiledSource,
  isWatchSummary,
  outputFor,
  rewriteSource,
  startsWithUseClient,
  watchErrors,
} from './lib/specifiers.js'

const ROOT = process.cwd()
const TSC = join(ROOT, 'node_modules/typescript/bin/tsc')
const PROJECT = ['-p', 'tsconfig.build.json']
const CSS = ['tokens.css', 'styles.css']
const SERVER_ONLY_ENTRY = `${DIST}/components/icon/index.js`
const watch = process.argv.includes('--watch')
const rel = (p: string) => relative(ROOT, p).split(sep).join('/')

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/** Steps 3 to 5 of the plan: rewrite, copy, verify. Empty means dist is sound. */
function finish(): string[] {
  const errors: string[] = []
  let rewritten = 0
  let touched = 0
  const emitted = walk(join(ROOT, DIST)).filter((f) => /\.(js|d\.ts)$/.test(f))
  for (const file of emitted) {
    const result = rewriteSource(rel(file), readFileSync(file, 'utf8'))
    for (const s of result.leftover) errors.push(`${rel(file)}: '${s}' names no folder in dist`)
    if (result.rewritten > 0) {
      writeFileSync(file, result.code)
      rewritten += result.rewritten
      touched += 1
    }
  }
  for (const name of CSS) copyFileSync(join(ROOT, 'src', name), join(ROOT, DIST, name))
  const sources = walk(join(ROOT, 'src')).map(rel).filter(isCompiledSource)
  const clients = sources.filter((s) => startsWithUseClient(readFileSync(join(ROOT, s), 'utf8')))
  for (const s of clients) {
    const out = join(ROOT, outputFor(s))
    if (!existsSync(out) || !startsWithUseClient(readFileSync(out, 'utf8'))) {
      errors.push(`${outputFor(s)}: lost its 'use client'`)
    }
  }
  const icon = join(ROOT, SERVER_ONLY_ENTRY)
  if (!existsSync(icon) || !/import ['"]server-only['"]/.test(readFileSync(icon, 'utf8'))) {
    errors.push(`${SERVER_ONLY_ENTRY}: lost its server-only import`)
  }
  const js = emitted.filter((f) => f.endsWith('.js')).length
  console.log(
    `build: ${String(js)} .js and ${String(emitted.length - js)} .d.ts; ` +
      `${String(rewritten)} specifiers rewritten in ${String(touched)} files; ` +
      `${String(clients.length)} client files keep 'use client'; ${CSS.join(' and ')} copied`,
  )
  for (const e of errors) console.error(`build: ${e}`)
  return errors
}

rmSync(join(ROOT, DIST), { recursive: true, force: true })

if (!watch) {
  const tsc = spawnSync(process.execPath, [TSC, ...PROJECT], { cwd: ROOT, stdio: 'inherit' })
  if (tsc.status !== 0) process.exit(tsc.status ?? 1)
  process.exit(finish().length === 0 ? 0 : 1)
}

const tsc = spawn(process.execPath, [TSC, ...PROJECT, '-w', '--preserveWatchOutput'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'inherit'],
})
createInterface({ input: tsc.stdout }).on('line', (line) => {
  console.log(line)
  if (isWatchSummary(line) && watchErrors(line) === 0) finish()
})
tsc.on('exit', (code) => process.exit(code ?? 1))
