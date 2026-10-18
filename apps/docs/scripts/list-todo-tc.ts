// S12: the TODO(tc) markers in apps/docs, each a piece the site owns until the library ships it. Printed by docs:check.
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const APP = resolve(import.meta.dirname, '..')
const SKIP = new Set(['node_modules', '.next', '.generated', 'scripts', 'test-results', 'playwright-report'])

function* files(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* files(path)
    else if (/\.(tsx?|mdx|css)$/.test(entry.name)) yield path
  }
}

const found: string[] = []
for (const file of files(APP)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
    const note = /TODO\(tc\):\s*(.*?)(\s*\*\/|\s*\}|$)/.exec(line)?.[1]
    if (note !== undefined) found.push(`${relative(APP, file)}:${String(index + 1)}  ${note}`)
  })
}
console.log(`TODO(tc): ${String(found.length)} marker${found.length === 1 ? '' : 's'}`)
for (const line of found) console.log(`  ${line}`)
