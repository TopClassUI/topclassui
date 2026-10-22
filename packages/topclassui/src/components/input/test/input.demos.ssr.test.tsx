import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = [
  'custom-size', 'full-width', 'labelled', 'playground', 'row', 'rtl', 'sizes', 'skeleton', 'skeleton-match', 'stage', 'states',
  'types',
]

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

/** Every input's tag, so each one is checked rather than the first. */
const inputs = (html: string) => [...html.matchAll(/<input [^>]*>/g)].map((m) => m[0])

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders the control box`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
      // Not toContain('<'): an empty div passes that, and both parts wear the radius knob.
      expect(await render(file), file).toContain('rounded-control')
    })

    it(`${file}.tsx names every input, and every id or aria-labelledby meets its text`, async () => {
      const html = await render(file)
      for (const tag of inputs(html)) {
        const label = attr(tag, 'aria-label')
        const by = attr(tag, 'aria-labelledby')
        const id = attr(tag, 'id')
        expect(label !== undefined || by !== undefined || id !== undefined, `${file}: ${tag}`).toBe(true)
        if (label !== undefined) expect(label.trim(), file).not.toBe('')
        if (by !== undefined) expect(new RegExp(`id="${by}"[^>]*>[^<]+<`).test(html), `${file}: #${by}`).toBe(true)
        // An id alone names nothing: a label in the same demo has to point at it.
        if (label === undefined && by === undefined) {
          expect(new RegExp(`<label for="${id ?? ''}"[^>]*>[^<]+<`).test(html), `${file}: #${id ?? ''}`).toBe(true)
        }
      }
    })

    it(`${file}.tsx holds no bare link or button, which the target-size spec would measure`, async () => {
      const html = await render(file)
      expect(html, file).not.toMatch(/<a /)
      // A Button is not bare: it carries the floor that spec measures, at both pointer types.
      for (const tag of html.match(/<button [^>]*>/g) ?? []) {
        expect(tag, file).toContain('min-h-[var(--tc-target-min,24px)]')
        expect(tag, file).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
      }
    })
  }
})

