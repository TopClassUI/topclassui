// What a page that renders only a plain Tag imports, which is what Next.js turns into client chunks: not what renders.
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

import { buildGraph } from '../../../../scripts/lib/module-graph.js'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const FILES = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => join(SRC, file))

const graph = buildGraph(FILES, ROOT)
const isClientModule = (file: string) => readFileSync(file, 'utf8').startsWith("'use client'")
const reached = [...graph.reachable(join(SRC, 'components', 'tag', 'index.tsx'))]
  .filter(isClientModule)
  .map((file) => relative(ROOT, file).split('\\').join('/'))
  .sort()

const README = readFileSync(join(SRC, 'components', 'tag', 'README.md'), 'utf8').replace(/\s+/g, ' ')

describe('a page that imports Tag', () => {
  it('reaches the x and what it reads, though a plain Tag renders none of it', () => {
    expect(reached).toEqual([
      'src/components/tag/client.tsx',
      'src/components/tag/hook.ts',
      'src/shared/adaptive/use-adaptive-mode.ts',
      'src/shared/provider/context.ts',
    ])
  })

  it('is told so by the README, which never promises that a plain Tag ships no JavaScript', () => {
    expect(README).toContain('Tag imports the code of its x, so a page that imports Tag may still load that one small file')
    expect(README).not.toMatch(/ships no JavaScript|ships 0 KB/)
  })
})
