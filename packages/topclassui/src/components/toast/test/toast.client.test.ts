import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { hasUseClient, importedModules, importedNames } from '../../../../scripts/lib/source-checks.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

describe('the folder is the client template, with the files PLAN names for Toast', () => {
  it('holds exactly them: no variants, no skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'schema.ts', 'test', 'types.ts',
    ])
  })
})

describe('index.tsx (R-5.1-1, R-5.1-2)', () => {
  const source = read('index.tsx')

  it('has no use client and takes its two names from client.tsx and lib.ts', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(importedModules(source).sort()).toEqual(['./client.js', './lib.js', './types.js'])
  })
})

describe('client.tsx (R-5.12-1)', () => {
  const source = read('client.tsx')

  it("starts with 'use client' and imports no React hook", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
    expect(importedNames(source, 'react')).toEqual([])
  })

  it('calls one hook, the viewport\'s, from hook.ts', () => {
    expect(importedNames(source, './hook.js')).toEqual(['useToastViewport'])
    expect(source.match(/\buse[A-Z]\w*\(/g)).toEqual(['useToastViewport('])
  })

  it('imports no other Unit 3 component: Svg draws the icons, and Button lends its look to the action', () => {
    expect(importedModules(source).filter((m) => m.startsWith('#components/')).sort()).toEqual(['#components/button/index.js', '#components/svg/index.js'])
    expect(importedNames(source, '#components/button/index.js')).toEqual(['buttonVariants'])
  })

  it('renders a Root for every entry of the list, an ending one too: nothing filters it', () => {
    expect(source).toContain('viewport.toasts.map((entry) =>')
    expect(source).not.toMatch(/toasts\.filter|transitionStatus/)
  })
})

describe('lib.ts and hook.ts', () => {
  it('lib.ts imports no React, so `toast` runs outside it', () => {
    expect(importedModules(read('lib.ts')).filter((m) => m === 'react' || m.startsWith('react-dom'))).toEqual([])
    expect(hasUseClient(read('lib.ts'))).toBe(false)
  })

  it('lib.ts works on the one manager the provider listens to', () => {
    expect(importedNames(read('lib.ts'), '#shared/toast/manager.js')).toEqual(['toastManager'])
  })

  it('hook.ts takes the locale of the portal from the shared hook, never a direction of its own', () => {
    expect(importedNames(read('hook.ts'), '#shared/provider/use-portal-locale.js')).toEqual(['usePortalLocale'])
  })

  it('no file imports the schema at runtime, so zod never ships', () => {
    for (const file of ['client.tsx', 'hook.ts', 'lib.ts', 'index.tsx', 'constants.ts', 'classes.ts']) {
      expect(importedModules(read(file)).filter((m) => m.startsWith('zod')), file).toEqual([])
    }
  })
})
