import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { FAIL_LINES, WARN_LINES, countLines, sizeVerdict, sourceFilesUnder } from './file-sizes.js'

const SRC = join(process.cwd(), 'src')
const files = sourceFilesUnder(SRC)
const has = (...parts: string[]) => files.some((f) => f.endsWith(join(...parts)))

describe('the walk reaches every folder, not only the ones a component lists', () => {
  it('finds a component file, which the folder contract already covered', () => {
    expect(has('components', 'button', 'index.tsx')).toBe(true)
  })

  it('finds a shared file, which nothing checked before', () => {
    expect(has('shared', 'cn.ts')).toBe(true)
    expect(has('shared', 'contracts', 'tone.ts')).toBe(true)
  })

  it('finds a dummy example and a generated icon module, both of them nested', () => {
    expect(has('button', 'dummy', 'tones.tsx')).toBe(true)
    expect(has('icons', 'loaders.generated.ts')).toBe(true)
  })

  it('leaves out what is not TypeScript, so a stylesheet is not line-counted', () => {
    expect(files.filter((f) => f.endsWith('.css'))).toEqual([])
  })

  it('returns nothing for a folder that does not exist, rather than throwing', () => {
    expect(sourceFilesUnder(join(SRC, 'no-such-folder'))).toEqual([])
  })
})

describe('the verdict', () => {
  it('fails over 300 lines and warns over 200, on the boundary too', () => {
    expect(sizeVerdict(FAIL_LINES + 1)).toBe('fail')
    expect(sizeVerdict(FAIL_LINES)).toBe('warn')
    expect(sizeVerdict(WARN_LINES + 1)).toBe('warn')
    expect(sizeVerdict(WARN_LINES)).toBe('ok')
  })

  it('counts the same number of lines whichever ending the file has', () => {
    expect(countLines(join(SRC, 'shared', 'cn.ts'))).toBeGreaterThan(1)
  })

  it('holds every source file under the limit', () => {
    expect(files.filter((f) => sizeVerdict(countLines(f)) === 'fail')).toEqual([])
  })
})
