import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

import { MUTATIONS } from '../mutations/index.js'
import {
  type Mutation, type Run, caughtBy, caughtByE2e, collectMutations, e2eArgs, freePort, mutationFiles, readAnchors, summarise,
} from './mutate.js'

const made: string[] = []
afterAll(() => { for (const dir of made) rmSync(dir, { recursive: true, force: true }) })

const row = (label: string) => `{ label: '${label}', file: 'x.ts', from: 'a', to: 'b' }`
const rows = (...labels: string[]) => `export const MUTATIONS = [${labels.map(row).join(', ')}]\n`

function folder(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'tc-mutations-'))
  made.push(dir)
  for (const [name, source] of Object.entries(files)) writeFileSync(join(dir, name), source)
  return dir
}

describe('finding the mutation files', () => {
  // Upper.ts is here for NTFS, which lists names sorted without case: only sort() puts it first.
  it('collects every file of the folder, sorted by name whatever order the disk lists them in', async () => {
    const dir = folder({
      'avatar.ts': rows('third'),
      'tag.ts': rows('fourth'),
      'Upper.ts': rows('first'),
      'avatar-group.ts': rows('second'),
    })
    expect(mutationFiles(dir)).toEqual(['Upper.ts', 'avatar-group.ts', 'avatar.ts', 'tag.ts'])
    expect((await collectMutations(dir)).map((m) => m.label)).toEqual(['first', 'second', 'third', 'fourth'])
  })

  it('keeps the rows of one file in the order the file wrote them, and the whole row', async () => {
    const dir = folder({ 'button.ts': rows('z', 'a', 'm') })
    const found = await collectMutations(dir)
    expect(found.map((m) => m.label)).toEqual(['z', 'a', 'm'])
    expect(found[0]).toEqual({ label: 'z', file: 'x.ts', from: 'a', to: 'b' })
  })

  it('leaves out index.ts, which is the reader, and anything that is not a TypeScript file', async () => {
    const reader = 'throw new Error("index.ts was imported")\n'
    const dir = folder({ 'index.ts': reader, 'notes.md': 'x', 'kbd.ts': rows('only') })
    mkdirSync(join(dir, 'folder.ts'))
    expect(mutationFiles(dir)).toEqual(['kbd.ts'])
    expect((await collectMutations(dir)).map((m) => m.label)).toEqual(['only'])
  })

  it('refuses a file that exports no rows, by name, rather than skipping it', async () => {
    const dir = folder({ 'card.ts': rows('fine'), 'table.ts': 'export const ROWS = []\n' })
    await expect(collectMutations(dir)).rejects.toThrow('table.ts must export MUTATIONS')
  })
})

describe('reading the anchors', () => {
  const dir = folder({ 'a.ts': 'const x = 1; const y = 1; const z = 2\n' })
  const at = (from: string): Mutation => ({ label: from, file: 'a.ts', from, to: '' })

  it('passes an anchor found exactly once', () => {
    expect(readAnchors(dir, [at('const z = 2')])).toEqual([])
  })

  it('reports an anchor that is gone, by label and file', () => {
    expect(readAnchors(dir, [at('const w = 3')])).toEqual(['const w = 3: "const w = 3" is not in a.ts'])
  })

  it('reports an anchor found twice, since only its first copy would ever be mutated', () => {
    expect(readAnchors(dir, [at(' = 1')])).toEqual([' = 1: " = 1" is in a.ts 2 times, and only the first is mutated'])
  })

  it('reports an empty anchor, which matches anywhere, a deletion row too', () => {
    const empty: Mutation = { label: 'a demo is deleted', file: 'a.ts', from: '', to: null }
    expect(readAnchors(dir, [empty])).toEqual(['a demo is deleted: the anchor is empty, so it matches anywhere in a.ts'])
  })

  it('reports a row whose file is gone, by label, instead of throwing', () => {
    const gone: Mutation = { label: 'gone', file: 'b.ts', from: 'const z = 2', to: '' }
    expect(readAnchors(dir, [gone])).toEqual(['gone: b.ts does not exist'])
  })

  it('reads a deletion row as any other, so its anchor names a line the file still holds', () => {
    const deletion = (from: string): Mutation => ({ label: from, file: 'a.ts', from, to: null })
    expect(readAnchors(dir, [deletion('const z = 2'), deletion('const w = 3')])).toEqual(['const w = 3: "const w = 3" is not in a.ts'])
  })
})

