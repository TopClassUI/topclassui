import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import type { OtpFieldDesignProps } from '../types.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'combined', 'form', 'grouped', 'long', 'playground', 'rtl', 'sizes', 'states']

/** Each field of each demo as the server writes it: the name its first cell gets with no script, its cells (a digit,
 * or _ when empty, | for a separator, ^ after the one tab stop), and its states. */
const FIELDS: Record<string, string[]> = {
  'basic': ['Verification code: ^______'],
  'form': ['Verification code: ^______'],
  'grouped': ['Verification code: ^___|___'],
  'long': ['Recovery code: ^____________ whole cells'],
  'playground': ['Verification code: 4829^__'],
  'rtl': ['رمز التحقق: ^______'],
  'sizes': ['Extra small: 482^___', 'Small: 482^___', 'Medium: 482^___', 'Large: 482^___', 'Extra large: 482^___'],
  'combined': ['Invalid: 48291^3 invalid', 'Disabled: 482^___ disabled', 'Read-only: 48291^3 read-only', 'Partly filled: 48^____', 'Complete: 48291^3'],
  'states': ['Code, idle: ^____', 'Code, focus-visible: 48^__', 'Code, partly filled: 48^__', 'Code, complete: 482^9', 'Code, invalid: 48^__ invalid', 'Code, disabled: 48^__ disabled'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name of the first cell, the cells, the separators, the tab stop and the states. */
function fieldsIn(html: string): string[] {
  return html.split(/<div (?=[^>]*role="group")/).slice(1).map((part) => {
    const group = /^[^>]*>([\s\S]*?)<\/div>/.exec(part)?.[1] ?? ''
    const items = [...group.matchAll(/<(input|span) ([^>]*)>/g)].map(([, tag, attrs = '']) => {
      if (tag === 'span') return '|'
      const digit = /value="([^"]*)"/.exec(attrs)?.[1] || '_'
      return `${attrs.includes('tabindex="0"') ? '^' : ''}${digit}`
    })
    const first = /^<input [^>]*>/.exec(group)?.[0] ?? ''
    const id = /id="([^"]*)"/.exec(first)?.[1]
    const by = /aria-labelledby="([^"]*)"/.exec(first)?.[1]
    const name = by
      ? new RegExp(`id="${by}"[^>]*>([^<]*)<`).exec(html)?.[1]
      : new RegExp(`<label for="${id ?? '-'}"[^>]*>([^<]*)<`).exec(html)?.[1]
    const states = [
      first.includes('aria-invalid="true"') ? 'invalid' : '',
      first.includes('disabled=""') ? 'disabled' : '',
      first.includes('readOnly=""') ? 'read-only' : '',
      /class="[^"]*\bgrow-0\b/.test(first) ? 'whole cells' : '',
    ].filter(Boolean)
    return [`${name ?? '(no name)'}: ${items.join('')}`, ...states].join(' ')
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the nine demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each field named on its first cell, its cells, and one tab stop`, async () => {
      expect(fieldsIn(await render(file)), file).toEqual(FIELDS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, an aria-label or a dir on the field', () => {
    expect(sources.filter(([, source]) => /tabIndex|aria-label=|<OTPField[^>]*dir=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a code field needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: the field carries the name in a plain form, and sends code= before anything is typed', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toContain('name="code" value=""/>')
  })

  it('rtl: an island that carries the direction and the language, around a group that runs left to right', async () => {
    const html = await render('rtl')
    expect(html).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar">/)
    expect(html).toMatch(/<div role="group" dir="ltr" /)
    expect(html).toContain('aria-label="الخانة 6 من 6"')
  })

  it('playground: the schema props a Try it control sets reach the field', async () => {
    const loaded = await import('../dummy/playground.js') as { default: ComponentType<OtpFieldDesignProps> }
    const html = markup(<loaded.default length={4} size="lg" invalid />)
    expect(html).toContain('data-size="lg"')
    expect(html.match(/aria-invalid="true"/g)).toHaveLength(4)
    expect(html).toContain('aria-label="Character 4 of 4"')
  })

  it('basic: the hint describes the first cell', async () => {
    expect(await render('basic')).toMatch(/<input [^>]*id="otp-basic-code" [^>]*aria-describedby="otp-basic-hint"/)
  })
})
