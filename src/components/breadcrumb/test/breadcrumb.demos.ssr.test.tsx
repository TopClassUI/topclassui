import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['all-links', 'basic', 'deep-trail', 'long-label', 'long-trail', 'rtl']

const load = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders one breadcrumb`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      const Demo = loaded.default
      expect(typeof Demo, file).toBe('function')
      if (!Demo) return
      // Not toContain('<'): an empty div passes that. One nav, or two trails share one name.
      const out = markup(<Demo />)
      expect(count(out, '<nav '), file).toBe(1)
      expect(count(out, 'application/ld+json'), file).toBe(1)
    })
  }
})

describe('each demo shows what its name says', () => {
  it('basic is the sample of the spec: two links, then the current page', async () => {
    const out = await load('basic')
    expect(count(out, '<a href=')).toBe(2)
    expect(out).toContain('<a href="/" ')
    expect(out).toContain('<a href="/docs" ')
    expect(out).toMatch(/<span aria-current="page" class="[^"]*">Breadcrumb<\/span>/)
  })

  it('all-links marks no current page, because every crumb is an ancestor', async () => {
    const out = await load('all-links')
    expect(count(out, '<a href=')).toBe(3)
    expect(out).not.toContain('aria-current')
  })

  it('long-trail has nine crumbs in a column narrow enough to wrap them', async () => {
    const out = await load('long-trail')
    expect(count(out, '<li')).toBe(9)
    expect(count(out, '<svg')).toBe(8)
    expect(out).toMatch(/^<div class="[^"]*max-w-85[^"]*">/)
  })

  it('deep-trail is twelve long crumbs with no box around them, which is what a phone has to fit', async () => {
    const out = await load('deep-trail')
    expect(out).toMatch(/^<nav /)
    expect(count(out, '<li')).toBe(12)
    expect(count(out, '<a href=')).toBe(11)
    expect(out).toContain('<a href="/handbook/step-11" ')
    expect(out).toContain('>Worked examples for a split leave across two tax years</span></li>')
  })

  it('long-label puts a link and a current page wider than the box inside a narrow one', async () => {
    const out = await load('long-label')
    expect(out).toMatch(/^<div class="[^"]*w-60[^"]*">/)
    expect(out).toContain('>Everything you need to know before migrating a design system</span></a>')
    expect(out).toContain('>A step-by-step guide to moving every component to logical properties</span></li>')
  })

  it('rtl sets the direction, names the nav in Arabic and keeps the flipping caret', async () => {
    const out = await load('rtl')
    expect(out).toMatch(/^<div dir="rtl" lang="ar">/)
    expect(out).not.toContain('aria-label="Breadcrumb"')
    expect(out).toMatch(/<nav aria-label="[^"A-Za-z]+"/)
    expect(count(out, 'rtl:-scale-x-100')).toBe(2)
  })
})
