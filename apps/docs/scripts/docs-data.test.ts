// Runs docs:data against the repo, as docs:build will, and pins the shape of what it writes.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { parseDemoMap } from './lib/demo-map.js'
import { COMPONENTS } from './lib/library.js'
import { type ComponentsFile, generatedProblems } from './lib/shape.js'

const APP = resolve(import.meta.dirname, '..')
const out = mkdtempSync(join(tmpdir(), 'docs-data-'))
// node runs tsx's own entry: the .bin shim is a shell script that Windows cannot start without a shell.
const run = spawnSync(process.execPath, [join(APP, 'node_modules', 'tsx', 'dist', 'cli.mjs'), 'scripts/docs-data.ts', '--out', out], { cwd: APP, encoding: 'utf8' })
const log = `${run.stdout}${run.stderr}`
const read = (file: string) => readFileSync(join(out, file), 'utf8')
const components = JSON.parse(read('components.json')) as ComponentsFile
const demos = read('demos.ts')

describe('docs:data against the repo', () => {
  it('exits 0 without --strict', () => {
    expect(run.status, log).toBe(0)
  })

  it('reads all 52 component folders and lists the 46 catalog cards and the 486 demos', () => {
    expect(log).toMatch(/^docs:data: 52 folders, 46 catalog cards, 486 demos, \d+ issues?$/m)
    expect(components.components).toHaveLength(52)
    expect(components.components.filter((entry) => entry.card)).toHaveLength(46)
    expect(parseDemoMap(demos)).toHaveLength(486)
  })

  it('writes four files that pass every shape and cross check', () => {
    const generated = {
      components,
      toc: JSON.parse(read('toc.json')) as unknown,
      dates: JSON.parse(read('dates.json')) as unknown,
      demos,
    }
    const exists = (key: string) => existsSync(join(COMPONENTS, key.replace('/', '/dummy/') + '.tsx'))
    expect(generatedProblems(generated, exists)).toEqual([])
  })

  it('places each card in its section, in order, and gives Field, Form and Meter a page without a card', () => {
    const place = (slug: string) => {
      const entry = components.components.find((e) => e.slug === slug)
      return [entry?.section, entry?.order, entry?.card, entry?.page]
    }
    expect(place('button')).toEqual(['actions', 0, true, true])
    expect(place('pagination')).toEqual(['navigation', 5, true, true])
    expect(place('meter')).toEqual(['feedback', null, false, true])
    expect(place('icon')).toEqual([null, null, false, false])
  })

  it('gives every component with a schema its controls, and the five without one none', () => {
    const none = components.components.filter((e) => e.page && e.controls.length === 0).map((e) => e.slug)
    expect(none).toEqual(['breadcrumb', 'card', 'empty-state', 'form', 'kbd', 'timeline'])
  })

  it('rewrites every demo import to a public subpath', () => {
    const linked = components.components.find((e) => e.slug === 'avatar-group')?.demos.find((d) => d.name === 'linked')
    expect(linked?.source).toContain("from 'topclassui/classes'")
    expect(linked?.source).toContain("from 'topclassui/avatar-group'")
  })

  it('reports no issue now that the release exports map is in', () => {
    const issues = log.split('\n').filter((line) => line.startsWith('warn ')).filter((line) => !line.includes(' content-missing: '))
    expect(issues).toEqual([])
  })
})