describe('the demos cover what PLAN 20 asks for', () => {
  const all = async () => (await Promise.all(EXPECTED.map(render))).join('')

  it('renders an input in every demo but the skeleton, which renders none', async () => {
    for (const file of EXPECTED) {
      const count = inputs(await render(file)).length
      if (file === 'skeleton') expect(count, file).toBe(0)
      else expect(count, file).toBeGreaterThan(0)
    }
  })

  it('shows every size', async () => {
    const html = await all()
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) expect(html, size).toContain(`data-size="${size}"`)
  })

  it('shows the disabled, read-only, invalid and filled states', async () => {
    const html = await render('states')
    expect(html).toContain('disabled=""')
    expect(html).toContain('readOnly=""')
    expect(html).toContain('data-invalid=""')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('value="jo@mail.com"')
  })

  it('shows every text type, a number, a date, a caller cap and no cap', async () => {
    const html = await render('types')
    for (const type of ['email', 'password', 'search', 'tel', 'url', 'number', 'date', 'text']) {
      expect(html, type).toContain(`type="${type}"`)
    }
    expect(html).toContain('maxLength="6"')
    const uncapped = inputs(html).filter((tag) => !tag.includes('maxLength'))
    expect(uncapped.map((tag) => attr(tag, 'aria-label'))).toEqual(['Age', 'Start date', 'Uncapped'])
  })

  it('shows a full-width input beside one at its own width', async () => {
    const tags = inputs(await render('full-width'))
    expect(tags.map((tag) => / w-full[ "]/.test(tag))).toEqual([true, false])
  })

  it('fills the column in the types demo, so a date and a text field line up', async () => {
    // A grid stretches a date, whose width is auto, but not a text field at its own width.
    const tags = inputs(await render('types'))
    expect(tags.length).toBeGreaterThan(5)
    expect(tags.filter((tag) => !/ w-full[ "]/.test(tag)).map((tag) => attr(tag, 'aria-label'))).toEqual([])
  })

  it('draws every state at the frame\'s 128 px field', async () => {
    const tags = inputs(await render('states'))
    expect(tags.filter((tag) => / w-32[ "]/.test(tag)).map((tag) => attr(tag, 'aria-label'))).toEqual(['idle', 'hover', 'focus-visible', 'disabled', 'read-only', 'invalid'])
  })

  it('shows the skeleton hidden from assistive technology', async () => {
    expect(await render('skeleton')).toContain('aria-hidden="true"')
  })

  it('shows the skeleton at its own width three times, then filling the column', async () => {
    const spans = (await render('skeleton')).match(/<span class="[^"]*"/g) ?? []
    expect(spans.map((tag) => / w-full"/.test(tag))).toEqual([false, false, false, true])
    expect(spans.map((tag) => / w-\[min\(100%,var\(--tc-input-width\)\)\]"/.test(tag))).toEqual([true, true, true, false])
  })

  it('playground: the schema props a Try it control sets reach the input', async () => {
    const loaded = await import('../dummy/playground.js') as { default: ComponentType<{ size?: string, invalid?: boolean }> }
    const html = markup(<loaded.default size="lg" invalid />)
    expect(html).toContain('data-size="lg"')
    expect(html).toContain('aria-invalid="true"')
  })

  it('ties the hint to the labelled input', async () => {
    const html = await render('labelled')
    expect(html).toContain('aria-describedby="demo-email-hint"')
    expect(html).toContain('id="demo-email-hint"')
  })

  it('renders the right-to-left demo inside dir="rtl"', async () => {
    expect(await render('rtl')).toMatch(/^<div dir="rtl" lang="ar"/)
  })

  it('keeps the email and the number left-to-right inside it, and the name with the form', async () => {
    const tags = inputs(await render('rtl'))
    expect(tags.map((tag) => [attr(tag, 'type'), attr(tag, 'dir')]))
      .toEqual([['text', undefined], ['email', 'ltr'], ['number', 'ltr'], ['text', undefined]])
    expect(tags.find((tag) => attr(tag, 'type') === 'number')).toContain('value="-1234.5"')
  })

  it('shows two inputs at their own width in a flex row inside a grid form', async () => {
    const html = await render('row')
    expect(html).toMatch(/^<form class="grid gap-4"><div data-row="own" class="flex gap-2"><input /)
    const own = inputs(/<div data-row="own"[^>]*>(.*?)<\/div>/.exec(html)?.[1] ?? '')
    expect(own.map((tag) => / w-\[min\(100%,var\(--tc-input-width\)\)\][ "]/.test(tag))).toEqual([true, true])
    const grow = inputs(/<div data-row="grow"[^>]*>(.*?)<\/div>/.exec(html)?.[1] ?? '')
    expect(grow.map((tag) => / flex-1[ "]/.test(tag))).toEqual([true, true])
  })

  it('shows the recipe beside a Button: flex-1 on the field, so the Button keeps its label', async () => {
    const action = /<div data-row="action" class="flex gap-2">(.*?)<\/div>/.exec(await render('row'))?.[1] ?? ''
    expect(inputs(action).map((tag) => / flex-1[ "]/.test(tag))).toEqual([true])
    expect(action).toMatch(/^<input [^>]*\/><button [^>]*><span [^>]*>Send invite<\/span><\/button>$/)
  })

  it('shows each field with the skeleton that stands in for it, one pair per case', async () => {
    const html = await render('skeleton-match')
    const pairs = [...html.matchAll(/data-pair="([a-z]+)"/g)].map((m) => m[1])
    expect(pairs).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'full', 'custom', 'label', 'narrow'])
    expect(inputs(html).length).toBe(9)
    expect(html.match(/<span class="[^"]*" aria-hidden="true">/g)?.length).toBe(9)
  })
})
