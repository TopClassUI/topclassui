import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import type { DatePickerDesignProps } from '../types.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'form', 'in-field', 'limits', 'playground', 'rtl', 'sizes', 'states', 'week-start']

/** Each DatePicker of each demo as the server writes it: its name, then what its trigger shows. */
const PICKERS: Record<string, string[]> = {
  'basic': ['Check-in: Sep 22, 2026'],
  'form': ['Check-in: Oct 2, 2026'],
  'in-field': ['Check-in: Oct 2, 2026'],
  'limits': ['Check-in: Oct 2, 2026'],
  'playground': ['Check-in: Sep 22, 2026'],
  'rtl': ['تاريخ الوصول: 22/09/2026'.replaceAll('/', `${String.fromCodePoint(0x200f)}/`)],
  'sizes': ['Extra small: Sep 22, 2026', 'Small: Sep 22, 2026', 'Medium: Sep 22, 2026', 'Large: Sep 22, 2026', 'Extra large: Sep 22, 2026'],
  'states': ['Nothing chosen: Pick a date', 'Selected: Sep 22, 2026', 'Invalid: Sep 22, 2026', 'Disabled: Sep 22, 2026'],
  'week-start': ['Monday first: Sep 22, 2026', 'Saturday first: Sep 22, 2026', 'The locale\'s first day: 22 Sept 2026'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name a screen reader gets with no script, and the text of the trigger. */
function pickersIn(html: string): string[] {
  return [...html.matchAll(/<button [^>]*aria-haspopup="dialog"[^>]*>.*?<span id="[^"]*"[^>]*>([^<]*)<\/span><\/button>/g)].map(([button = '', text = '']) => {
    const own = /aria-label="([^"]*)"/.exec(button)?.[1]
    const by = /aria-labelledby="([^"]*)"/.exec(button)?.[1]
    const id = / id="([^"]*)"/.exec(button)?.[1]
    const label = by ? new RegExp(`id="${by}"[^>]*>([^<]*)<`).exec(html)?.[1] : id ? new RegExp(`<label for="${id}"[^>]*>([^<]*)<`).exec(html)?.[1] : undefined
    return `${own ?? label ?? '(no name)'}: ${text}`.replace(/&#x27;/g, '\'')
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each DatePicker named, showing its day in the locale or the placeholder`, async () => {
      expect(pickersIn(await render(file)), file).toEqual(PICKERS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, a render or a function prop other than Field\'s child', () => {
    expect(sources.filter(([, source]) => /tabIndex|render=|on[A-Z]\w*=\{/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a DatePicker takes only data', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: the form input carries the name and the ISO default, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toMatch(/<input [^>]*name="checkIn" value="2026-10-02"/)
  })

  it('playground: the schema props a Try it control sets reach the DatePicker', async () => {
    const loaded = await import('../dummy/playground.js') as { default: ComponentType<DatePickerDesignProps> }
    const html = markup(<loaded.default size="lg" invalid />)
    expect(html).toContain('data-size="lg"')
    expect(html).toContain('aria-invalid="true"')
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
  })

  it('in-field: the label names the trigger, and its hint is read after the day', async () => {
    const html = await render('in-field')
    const button = /<button [^>]*>/.exec(html)?.[0] ?? ''
    const ids = /aria-describedby="([^"]*)"/.exec(button)?.[1]?.split(' ') ?? []
    expect(ids.map((id) => new RegExp(`id="${id}"[^>]*>([^<]*)<`).exec(html)?.[1])).toEqual(['Oct 2, 2026', 'Rooms are ready from 15:00'])
    expect(html).toMatch(/<input [^>]*name="checkIn" value="2026-10-02"/)
  })

  it('states: invalid points at its message, disabled says so', async () => {
    const html = await render('states')
    expect(html).toMatch(/aria-invalid="true"/)
    expect(html).toMatch(/aria-describedby="[^"]* date-picker-states-error"/)
    expect(html).toMatch(/<button [^>]*disabled=""[^>]*aria-label="Disabled"/)
  })
})
