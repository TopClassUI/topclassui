import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import { findRepoRoot } from '../../scripts/lib/repo-root.js'
import { rootPropsFailures } from './root-props.js'
import type { RootPropsCase } from './root-props.js'

// The one async Icon imports server-only, which throws outside the react-server condition.
vi.mock('server-only', () => ({}))

type Module = Record<string, unknown>

type Fixture = Record<string, RootPropsCase<unknown> | undefined>

const ROOTS = ['components', 'connectors'] as const
const folders = ROOTS.flatMap((root) =>
  readdirSync(join(process.cwd(), 'src', root), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ root, slug: e.name, name: `${root}/${e.name}` })),
)
type Folder = (typeof folders)[number]

const has = (folder: Folder, file: string) => existsSync(join(process.cwd(), 'src', folder.root, folder.slug, file))

// A template import, so Vite knows every file the walk may load.
const load = async (folder: Folder, file: 'index.tsx' | 'skeleton.tsx' | 'test/fixture.ts'): Promise<Module> => {
  if (!has(folder, file)) return {}
  return folder.root === 'components'
    ? await import(`../components/${folder.slug}/${file}`) as Module
    : await import(`../connectors/${folder.slug}/${file}`) as Module
}

// pnpm test:mutation runs a copy of the package outside the repo and names the repo in TC_REPO_ROOT.
const repoRoot = process.env['TC_REPO_ROOT'] ?? findRepoRoot(process.cwd(), existsSync) ?? process.cwd()
/** Each entry of docs/DECISIONS.md by its heading, so a recorded departure must point at a real one. */
const decisions = new Map(
  readFileSync(join(repoRoot, 'docs', 'DECISIONS.md'), 'utf8').split(/^## /m).slice(1)
    .map((entry) => [entry.slice(0, entry.indexOf('\n')).trim(), entry] as const),
)
const decisionOf = (entry: RootPropsCase<unknown> | undefined) =>
  entry === undefined ? undefined : 'headless' in entry ? entry.headless.decision : entry.target?.decision

const isComponent = ([name, value]: [string, unknown]) =>
  /^[A-Z]/.test(name) && (typeof value === 'function' || (typeof value === 'object' && value !== null && '$$typeof' in value))

const exportsOf = (module: Module) => Object.entries(module).filter(isComponent)

describe('R-5.7-3: className, ref and data-* reach the root of every export', () => {
  it('finds the component folders', () => {
    expect(folders.length).toBeGreaterThanOrEqual(46)
  })

  describe.each(folders)('$name', (folder) => {
    it('has a fixture, and every case in it names an export', async () => {
      expect(has(folder, 'test/fixture.ts'), `${folder.name}/test/fixture.ts is missing`).toBe(true)
      const fixture = (await load(folder, 'test/fixture.ts')).fixture as Fixture
      const names = new Set([...exportsOf(await load(folder, 'index.tsx')), ...exportsOf(await load(folder, 'skeleton.tsx'))].map(([n]) => n))
      expect(Object.keys(fixture).filter((n) => !names.has(n))).toEqual([])
    })

    it('every departure points at a docs/DECISIONS.md entry that names the export', async () => {
      const fixture = ((await load(folder, 'test/fixture.ts')).fixture ?? {}) as Fixture
      const unrecorded = Object.entries(fixture).filter(([name, entry]) => {
        const decision = decisionOf(entry)
        return decision !== undefined && !(decisions.get(decision)?.includes(name) ?? false)
      })
      expect(unrecorded.map(([name]) => name)).toEqual([])
    })

    it('every export renders className, ref and data-* onto its root', async () => {
      const fixture = ((await load(folder, 'test/fixture.ts')).fixture ?? {}) as Fixture
      const skeleton = exportsOf(await load(folder, 'skeleton.tsx'))
      const fromSkeleton = new Set(skeleton.map(([n]) => n))
      const all = new Map([...exportsOf(await load(folder, 'index.tsx')), ...skeleton])

      const report: Record<string, string[]> = {}
      for (const [name, component] of all) {
        // A skeleton takes no required prop, so one merged from another branch is covered before its fixture line.
        const entry = fixture[name] ?? (fromSkeleton.has(name) ? { props: {} } : undefined)
        report[name] = entry
          ? await rootPropsFailures(component, entry)
          : [`no case in ${folder.name}/test/fixture.ts`]
      }
      const failing = Object.fromEntries(Object.entries(report).filter(([, f]) => f.length > 0))
      expect(failing).toEqual({})
    })
  })
})
