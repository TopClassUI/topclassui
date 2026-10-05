import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { globToRegExp, projectsFor } from './test-projects.js'

const ROOT = process.cwd()

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`
    if (e.isDirectory()) walk(p, out)
    else if (/\.test\.tsx?$/.test(e.name)) out.push(p)
  }
  return out
}

describe('globToRegExp', () => {
  it('matches a file at any depth under **/', () => {
    expect(globToRegExp('src/**/*.test.ts').test('src/a/b/c.test.ts')).toBe(true)
    expect(globToRegExp('src/**/*.test.ts').test('src/c.test.ts')).toBe(true)
  })

  it('does not let * cross a folder boundary', () => {
    expect(globToRegExp('src/*.test.ts').test('src/a/b.test.ts')).toBe(false)
  })

  it('expands a {ts,tsx} list', () => {
    const re = globToRegExp('src/**/*.dom.test.{ts,tsx}')
    expect(re.test('src/a.dom.test.tsx')).toBe(true)
    expect(re.test('src/a.dom.test.ts')).toBe(true)
    expect(re.test('src/a.dom.test.js')).toBe(false)
  })
})

describe('the four projects are symmetric', () => {
  const files = walk('src')

  it('finds the test files to place', () => {
    expect(files.length).toBeGreaterThan(10)
  })

  for (const file of files) {
    it(`${file} runs in exactly one project`, () => {
      expect(projectsFor(file)).toHaveLength(1)
    })
  }

  // The asymmetry that existed: .ssr.test.ts ran in both node and ssr.
  for (const suffix of ['dom', 'rsc', 'ssr'] as const) {
    for (const ext of ['ts', 'tsx'] as const) {
      it(`a .${suffix}.test.${ext} file runs only in ${suffix}`, () => {
        expect(projectsFor(`src/components/x/test/x.${suffix}.test.${ext}`)).toEqual([suffix])
      })
    }
  }

  it('places a plain .test.ts in node and a plain .test.tsx in ssr', () => {
    expect(projectsFor('src/shared/x.test.ts')).toEqual(['node'])
    expect(projectsFor('src/shared/x.test.tsx')).toEqual(['ssr'])
  })
})
