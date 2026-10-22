import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'combined', 'form', 'playground', 'range', 'rtl', 'show-value', 'sizes', 'stage', 'states']

/** Each range input of each demo as the server writes it: the name a screen reader gets with no script, and the value. */
const THUMBS: Record<string, string[]> = {
  'basic': ['Volume 60'],
  'form': ['Volume 60'],
  'playground': ['Volume 60'],
  'range': ['Minimum 20', 'Maximum 80'],
  'rtl': ['مستوى الصوت 30', 'الحد الأدنى 20', 'الحد الأقصى 80'],
  'show-value': ['Brightness 40', 'Minimum 200', 'Maximum 800'],
  'sizes': ['Extra small 20', 'Small 40', 'Medium 50', 'Large 60', 'Extra large 80'],
  'combined': ['Live 40', 'Invalid 40', 'Disabled 40', 'Minimum 20', 'Maximum 70'],
  'stage': ['Volume 40', 'Balance 70'],
  'states': ['idle 40', 'hover 40', 'active 60', 'focus-visible 40', 'disabled 40', 'invalid 40'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: an aria-label, or the text an aria-labelledby points at, and the value. */
function thumbsIn(html: string): string[] {
  return [...html.matchAll(/<input [^>]*type="range"[^>]*>/g)].map(([input]) => {
    const own = /aria-label="([^"]*)"/.exec(input)?.[1]
    const by = /aria-labelledby="([^"]*)"/.exec(input)?.[1]
    const pointed = by ? new RegExp(`id="${by}"[^>]*>([^<]*)<`).exec(html)?.[1] : undefined
    return `${own ?? pointed ?? '(no name)'} ${/ value="([^"]*)"/.exec(input)?.[1] ?? ''}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the ten demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves every thumb named and at its value`, async () => {
      expect(thumbsIn(await render(file)), file).toEqual(THUMBS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, a thumbAlignment or a render', () => {
    expect(sources.filter(([, source]) => /tabIndex|thumbAlignment|render=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a slider needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: the slider carries the name and the default, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toMatch(/<input [^>]*type="range" name="volume" value="60"\/>/)
  })

  it('playground: the schema props a Try it control sets reach the slider', async () => {
    const loaded = await import('../dummy/playground.js') as { default: ComponentType<{ size?: string, showValue?: boolean }> }
    const html = markup(<loaded.default size="lg" showValue />)
    expect(html).toContain('data-size="lg"')
    expect(html).toContain('>60</output>')
  })

  it('rtl: an island that carries the direction and the language, with the value in the provider\'s format', async () => {
    const html = await render('rtl')
    expect(html).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
    expect(html).toContain('>30</output>')
  })

  it('show-value: each slider writes its value after the track, the budget as dollars', async () => {
    const html = await render('show-value')
    expect([...html.matchAll(/<output [^>]*>([^<]*)<\/output>/g)].map(([, text]) => text)).toEqual(['40', '$200 – $800'])
  })

  it('combined: the two invalid sliders say so on the group, and the disabled one disables its input', async () => {
    const html = await render('combined')
    expect(html.match(/role="group" (aria-label="Invalid range" )?dir="ltr" aria-invalid="true"/g)).toEqual([
      'role="group" dir="ltr" aria-invalid="true"', 'role="group" aria-label="Invalid range" dir="ltr" aria-invalid="true"',
    ])
    expect(html).toMatch(/<div data-disabled="" [^>]*role="group"/)
    expect(html.match(/<input [^>]*disabled=""/g)).toHaveLength(1)
  })
})
