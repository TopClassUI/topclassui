import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { hasLateUseClient, hasUseClient, importedModules, importedNames } from '../../../../scripts/lib/source-checks.js'
import { DISMISS, DISMISS_TONE } from '../classes.js'

const FOLDER = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

describe('the folder is split: a server root and a client shell', () => {
  it('holds the server files plus client.tsx, hook.ts and lib.ts, and nothing else', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'schema.ts', 'test', 'types.ts', 'variants.ts',
    ])
  })
})

describe('index.tsx stays a Server Component (R-5.1-1)', () => {
  const source = read('index.tsx')

  it('has no use client, so a server page renders a plain banner itself', () => {
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
  })

  it('takes the shell from client.tsx, re-exports BannerDismissible, and nothing from hook.ts', () => {
    expect(importedNames(source, './client.js')).toEqual(['BannerShell'])
    expect(source).toContain("export { BannerDismissible } from './client.js'")
    expect(importedModules(source).filter((m) => m === './hook.js')).toEqual([])
    expect(importedNames(source, './lib.js')).toEqual(['isEmpty'])
  })
})

describe('client.tsx is markup and one hook call (R-5.12-1)', () => {
  const source = read('client.tsx')

  it("starts with 'use client'", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
  })

  it('imports nothing from React and nothing from the provider: both come through hook.ts', () => {
    expect(importedModules(source).filter((m) => m === 'react' || m.includes('provider'))).toEqual([])
    expect(importedNames(source, './hook.js')).toEqual(['useBannerDismiss'])
  })
})

describe('hook.ts and lib.ts', () => {
  it("hook.ts starts with 'use client' and keeps the store in lib.ts", () => {
    const source = read('hook.ts')
    expect(source.startsWith("'use client'\n")).toBe(true)
    expect(importedNames(source, 'react')).toEqual(['useSyncExternalStore'])
    expect(importedNames(source, './lib.js').sort()).toEqual(['readDismissed', 'subscribeDismissed', 'writeDismissed'])
  })

  it('lib.ts imports no React, so the store and the message test are plain code', () => {
    expect(importedModules(read('lib.ts'))).toEqual(['./constants.js'])
  })
})

describe('the x', () => {
  const classes = DISMISS.split(' ')

  it('is an icon button with the soft hover, pushed to the inline end of its line', () => {
    for (const name of ['inline-flex', 'shrink-0', 'rounded-control', 'outline-none', 'focus-visible:outline-solid',
      'min-h-[var(--tc-target-min,24px)]', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
      'hover:bg-(--tc-soft-hover)', 'active:bg-(--tc-soft-active)', 'ms-auto']) {
      expect(classes, name).toContain(name)
    }
  })

  it('draws an outline on hover under forced colours, where the fill is erased', () => {
    expect(classes).toContain('forced-colors:hover:outline-solid')
    expect(classes).toContain('forced-colors:hover:outline-(length:--tc-line-width)')
  })

  it('takes the tone utility of each of the six tones, written out', () => {
    expect(DISMISS_TONE).toEqual({
      primary: 'tone-primary', neutral: 'tone-neutral', success: 'tone-success',
      warning: 'tone-warning', danger: 'tone-danger', info: 'tone-info',
    })
  })
})
