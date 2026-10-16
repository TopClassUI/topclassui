import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'controls', 'form', 'group', 'hint-error', 'inline', 'live', 'long-content', 'required', 'rtl']

const WORD = 'x'.repeat(300)
const SENTENCE = 'A label long enough to wrap onto several lines on any phone, '.repeat(5).trim()

/** Each control of each demo as the server writes it, read through its ids alone: name | description | invalid | required. */
const CONTROLS: Record<string, string[]> = {
  'basic': ['input: Email |  |  | '],
  'controls': [
    'input: Email | Input hint Input error | invalid | required',
    'textarea: Bio | Textarea hint Textarea error | invalid | ',
    'button: Terms | Checkbox hint Checkbox error | invalid | required',
    'button: Digest | Switch hint Switch error | invalid | ',
    'div: Plan | RadioGroup hint RadioGroup error | invalid | required',
    'div: View | SegmentedControl hint SegmentedControl error | invalid | ',
    'input: Volume | Slider hint Slider error |  | ',
    'input: Guests | NumberField hint NumberField error | invalid | ',
    'div: Code |  |  | ',
    'input: Code | OTPField hint OTPField error | invalid | ',
    'button: Country | Select hint Select error | invalid | required',
    'input: City | Combobox hint Combobox error | invalid | ',
  ],
  'form': ['input: Email | We never share it |  | required', 'textarea: Message |  |  | ', 'button: I accept the terms |  |  | '],
  'group': ['div: Plan | You can change it later |  | required'],
  'hint-error': [
    'input: Username | Letters and numbers only That name is taken | invalid | ',
    'textarea: About you | Shown on your profile Too short Add at least one sentence | invalid | ',
    'input: Website | Optional |  | ',
  ],
  'inline': ['button: Send me product news | About once a month |  | ', 'button: Weekly digest | Turn it on to get the summary | invalid | '],
  'live': ['input: Nickname | Shown to other players |  | ', 'button: Size | Pick the size you ordered | invalid | required'],
  'long-content': [`input: ${WORD} | ${WORD} ${WORD} | invalid | required`, `button: ${SENTENCE} | ${WORD} |  | `],
  'required': ['input: Email | We never share it |  | required', 'button: I accept the terms |  |  | required'],
  'rtl': ['input: البريد الإلكتروني | لن نشاركه مع أحد هذا البريد مستخدم | invalid | required', 'button: أوافق على الشروط | اقرأها قبل المتابعة |  | '],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

const textOf = (html: string) => html.replace(/<[^>]*aria-hidden="true"[^>]*>.*?<\/(span|svg)>/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

/** The inner HTML of the element with this id, nested elements of its own kind counted. */
function inner(html: string, id: string): string {
  const open = new RegExp(`<([a-z]+) id="${id}"[^>]*>`).exec(html)
  if (!open) return '(missing)'
  const tag = open[1] ?? ''
  const start = open.index + open[0].length
  const pattern = new RegExp(`<${tag}\\b|</${tag}>`, 'g')
  pattern.lastIndex = start
  let depth = 1
  for (let found = pattern.exec(html); found; found = pattern.exec(html)) {
    depth += found[0].startsWith('</') ? -1 : 1
    if (depth === 0) return html.slice(start, found.index)
  }
  return '(unclosed)'
}

/** Every element that a Field names, read as a screen reader would with no script: through the ids alone. */
function controlsIn(html: string): string[] {
  return [...html.matchAll(/<([a-z]+) [^>]*aria-labelledby="([^"]*-label)"[^>]*>/g)].map(([tag, kind, label]) => {
    const describedBy = /aria-describedby="([^"]*)"/.exec(tag)?.[1]
    const description = describedBy ? describedBy.split(' ').map((id) => textOf(inner(html, id))).join(' ') : ''
    const invalid = /aria-invalid="true"/.test(tag) ? 'invalid' : ''
    const required = /\s(required=""|aria-required="true")/.test(tag) ? 'required' : ''
    return `${kind ?? ''}: ${textOf(inner(html, label ?? ''))} | ${description} | ${invalid} | ${required}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each control named by its label, described by its hint and error, before any script`, async () => {
      expect(controlsIn(await render(file)), file).toEqual(CONTROLS[file])
    })
  }

  for (const file of files) {
    it(`${file}.tsx writes no id twice, and every label's for is an id of the page`, async () => {
      const html = await render(file)
      const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => id)
      expect(ids.length - new Set(ids).size, file).toBe(0)
      for (const [, target] of html.matchAll(/<label [^>]*for="([^"]*)"/g)) expect(ids, `${file}: ${String(target)}`).toContain(target)
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, an id or a label of its own: the Field writes them', () => {
    expect(sources.filter(([, source]) => /tabIndex|\bid=|htmlFor|aria-labelledby=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('only the live demo is a client file: Field is a server component', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual(['live'])
  })

  it('every row of a demo wraps: one that cannot widens the column it sits in past a 320 px screen at a 32 px root', () => {
    expect(sources.flatMap(([file, source]) => [...source.matchAll(/className="([^"]*)"/g)]
      .filter(([, classes]) => /(^| )flex( |$)/.test(classes ?? '') && !/(^| )(flex-wrap|flex-col)( |$)/.test(classes ?? ''))
      .map(([, classes]) => `${file}: ${classes ?? ''}`))).toEqual([])
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

  it('rtl: right to left and Arabic, around the fields', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar"/)
  })
})
