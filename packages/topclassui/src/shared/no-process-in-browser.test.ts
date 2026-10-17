import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/** A browser has no process global. Every bundler, and the Vite harness, inlines process.env.NODE_ENV in dot form
 * only, as React's own entry needs; any other read throws in the page and unmounts the component. */
const SRC = join(process.cwd(), 'src')

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    // A test folder runs in Node only.
    if (e.isDirectory()) { if (e.name !== 'test') walk(p, out) }
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p)
  }
  return out
}

const withoutComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
const relative = (file: string) => file.slice(SRC.length + 1).split('\\').join('/')

describe('no library file reads the process global in a form a bundler leaves in the browser', () => {
  const files = walk(SRC)

  it('finds files to check, and the dev warnings that read NODE_ENV', () => {
    expect(files.length).toBeGreaterThan(0)
    const readers = files.filter((file) => withoutComments(readFileSync(file, 'utf8')).includes('process.env.NODE_ENV')).map(relative)
    expect(readers).toEqual(expect.arrayContaining(['shared/collection/use-collection.ts', 'shared/provider/use-provider-locale.ts', 'shared/use-controllable-state.ts']))
  })

  for (const file of files) {
    it(`${relative(file)} reads process only as process.env.NODE_ENV`, () => {
      const code = withoutComments(readFileSync(file, 'utf8'))
      expect(code.match(/\bprocess\b(?!\.env\.NODE_ENV\b)[^\n]{0,30}/g) ?? []).toEqual([])
    })
  }
})
