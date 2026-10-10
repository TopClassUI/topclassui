import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

import { MUTATIONS } from '../mutations/index.js'
import { type Mutation, collectMutations, mutationFiles } from './mutate.js'

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
