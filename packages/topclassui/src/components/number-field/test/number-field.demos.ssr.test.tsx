import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'combined', 'form', 'limits', 'playground', 'row', 'rtl', 'sizes', 'stage', 'states']

/** Each field of each demo, as the server writes it: its name, by aria-label or by the label that points at its id, and the text it shows. */
const FIELDS: Record<string, string[]> = {
  basic: ['Guests: 2'],
  form: ['Guests: 2'],
  limits: ['Seats: 8', 'Hours: 1.5'],
  playground: ['Guests: 2'],
  row: ['Adults: 2', 'Children: 0'],
  rtl: ['الفرق: ‎-5', 'عدد الضيوف: ١٬٢٣٤٫٥'],
  sizes: ['Extra small: 12', 'Small: 12', 'Medium: 12', 'Large: 12', 'Extra large: 12'],
  combined: ['Empty: ', 'Invalid: 12', 'Disabled: 12', 'Read-only: 12', 'At the limit: 99'],
  stage: ['Guests: 12'],
  states: ['idle: 12', 'hover: 12', 'focus-visible: 12', 'at-limit: 99', 'invalid: 12', 'disabled: 12'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: a name a screen reader gets with no script, and the text in the field. */
function fieldsIn(html: string): string[] {
  return [...html.matchAll(/<input [^>]*type="text"[^>]*>/g)].map(([input]) => {
    const own = /aria-label="([^"]*)"/.exec(input)?.[1]
    const id = /\bid="([^"]*)"/.exec(input)?.[1]
    const label = id ? new RegExp(`<label for="${id}"[^>]*>([^<]*)</label>`).exec(html)?.[1] : undefined
    return `${own ?? label ?? '(no name)'}: ${/\bvalue="([^"]*)"/.exec(input)?.[1] ?? '?'}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the ten demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each field named, with its number`, async () => {
      expect(fieldsIn(await render(file)), file).toEqual(FIELDS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex or a render', () => {
    expect(sources.filter(([, source]) => /tabIndex|render=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a field needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: one field named guests, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toMatch(/<input type="number"[^>]* name="guests" value="2"\/>/)
  })

  it('limits: a value at max, whose increase stepper is disabled, and a step of 0.5', async () => {
    const html = await render('limits')
    expect([...html.matchAll(/<button [^>]*aria-label="(\w+)"[^>]*>/g)].map(([button, name]) => `${String(name)}: ${button.includes(' disabled=""') ? 'off' : 'on'}`))
      .toEqual(['Decrease: on', 'Increase: off', 'Decrease: on', 'Increase: on'])
    expect(html).toMatch(/<input type="number"[^>]* step="0.5"[^>]* name="hours" value="1.5"\/>/)
  })

  it('playground: the schema props a Try it control sets reach the field', async () => {
    const loaded = await import('../dummy/playground.js') as { default: ComponentType<{ size?: string, step?: number }> }
    const html = markup(<loaded.default size="lg" step={0.5} />)
    expect(html).toContain('data-size="lg"')
    expect(html).toMatch(/<input type="number"[^>]* step="0.5"/)
  })

  it('row: two fields side by side, in tracks of 8.5rem at least, so at 200% text or under a finger the second goes under the first', async () => {
    expect(await render('row')).toMatch(/^<div class="grid grid-cols-\[repeat\(auto-fit,minmax\(min\(100%,8\.5rem\),max-content\)\)\] gap-2">/)
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
  })
})
