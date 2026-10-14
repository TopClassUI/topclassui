import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { hasLateUseClient, hasUseClient, importedModules, importedNames } from '../../../../scripts/lib/source-checks.js'
import * as tag from '../index.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

describe('the folder is a split component: a server Tag and its client x', () => {
  it('holds the server files of Unit 2, plus client.tsx and hook.ts', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx',
      'meta.ts', 'schema.ts', 'test', 'types.ts', 'variants.ts',
    ])
  })

  it('adds no public name: the x is internal, so a page exports what it did before', () => {
    expect(Object.keys(tag).sort()).toEqual(['Tag', 'tagVariants'])
  })
})

describe('index.tsx is the server half (R-5.1-1)', () => {
  const source = read('index.tsx')

  it("has no use client, so a Server Component page renders a plain tag with no client code", () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('takes useId from React and nothing else, and the x from client.tsx', () => {
    expect(importedNames(source, 'react')).toEqual(['useId'])
    expect(importedNames(source, './client.js')).toEqual(['TagRemove'])
    expect(importedModules(source)).not.toContain('./hook.js')
  })
})

describe('client.tsx is markup plus one hook (R-5.12-1)', () => {
  const source = read('client.tsx')

  it("starts with 'use client', the first statement in the file", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports nothing from React and calls one hook, its own', () => {
    expect(importedModules(source)).not.toContain('react')
    expect(importedNames(source, './hook.js')).toEqual(['useTagRemove'])
    expect(source.match(/\buse[A-Z]\w*\(/g)).toEqual(['useTagRemove('])
  })

  it('imports the schema with nothing at runtime, so zod never ships', () => {
    expect(importedModules(source).filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })
})

describe('hook.ts reads the label of the provider', () => {
  const source = read('hook.ts')

  it("starts with 'use client' and imports only the provider's labels", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
    expect(importedModules(source)).toEqual(['#shared/provider/context.js'])
    expect(importedNames(source, '#shared/provider/context.js')).toEqual(['useLabels'])
  })

  it('writes no type argument in angle brackets', () => {
    expect(source.match(/<[A-Za-z]/g)).toBeNull()
  })
})
