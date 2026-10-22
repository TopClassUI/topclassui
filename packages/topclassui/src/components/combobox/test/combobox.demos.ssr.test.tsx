import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import type { ComboboxDesignProps } from '../types.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'combined', 'form', 'load-more', 'long-content', 'playground', 'rtl', 'sizes', 'states', 'status', 'ten-thousand']

/** Each Combobox of each demo as the server writes it: its name, then the first twenty letters its input shows. */
const COMBOBOXES: Record<string, string[]> = {
  'basic': ['Framework: '],
  'combined': ['Invalid: Jordan', 'Read-only: Saudi Arabia', 'One option disabled: '],
  'form': ['Framework: Next.js'],
  'load-more': ['Search results: '],
  'long-content': ['Long, own width: Supercalifragilistic', 'Long, full width: A label long enough '],
  'playground': ['Framework: '],
  'rtl': ['المدينة: عمّان'],
  'sizes': ['Fruit, extra small: Apple', 'Fruit, small: Banana', 'Fruit, medium: Cherry', 'Fruit, large: Date', 'Fruit, extra large: '],
  'states': ['idle: ', 'focus-visible: Jordan', 'open: jor', 'loading: jor', 'Country, nothing matches: zzz', 'disabled: '],
  'status': ['City, loading: ', 'City, loading more: '],
  'ten-thousand': ['Ten thousand options: '],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name a screen reader gets with no script, and the text of the input. */
function comboboxesIn(html: string): string[] {
  return [...html.matchAll(/<input [^>]*role="combobox"[^>]*>/g)].map(([input]) => {
    const own = /aria-label="([^"]*)"/.exec(input)?.[1]
    const id = / id="([^"]*)"/.exec(input)?.[1]
    const label = id ? new RegExp(`<label for="${id}"[^>]*>([^<]*)<`).exec(html)?.[1] : undefined
    return `${own ?? label ?? '(no name)'}: ${(/ value="([^"]*)"/.exec(input)?.[1] ?? '').slice(0, 20)}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each Combobox named, showing the label of its value or nothing`, async () => {
      expect(comboboxesIn(await render(file)), file).toEqual(COMBOBOXES[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex or a render', () => {
    expect(sources.filter(([, source]) => /tabIndex|render=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('only load-more is a client file: it holds the pages, and a Combobox otherwise takes only data', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual(['load-more'])
  })
})

describe('the demos the plan names', () => {
  it('form: the hidden input carries the name and the default, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toMatch(/<input [^>]*name="framework" value="next"/)
  })

  it('playground: the schema props a Try it control sets reach the input', async () => {
    const loaded = await import('../dummy/playground.js') as { default: ComponentType<ComboboxDesignProps> }
    const html = markup(<loaded.default size="lg" invalid />)
    expect(html).toMatch(/<input [^>]*aria-invalid="true"/)
    expect(html).toContain('data-size="lg"')
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/<div dir="rtl" lang="ar" class="[^"]*">/)
  })

  it('status: the loading one is busy and spins, the loading-more one is busy', async () => {
    const html = await render('status')
    expect([...html.matchAll(/aria-busy="true"/g)]).toHaveLength(2)
    expect([...html.matchAll(/animate-spin/g)]).toHaveLength(1)
  })
})
