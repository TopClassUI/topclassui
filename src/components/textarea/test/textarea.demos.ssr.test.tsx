import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['autosize', 'basic', 'form', 'long-content', 'row', 'rtl', 'show-count', 'sizes', 'skeleton', 'states']

/** Each textarea of each demo as the server writes it: its name, by aria-label or by the label that points at its id, and its rows. */
const TEXTAREAS: Record<string, string[]> = {
  'autosize': ['Grows: 3', 'Past six rows: 6'],
  'basic': ['About you: 3'],
  'form': ['Message: 3', 'Notes: 3'],
  'long-content': ['One long word: 3', 'One long word, own width: 3', 'Sixty lines: 6'],
  'row': ['What went well: 3', 'What did not: 3', 'What went well, counted: 3', 'What did not, counted: 3'],
  'rtl': ['نبذة عنك: 3', 'ملاحظة: 3'],
  'show-count': ['Always counted: 3', 'Counted near the cap: 3', 'At the cap: 3', 'No cap: 3'],
  'sizes': ['Extra small: 3', 'Small: 3', 'Medium: 3', 'Large: 3', 'Extra large: 3'],
  'skeleton': ['Message, xs: 3', 'Message, sm: 3', 'Message, md: 3', 'Message, lg: 3', 'Message, xl: 3', 'One row: 1', 'Full width: 5'],
  'states': ['Idle: 3', 'Filled: 3', 'Invalid: 3', 'Disabled: 3', 'Read-only: 3', 'Required: 3'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name a screen reader gets with no script, and the rows. */
function textareasIn(html: string): string[] {
  return [...html.matchAll(/<textarea [^>]*>/g)].map(([tag]) => {
    const own = /aria-label="([^"]*)"/.exec(tag)?.[1]
    const id = /\bid="([^"]*)"/.exec(tag)?.[1]
    const label = id ? new RegExp(`<label for="${id}"[^>]*>([^<]*)</label>`).exec(html)?.[1] : undefined
    return `${own ?? label ?? '(no name)'}: ${/rows="([^"]*)"/.exec(tag)?.[1] ?? '?'}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the ten demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each textarea named, with its rows`, async () => {
      expect(textareasIn(await render(file)), file).toEqual(TEXTAREAS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex', () => {
    expect(sources.filter(([, source]) => /tabIndex/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a textarea needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })

  it('no button of a form demo is named reset, which would hide form.reset', () => {
    expect(sources.filter(([, source]) => /(id|name)="reset"/.test(source)).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: a plain form with a submit and a reset button', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toContain('type="submit"')
    expect(html).toContain('type="reset"')
  })

  it('rtl: the counter reads Arabic-Indic digits in the server HTML, in left-to-right order', async () => {
    expect(await render('rtl')).toContain('<span aria-hidden="true" dir="ltr">٢٤ / ٥٠٠</span><span class="sr-only">عدد الأحرف: ٢٤ من ٥٠٠</span>')
  })

  it('show-count: counted from the start, empty below nine tenths, bold at the cap, none with no cap', async () => {
    const html = await render('show-count')
    expect([...html.matchAll(/<span aria-hidden="true" dir="ltr">([^<]*)<\/span>/g)].map(([, text]) => text)).toEqual(['12 / 60', '12 / 12'])
    expect(html.match(/data-at-limit=""/g)).toHaveLength(1)
  })
})
