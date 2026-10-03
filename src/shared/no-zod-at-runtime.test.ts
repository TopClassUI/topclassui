import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

// D3 and R-8.3-1: only a schema file may load zod, or the whole library ships to the browser.
const SRC = join(process.cwd(), 'src')

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p)
  }
  return out
}

describe('zod never reaches the browser', () => {
  const files = walk(SRC)

  it('finds files to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    const rel = file.slice(SRC.length + 1).split('\\').join('/')
    const isSchema = /\.schema\.ts$/.test(rel) || /(^|\/)schema\.ts$/.test(rel)

    it(`${rel} ${isSchema ? 'may import zod' : 'imports zod only as a type'}`, () => {
      const source = readFileSync(file, 'utf8')
      const runtimeImport = /^\s*import\s+(?!type\b)[^;]*from\s+['"]zod['"]/m.test(source)
      if (isSchema) return
      expect(runtimeImport, `${rel} imports zod at runtime`).toBe(false)
    })
  }
})
