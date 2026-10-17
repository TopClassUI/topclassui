import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { blankComments, packageName, resolveSpecifier, valueImports } from '../../../../scripts/lib/module-graph.js'
import { hasUseClient } from '../../../../scripts/lib/source-checks.js'

const ROOT = process.cwd()
const FOLDER = join(import.meta.dirname, '..')
const CLIENT = join(FOLDER, 'client.tsx')
const read = (file: string) => readFileSync(file, 'utf8')

/** An import() is loaded when it runs, not with the file, so it is no edge of the static graph. */
const DYNAMIC = /\bimport\s*\(\s*(['"`])[^'"`]+\1\s*\)/g

/** The packages a file pulls in when it loads, through every file it statically imports. */
function staticPackages(entry: string): { files: string[], packages: string[] } {
  const seen = new Set<string>()
  const packages = new Set<string>()
  const queue = [entry]
  while (queue.length > 0) {
    const file = queue.pop()
    if (file === undefined || seen.has(file)) continue
    seen.add(file)
    const source = blankComments(read(file)).replace(DYNAMIC, 'null')
    for (const specifier of valueImports(source)) {
      const target = resolveSpecifier(specifier, file, ROOT)
      if (target === null) packages.add(packageName(specifier))
      else queue.push(target)
    }
  }
  return { files: [...seen], packages: [...packages].sort() }
}

describe('two files, so it is lazy', () => {
  it('nothing client.tsx loads with the page reaches @base-ui/react: React, the hook and its shared helpers only', () => {
    const graph = staticPackages(CLIENT)
    expect(graph.packages).toEqual(['react'])
    expect(graph.files.some((file) => file.includes('parts'))).toBe(false)
  })

  it('the walk does find Base UI where it is: in the panel, which client.tsx only imports when it runs', () => {
    expect(staticPackages(join(FOLDER, 'parts', 'command-panel.tsx')).packages).toContain('@base-ui/react')
    expect(read(CLIENT)).toContain("lazy(() => import('./parts/command-panel.js').then((module) => ({ default: module.CommandPanel })))")
    expect(read(CLIENT)).toContain('<Suspense fallback={null}>')
  })

  it('the walk blanks only a dynamic import: a static one in the same file still counts', () => {
    const probe = "import { x } from 'left-pad'\nconst y = import('right-pad')\n"
    expect(valueImports(blankComments(probe).replace(DYNAMIC, 'null'))).toEqual(['left-pad'])
  })
})

describe('the folder is the client template', () => {
  it('client.tsx, hook.ts and every part start with use client; index.tsx does not', () => {
    expect(hasUseClient(read(CLIENT))).toBe(true)
    expect(hasUseClient(read(join(FOLDER, 'hook.ts')))).toBe(true)
    for (const part of readdirSync(join(FOLDER, 'parts'))) expect(hasUseClient(read(join(FOLDER, 'parts', part))), part).toBe(true)
    expect(hasUseClient(read(join(FOLDER, 'index.tsx')))).toBe(false)
  })

  it('the parts are the panel and its rows, one component each, named after the file', () => {
    expect(readdirSync(join(FOLDER, 'parts')).sort()).toEqual(['command-panel.tsx', 'command-rows.tsx'])
    expect(read(join(FOLDER, 'parts', 'command-panel.tsx'))).toMatch(/^export function CommandPanel\(/m)
    expect(read(join(FOLDER, 'parts', 'command-rows.tsx'))).toMatch(/^export function CommandRows\(/m)
  })

  it('client.tsx calls one hook, the parts call at most one, and neither calls a React state hook itself', () => {
    const calls = (file: string) => [...blankComments(read(file)).matchAll(/\buse[A-Z]\w*\(/g)].map((m) => m[0])
    expect(calls(CLIENT)).toEqual(['useCommand('])
    expect(calls(join(FOLDER, 'parts', 'command-panel.tsx'))).toEqual(['useCommandPanel('])
    expect(calls(join(FOLDER, 'parts', 'command-rows.tsx'))).toEqual([])
  })
})
