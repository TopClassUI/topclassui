import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'form', 'in-field', 'multiple', 'rtl', 'states']

/** Each file input of each demo, as the server writes it: its name by the label that points at its id, its form name,
 * and the attributes a form reads. */
const INPUTS: Record<string, string[]> = {
  basic: ['Attachment: attachment, one, accept .png,.jpg,.jpeg,.pdf'],
  form: ['Attachments: attachments, multiple, required'],
  'in-field': ['Attachments: attachments, multiple, accept application/pdf,image/png'],
  multiple: ['Attachments: attachments, multiple, accept application/pdf,image/png'],
  rtl: ['المرفقات: attachments, multiple, accept application/pdf,image/png'],
  states: ['Invalid: invalid, one, invalid', 'Disabled: disabled, one, disabled'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name a screen reader gets with no script, and what the form reads. */
function inputsIn(html: string): string[] {
  return [...html.matchAll(/<input [^>]*type="file"[^>]*>/g)].map(([input]) => {
    const id = / id="([^"]*)"/.exec(input)?.[1] ?? ''
    const label = new RegExp(`<label [^>]*for="${id}"[^>]*>([^<]*)</label>`).exec(html)?.[1] ?? '(no name)'
    const parts = [
      / name="([^"]*)"/.exec(input)?.[1] ?? '(no form name)',
      input.includes(' multiple=""') ? 'multiple' : 'one',
      ...(/ accept="([^"]*)"/.exec(input) ? [`accept ${/ accept="([^"]*)"/.exec(input)?.[1] ?? ''}`] : []),
      ...(input.includes(' required=""') ? ['required'] : []),
      ...(input.includes('aria-invalid="true"') ? ['invalid'] : []),
      ...(input.includes(' disabled=""') ? ['disabled'] : []),
    ]
    return `${label}: ${parts.join(', ')}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each upload as a named file input with its form attributes`, async () => {
      expect(inputsIn(await render(file)), file).toEqual(INPUTS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, a multiple or an onValueChange', () => {
    expect(sources.filter(([, source]) => /tabIndex|multiple=|onValueChange/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: an upload needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: a multipart form that posts, with its submit button', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*" encType="multipart\/form-data" method="post">/)
    expect(html).toContain('type="submit"')
  })

  it('rtl: an island that carries the direction and the language, and the Arabic words', async () => {
    const html = await render('rtl')
    expect(html).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
    expect(html).toContain('<span>أفلت الملفات هنا</span>')
  })
})
