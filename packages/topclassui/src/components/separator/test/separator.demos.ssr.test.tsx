import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['horizontal', 'playground', 'rtl', 'semantic', 'states', 'vertical']

/** What each demo must hold: its separators, by orientation and role, in document order. */
const SEPARATORS: Record<string, string[]> = {
  horizontal: ['horizontal none'],
  playground: ['horizontal none'],
  rtl: ['horizontal none', 'vertical none'],
  semantic: ['horizontal separator', 'vertical separator'],
  states: ['horizontal none', 'vertical none', 'horizontal none'],
  vertical: ['vertical none'],
}

const separatorsIn = (html: string) =>
  [...html.matchAll(/<div data-orientation="([a-z]+)"[^>]* role="([a-z]+)"/g)]
    .map((m) => `${m[1] ?? ''} ${m[2] ?? ''}`)

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders its separators`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      const Demo = loaded.default
      expect(typeof Demo, file).toBe('function')
      if (!Demo) return
      expect(separatorsIn(markup(<Demo />)), file).toEqual(SEPARATORS[file])
    })
  }

  it('puts the vertical demo in the flex h-5 row the spec draws, since it draws only in a flex or grid parent', async () => {
    const { default: Demo } = await import(`../dummy/vertical.tsx`) as { default: ComponentType }
    expect(markup(<Demo />)).toMatch(/^<div class="flex h-5 items-center gap-3[^"]*">/)
  })

  it('sets the rtl demo right to left, in Arabic', async () => {
    const { default: Demo } = await import(`../dummy/rtl.tsx`) as { default: ComponentType }
    expect(markup(<Demo />)).toMatch(/^<div dir="rtl" lang="ar"/)
  })
})
