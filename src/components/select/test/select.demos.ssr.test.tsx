import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'form', 'four-rows', 'long-content', 'phase-4-form', 'rtl', 'sixty-items', 'sizes', 'skeleton', 'states']

/** Each Select of each demo as the server writes it: its name, then what its trigger shows. */
const SELECTS: Record<string, string[]> = {
  'basic': ['Country: Jordan'],
  'form': ['Country: Jordan'],
  'four-rows': ['Month: March'],
  'long-content': ['Office: Department of Regional Planning'],
  'phase-4-form': ['Country: Jordan'],
  'rtl': ['الدولة: الأردن'],
  'sixty-items': ['Sixty options: Option 30'],
  'sizes': ['Extra small: Pro', 'Small: Pro', 'Medium: Pro', 'Large: Pro', 'Extra large: Pro'],
  'skeleton': ['Plan, xs: Pro', 'Plan, sm: Pro', 'Plan, md: Pro', 'Plan, lg: Pro', 'Plan, xl: Pro', 'Plan, full width: Pro'],
  'states': ['Nothing chosen: Select', 'Invalid: Free', 'Disabled: Pro', 'Read-only: Team'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name a screen reader gets with no script, and the text of the trigger. */
function selectsIn(html: string): string[] {
  return [...html.matchAll(/<button [^>]*role="combobox"[^>]*><span [^>]*>([^<]*)<\/span>/g)].map(([button = '', text = '']) => {
    const own = /aria-label="([^"]*)"/.exec(button)?.[1]
    const id = / id="([^"]*)"/.exec(button)?.[1]
    const label = id ? new RegExp(`<label for="${id}"[^>]*>([^<]*)<`).exec(html)?.[1] : undefined
    const shown = text.startsWith('Department') ? text.split(',')[0] ?? '' : text
    return `${own ?? label ?? '(no name)'}: ${shown}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each Select named, showing the label of its value or the placeholder`, async () => {
      expect(selectsIn(await render(file)), file).toEqual(SELECTS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, a render or a function prop', () => {
    expect(sources.filter(([, source]) => /tabIndex|render=|getKey|=\{\(/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a Select takes only data', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: the hidden input carries the name and the default, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toMatch(/<input [^>]*name="country" value="jo"/)
  })

  it('skeleton: each Select above a hidden skeleton of the same size, five pairs and a full-width one', async () => {
    const html = await render('skeleton')
    expect([...html.matchAll(/data-pair="([^"]*)"/g)].map(([, size]) => size)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'full'])
    expect(html.match(/<span class="[^"]*" aria-hidden="true"><span class="[^"]*">\xa0<\/span><\/span>/g)).toHaveLength(6)
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
  })

  it('states: invalid points at its message, disabled and read-only say so', async () => {
    const html = await render('states')
    expect(html).toMatch(/aria-describedby="select-states-error" aria-invalid="true"|aria-invalid="true"[^>]*aria-describedby="select-states-error"/)
    expect(html).toMatch(/<button [^>]*disabled=""[^>]*aria-label="Disabled"/)
    expect(html).toMatch(/<button [^>]*aria-readonly="true"[^>]*aria-label="Read-only"/)
  })
})
