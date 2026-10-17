import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import config from '../../vitest.config.js'
import { PROJECTS, SUFFIXES, globToRegExp, patternFor, projectsFor } from './test-projects.js'
import type { Suffix } from './test-projects.js'

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

  const suffixes = Object.keys(SUFFIXES) as Suffix[]

  it('gives every suffix exactly one owning project', () => {
    for (const suffix of suffixes) {
      expect(PROJECTS.filter((p) => p.owns === suffix).map((p) => p.name), suffix).toHaveLength(1)
    }
    expect(PROJECTS.filter((p) => p.owns === null)).toHaveLength(1)
  })

  it('excludes every suffix a project does not own, so a fifth cannot be forgotten', () => {
    for (const project of PROJECTS) {
      const missing = suffixes
        .filter((suffix) => suffix !== project.owns)
        .map(patternFor)
        .filter((pattern) => !project.exclude.includes(pattern))
      expect(missing, project.name).toEqual([])
    }
  })

  // The asymmetry that existed: .ssr.test.ts ran in both node and ssr.
  for (const suffix of suffixes) {
    const owner = PROJECTS.find((p) => p.owns === suffix)?.name
    for (const ext of ['ts', 'tsx'] as const) {
      it(`a .${suffix}.test.${ext} file runs only in ${String(owner)}`, () => {
        expect(projectsFor(`src/components/x/test/x.${suffix}.test.${ext}`)).toEqual([owner])
      })
    }
  }

  it('places a plain .test.ts in node and a plain .test.tsx in ssr', () => {
    expect(projectsFor('src/shared/x.test.ts')).toEqual(['node'])
    expect(projectsFor('src/shared/x.test.tsx')).toEqual(['ssr'])
  })
})

describe('vitest.config.ts really consumes the project data', () => {
  type Entry = { test?: { name?: string; include?: string[]; exclude?: string[] } }
  const projects = (config.test?.projects ?? []) as Entry[]

  it('declares one entry per project, in the same order', () => {
    expect(projects.map((p) => p.test?.name)).toEqual(PROJECTS.map((p) => p.name))
  })

  for (const project of PROJECTS) {
    it(`${project.name} is given both its include and its exclude`, () => {
      const entry = projects.find((p) => p.test?.name === project.name)
      expect(entry?.test?.include, project.name).toEqual(project.include)
      expect(entry?.test?.exclude, project.name).toEqual(project.exclude)
    })
  }
})
