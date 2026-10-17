// A heredoc once wrote a literal backspace into a regex, which silently disabled a whole
// check. Control bytes are invisible in a diff, so they are asserted against here.
import { readFileSync, readdirSync } from 'node:fs'
import { join, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage'])
const TEXT = /\.(ts|tsx|css|md|json|ya?ml|mjs|cjs)$/

function sources(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) sources(p, out)
    else if (TEXT.test(e.name)) out.push(p)
  }
  return out
}

/** Tab, newline and carriage return are the only control bytes a source file may hold. */
const allowed = new Set([9, 10, 13])

describe('every text file in the repo', () => {
  const files = sources(ROOT)

  it('reads more than a handful of files, or the walk is broken', () => {
    expect(files.length).toBeGreaterThan(100)
  })

  it('holds no stray control byte, which a diff would not show', () => {
    const bad: string[] = []
    for (const file of files) {
      const raw = readFileSync(file)
      for (const byte of new Set(raw)) {
        if (byte < 32 && !allowed.has(byte)) {
          bad.push(`${file.slice(ROOT.length + 1).split(sep).join('/')}: byte 0x${byte.toString(16)}`)
        }
      }
    }
    expect(bad).toEqual([])
  })

  it('starts no file with a BOM, which breaks a directive and a shebang', () => {
    const bom = files.filter((f) => readFileSync(f).subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])))
    expect(bom.map((f) => f.slice(ROOT.length + 1))).toEqual([])
  })
})