describe('reading the e2e of a row', () => {
  const dir = folder({ 'a.ts': 'const z = 2\n', 'a.spec.ts': "test('a long word (300 characters) stays inside', () => {})\n" })
  const at = (spec: string, grep: string): Mutation => ({ label: 'row', file: 'a.ts', from: 'const z = 2', to: '', e2e: { spec, grep } })

  it('passes a spec that exists and a grep its source holds', () => {
    expect(readAnchors(dir, [at('a.spec.ts', 'a long word (300 characters)')])).toEqual([])
  })

  it('reports a spec that is gone, which Playwright would read as no test found', () => {
    expect(readAnchors(dir, [at('b.spec.ts', 'a long word')])).toEqual(['row: the spec b.spec.ts does not exist'])
  })

  it('reports a grep no title holds, and an empty one, which runs the whole spec', () => {
    expect(readAnchors(dir, [at('a.spec.ts', 'a short word')])).toEqual(['row: "a short word" is not in a.spec.ts'])
    expect(readAnchors(dir, [at('a.spec.ts', ' ')])).toEqual(['row: the grep is empty, so it runs all of a.spec.ts'])
  })
})

describe('scripts/mutations', () => {
  const FOLDER = join(process.cwd(), 'scripts', 'mutations')
  const labels = MUTATIONS.map((m) => m.label)

  it('holds the 289 rows the single file had on the day it was split, or more', () => {
    expect(MUTATIONS.length).toBeGreaterThanOrEqual(289)
  })

  it('reaches a component, the shared code, the check scripts and the lint rules', () => {
    const under = (prefix: string) => MUTATIONS.filter((m) => m.file.startsWith(prefix)).length
    expect(under('src/components/button/')).toBeGreaterThanOrEqual(15)
    expect(under('src/shared/')).toBeGreaterThanOrEqual(26)
    expect(under('scripts/lib/')).toBeGreaterThanOrEqual(10)
    expect(under('eslint-rules/')).toBeGreaterThanOrEqual(3)
  })

  // pnpm check never runs a mutant, so this is what catches a row whose anchor a fix moved.
  it('finds the anchor of every row exactly once in its file, deletions included', () => {
    expect(readAnchors(process.cwd(), MUTATIONS)).toEqual([])
  })

  it('judges at least five rows in a browser, each by a spec under e2e/', () => {
    const browser = MUTATIONS.flatMap((m) => (m.e2e ? [m.e2e.spec] : []))
    expect(browser.length).toBeGreaterThanOrEqual(5)
    expect(browser.filter((spec) => !/^e2e\/[a-z0-9-]+\.spec\.ts$/.test(spec))).toEqual([])
  })

  it('never repeats a label, because the filter and the report both name a row by it', () => {
    expect(labels.filter((label, i) => labels.indexOf(label) !== i)).toEqual([])
  })

  it('collects every file in the folder and loses no row of any of them', async () => {
    const files = readdirSync(FOLDER).filter((name) => name !== 'index.ts')
    expect(files.length).toBeGreaterThanOrEqual(23)
    let total = 0
    for (const file of files) {
      const area = (await import(pathToFileURL(join(FOLDER, file)).href)) as { MUTATIONS: Mutation[] }
      const own = area.MUTATIONS
      const lost = own.filter((row) => !MUTATIONS.includes(row)).map((row) => `${file}: ${row.label}`)
      expect(lost).toEqual([])
      total += own.length
    }
    expect(MUTATIONS).toHaveLength(total)
  })
})

