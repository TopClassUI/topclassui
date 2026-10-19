import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { runGit, trackedFiles, walkFiles } from './tracked-files.js'

const repo = mkdtempSync(join(tmpdir(), 'tracked-files-'))
const write = (name: string, text = 'x\n') => {
  mkdirSync(join(repo, ...name.split('/').slice(0, -1)), { recursive: true })
  writeFileSync(join(repo, ...name.split('/')), text)
}
const names = (files: readonly string[]) => files.map((file) => relative(repo, file).split(sep).join('/')).sort()

write('src/kept.ts')
write('src/gone.ts')
write('src/deep/kept.css')
runGit(['init', '-q'], repo)
runGit(['add', '.'], repo)
rmSync(join(repo, 'src', 'gone.ts'))
write('src/stray-build/out.json', '{"a":"\b"}\n')
write('dist/out.js')

afterAll(() => { rmSync(repo, { recursive: true, force: true }) })

describe('trackedFiles', () => {
  it('lists what git tracks and is still on disk, never an untracked build folder', () => {
    expect(names(trackedFiles(repo))).toEqual(['src/deep/kept.css', 'src/kept.ts'])
  })

  it('lists paths under the folder it is given', () => {
    expect(names(trackedFiles(join(repo, 'src', 'deep')))).toEqual(['src/deep/kept.css'])
  })

  it('without git, warns and walks the folder, untracked files included', () => {
    const warnings: string[] = []
    const files = trackedFiles(repo, () => { throw new Error('spawnSync git ENOENT') }, (message) => warnings.push(message))
    expect(names(files)).toEqual(['src/deep/kept.css', 'src/kept.ts', 'src/stray-build/out.json'])
    expect(warnings).toEqual([`git ls-files failed in ${repo} (spawnSync git ENOENT); walking the folder instead, so untracked files are read too`])
  })

  it('walks past the folders no commit carries', () => {
    expect(names(walkFiles(repo))).toEqual(['src/deep/kept.css', 'src/kept.ts', 'src/stray-build/out.json'])
  })
})
