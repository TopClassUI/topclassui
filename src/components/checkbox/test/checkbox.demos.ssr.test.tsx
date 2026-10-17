import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'form', 'labelled', 'rtl', 'sizes', 'skeleton', 'states']

/** Each box of each demo, as the server writes it: its name, by aria-label, by a label[for] or by a wrapping label, and its state. */
const BOXES: Record<string, string[]> = {
  'basic': ['I accept the terms: true', 'Send me product news: false'],
  'form': ['I accept the terms: true', 'Send me product news: false'],
  'labelled': ['Named by a label that points at it: false', 'Named by a label that wraps it: false'],
  'rtl': ['أوافق على الشروط: true', 'أرسل لي أخبار المنتج: false'],
  'sizes': ['Extra small: true', 'Small: true', 'Medium: true', 'Large: true', 'Extra large: true'],
  'skeleton': ['Terms, xs: false', 'Terms, sm: false', 'Terms, md: false', 'Terms, lg: false', 'Terms, xl: false'],
  'states': [
    'Unchecked: false', 'Checked: true', 'Indeterminate: mixed', 'Invalid: false', 'Invalid, checked: true',
    'Invalid, indeterminate: mixed', 'Disabled: false', 'Disabled, checked: true', 'Read-only: true',
  ],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: a name a screen reader gets with no script, and the state. */
function boxesIn(html: string): string[] {
  return [...html.matchAll(/<button [^>]*role="checkbox"[^>]*>/g)].map(([button]) => {
    const own = /aria-label="([^"]*)"/.exec(button)?.[1]
    const id = /\bid="([^"]*)"/.exec(button)?.[1]
    const pointed = id ? new RegExp(`<label for="${id}"[^>]*>([^<]*)</label>`).exec(html)?.[1] : undefined
    const wrapped = id ? new RegExp(`<label [^>]*><button [^>]*id="${id}"[\\s\\S]*?</button><input [^>]*/>([^<]*)</label>`).exec(html)?.[1] : undefined
    return `${own ?? pointed ?? wrapped ?? '(no name)'}: ${/aria-checked="([^"]*)"/.exec(button)?.[1] ?? '?'}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the seven demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each box as a named button with its state`, async () => {
      expect(boxesIn(await render(file)), file).toEqual(BOXES[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, nativeButton or render', () => {
    expect(sources.filter(([, source]) => /tabIndex|nativeButton|render=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a checkbox needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: a ticked box named terms and an unticked one that sends no, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toContain('name="terms" checked=""')
    expect(html).toContain('<input type="hidden" name="news" value="no"/>')
  })

  it('labelled: one label points at its box, and one wraps it', async () => {
    const html = await render('labelled')
    expect(html).toContain('<label for="checkbox-labelled-for"')
    expect(html).toMatch(/<label class="[^"]*"><button [^>]*id="checkbox-labelled-wrap"/)
  })

  it('skeleton: each checkbox beside a hidden skeleton of the same size, five pairs', async () => {
    const html = await render('skeleton')
    expect([...html.matchAll(/data-pair="([^"]*)"/g)].map(([, size]) => size)).toEqual(['xs', 'sm', 'md', 'lg', 'xl'])
    expect(html.match(/<span class="[^"]*" aria-hidden="true"><span class="[^"]*"><\/span><\/span>/g)).toHaveLength(5)
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
  })
})
