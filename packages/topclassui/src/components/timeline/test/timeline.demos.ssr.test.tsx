import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'empty', 'icons', 'loading', 'long-text', 'rtl', 'states', 'tones']

const load = async (file: string) => (await import(`../dummy/${file}.tsx`) as { default: ComponentType }).default

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files.filter((f) => f !== 'empty' && f !== 'loading')) {
    it(`${file}.tsx exports one default demo that renders a timeline`, async () => {
      const Demo = await load(file)
      expect(typeof Demo, file).toBe('function')
      // Not toContain('<'): an empty div passes that, and every timeline is an ol of items.
      expect(markup(<Demo />), file).toMatch(/<ol class="flex flex-col"[^>]* role="list"><li /)
    })
  }

  it('the loading demo renders the skeleton, hidden, and no list', async () => {
    const Demo = await load('loading')
    const out = markup(<Demo />)
    expect(out).toContain('aria-hidden="true"')
    expect(out.match(/rounded-full/g)).toHaveLength(3)
    expect(out).not.toContain('<ol')
  })

  it('the empty demo renders its fallback and no list', async () => {
    const Demo = await load('empty')
    expect(markup(<Demo />)).toBe('<p class="text-sm text-muted">No activity yet.</p>')
  })

  it('the basic demo shows the three drawn statuses, with one current step', async () => {
    const Demo = await load('basic')
    const out = markup(<Demo />)
    expect([...out.matchAll(/data-status="(\w+)"/g)].map((m) => m[1])).toEqual(['done', 'done', 'current', 'todo'])
    expect(out.match(/aria-current="step"/g)).toHaveLength(1)
  })

  it('the basic demo passes a time element, so a date reaches a machine as well as a reader', async () => {
    const Demo = await load('basic')
    const out = markup(<Demo />)
    expect([...out.matchAll(/<time dateTime="([^"]*)">([^<]*)<\/time>/g)].map((m) => [m[1], m[2]]))
      .toEqual([['2026-10-02T09:12', '2 October, 09:12'], ['2026-10-04T16:40', '4 October, 16:40']])
    expect(out).toContain('<div class="text-xs text-muted"><time dateTime="2026-10-02T09:12">')
  })

  it('shows all six tones in the tones demo', async () => {
    const Demo = await load('tones')
    expect([...markup(<Demo />).matchAll(/data-tone="(\w+)"/g)].map((m) => m[1]))
      .toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  it('the rtl demo sets the direction on a wrapper and passes none to the timeline', async () => {
    const Demo = await load('rtl')
    expect(markup(<Demo />)).toMatch(/^<div dir="rtl" lang="ar"><ol class="flex flex-col" role="list">/)
  })

  it('the rtl demo says each status in Arabic, not in the English default', async () => {
    const Demo = await load('rtl')
    expect([...markup(<Demo />).matchAll(/<span class="sr-only">([^<]*)<\/span>/g)].map((m) => m[1]))
      .toEqual(['مكتمل', 'مكتمل', 'الحالي', 'لم يبدأ'])
  })
})