describe('judging a run', () => {
  const run = (status: number | null, stdout = '', extra: Partial<Run> = {}): Run => ({ status, stdout, stderr: '', ...extra })

  it('counts a run with a failed test or a failed file as caught, and a clean run as survived', () => {
    expect(caughtBy(run(1, ' Test Files  1 failed | 50 passed (51)\n      Tests  1 failed | 205 passed (206)\n'))).toBe(true)
    expect(caughtBy(run(1, ' Test Files  1 failed | 50 passed (51)\n      Tests  205 passed (205)\n'))).toBe(true)
    expect(caughtBy(run(0, ' Test Files  51 passed (51)\n      Tests  206 passed (206)\n'))).toBe(false)
  })

  it('throws for a run that never finished: killed by a signal, or out of buffer', () => {
    expect(() => caughtBy(run(null, '', { signal: 'SIGKILL' }))).toThrow('vitest did not finish (signal SIGKILL)')
    const flood = spawnSync('node', ['-e', 'process.stderr.write("x".repeat(1600000))'], { encoding: 'utf8', maxBuffer: 1024 * 1024 })
    expect(() => caughtBy(flood)).toThrow('vitest did not finish (spawnSync node ENOBUFS)')
  })

  it('throws for a run that exited 1 with no test failed, which is the machine and not the mutant', () => {
    expect(() => caughtBy(run(1, 'Error: Cannot find module vitest.mjs\n'))).toThrow('vitest exited 1 with no test failed')
    expect(() => caughtBy(run(1, ' Test Files  51 passed (51)\n      Tests  206 passed (206)\n'))).toThrow('with no test failed')
  })
})

describe('judging a Playwright run', () => {
  const run = (status: number | null, stdout = '', extra: Partial<Run> = {}): Run => ({ status, stdout, stderr: '', ...extra })

  it('counts a run with a failed test as caught, and a clean run as survived', () => {
    const failed = '  \u2718  1 [chromium] \u203a e2e/dialog.spec.ts:528:7 \u203a 320 x 480 ltr (6.1s)\n\n  1 failed\n    [chromium] \u203a e2e/dialog.spec.ts:528:7\n  5 passed (28.7s)\n'
    expect(caughtByE2e(run(1, failed))).toBe(true)
    expect(caughtByE2e(run(0, '  6 passed (28.7s)\n'))).toBe(false)
  })

  it('throws for a run that never finished, which is the runner failing and not the row caught', () => {
    expect(() => caughtByE2e(run(null, '', { signal: 'SIGKILL' }))).toThrow('playwright did not finish (signal SIGKILL)')
    expect(() => caughtByE2e(run(null, '', { error: new Error('spawnSync node ENOENT') }))).toThrow('playwright did not finish (spawnSync node ENOENT)')
  })

  it('throws for a run that exited 1 with no test failed: no test found, or a server that never started', () => {
    expect(() => caughtByE2e(run(1, 'Error: No tests found\n'))).toThrow('playwright exited 1 with no test failed')
    const server = 'Error: Timed out waiting 120000ms from config.webServer.\n'
    expect(() => caughtByE2e(run(1, '', { stderr: server }))).toThrow('config.webServer')
  })

  it('reads a title that merely says failed as no count of failures', () => {
    expect(() => caughtByE2e(run(1, '  \u2713  1 the upload reports 2 failed files (1.2s)\n'))).toThrow('with no test failed')
  })
})

describe('running a row in Playwright', () => {
  it('runs one spec on one worker with the list reporter, the grep escaped to a literal', () => {
    expect(e2eArgs({ spec: 'e2e/dialog.spec.ts', grep: 'a 300-character word (lg)?' })).toEqual([
      'test', 'e2e/dialog.spec.ts', '-g', 'a 300-character word \\(lg\\)\\?', '--workers=1', '--reporter=list',
    ])
  })

  it('finds a port nothing listens on, one a server can then take', async () => {
    const port = await freePort()
    expect(port).toBeGreaterThanOrEqual(1024)
    expect(port).toBeLessThanOrEqual(65535)
    const server = createServer()
    await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve) })
    await new Promise((resolve) => server.close(resolve))
  })
})

describe('the summary', () => {
  it('counts a row the runner failed on as neither caught nor survived', () => {
    const text = summarise([
      { label: 'one', caught: true },
      { label: 'two', caught: false, error: 'mutate: playwright did not finish (signal SIGKILL)' },
    ])
    expect(text).toBe([
      '  caught  one',
      '   ERROR  two: mutate: playwright did not finish (signal SIGKILL)',
      '',
      'mutate: the runner failed on 1 of 2, which were never judged.',
    ].join('\n'))
  })

  it('says ok only when every row was judged and caught, and counts the survivors apart', () => {
    expect(summarise([{ label: 'one', caught: true }]).split('\n').at(-1)).toBe('mutate: ok, all 1 mutations were caught')
    expect(summarise([{ label: 'one', caught: false }, { label: 'two', caught: true }]).split('\n').at(-1)).toBe('mutate: 1 of 2 survived.')
  })
})
