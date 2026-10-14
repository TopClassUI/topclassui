import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { NumberField } from '../index.js'

// The ssr project: what reaches the HTML before any script runs.
const visible = (html: string) => /<input [^>]*type="text"[^>]*>/.exec(html)?.[0] ?? ''
const hidden = (html: string) => /<input type="number"[^>]*>/.exec(html)?.[0] ?? ''
const steppers = (html: string) => [...html.matchAll(/<button [^>]*>/g)].map(([button]) => button)

describe('on the server', () => {
  it('a root div that owns the width, a group, the input, decrease and increase, then the hidden input', () => {
    const html = markup(<NumberField id="guests" name="guests" />)
    expect(html).toMatch(/^<div data-size="md" class="inline-grid align-middle w-fit max-w-full grid-cols-\[minmax\(0,var\(--tc-input-width\)\)\] /)
    expect([...html.matchAll(/<(div|button|input)\b[^>]*?(?: role="(\w+)")?[^>]*>/g)].map(([, tag, role]) => role ?? tag))
      .toEqual(['div', 'group', 'input', 'button', 'button', 'input'])
    expect(steppers(html).map((button) => attr(button, 'aria-label'))).toEqual(['Decrease', 'Increase'])
  })

  it('the input is the first labelable element, so a label that wraps the field names it; decrease is put first by order', () => {
    const html = markup(<NumberField aria-label="A" />)
    expect(/<(input|button|select|textarea)\b/.exec(html)?.[1]).toBe('input')
    expect(attr(steppers(html)[0] ?? '', 'class')?.split(' ').at(-1)).toBe('order-first')
    expect(attr(steppers(html)[1] ?? '', 'class')?.split(' ')).not.toContain('order-first')
  })

  it('defaultValue={50} with max={10} renders and submits 10: the clamp is ours, Base UI clamps only what is typed', () => {
    const html = markup(<NumberField aria-label="A" name="a" defaultValue={50} max={10} />)
    expect(attr(visible(html), 'value')).toBe('10')
    expect(attr(hidden(html), 'value')).toBe('10')
    expect(attr(hidden(html), 'max')).toBe('10')
  })

  it('a value under min is raised to it, and allowOutOfRange leaves it where it is', () => {
    expect(attr(hidden(markup(<NumberField aria-label="A" value={-3} min={0} />)), 'value')).toBe('0')
    expect(attr(hidden(markup(<NumberField aria-label="A" defaultValue={50} max={10} allowOutOfRange />)), 'value')).toBe('50')
  })

  it('the bounds are clamped to the limits, and a step under the floor is raised to it (R-5.7-7)', () => {
    const input = hidden(markup(<NumberField aria-label="A" min={-1e20} max={1e20} step={0} />))
    expect([attr(input, 'min'), attr(input, 'max'), attr(input, 'step')]).toEqual(['-1000000000000000', '1000000000000000', '0.000001'])
  })

  it('no min or max is passed down by default, and the step is 1', () => {
    const input = hidden(markup(<NumberField aria-label="A" />))
    expect([attr(input, 'min'), attr(input, 'max'), attr(input, 'step')]).toEqual([undefined, undefined, '1'])
    expect(attr(hidden(markup(<NumberField aria-label="A" step="any" />)), 'step')).toBe('any')
  })

  it('the id, the two ARIA names, aria-describedby and the placeholder land on the visible input', () => {
    const named = visible(markup(<NumberField id="g" aria-describedby="hint" placeholder="0" />))
    expect([attr(named, 'id'), attr(named, 'aria-describedby'), attr(named, 'placeholder')]).toEqual(['g', 'hint', '0'])
    expect(attr(visible(markup(<NumberField aria-label="Guests" />)), 'aria-label')).toBe('Guests')
    expect(attr(visible(markup(<NumberField aria-labelledby="l" />)), 'aria-labelledby')).toBe('l')
  })

  it('a label names it before any script runs: the id is on the visible input and nowhere else', () => {
    const html = markup(<><label htmlFor="g">Guests</label><NumberField id="g" name="g" /></>)
    expect(html.match(/id="g"/g)).toHaveLength(1)
    expect(attr(visible(html), 'id')).toBe('g')
  })

  it('the number is left-to-right by default, and a caller dir wins', () => {
    expect(attr(visible(markup(<NumberField aria-label="A" />)), 'dir')).toBe('ltr')
    expect(attr(visible(markup(<NumberField aria-label="A" dir="auto" />)), 'dir')).toBe('auto')
  })

  it('invalid sets aria-invalid on the input; off, a caller aria-invalid survives', () => {
    expect(attr(visible(markup(<NumberField aria-label="A" invalid />)), 'aria-invalid')).toBe('true')
    expect(attr(visible(markup(<NumberField aria-label="A" />)), 'aria-invalid')).toBeUndefined()
    expect(attr(visible(markup(<NumberField aria-label="A" aria-invalid="true" />)), 'aria-invalid')).toBe('true')
  })

  it('the three strings are the labels: Arabic under an Arabic provider', () => {
    const html = markup(<TopClassProvider direction="rtl" locale="ar"><NumberField aria-label="A" /></TopClassProvider>)
    expect(steppers(html).map((button) => attr(button, 'aria-label'))).toEqual(['إنقاص', 'زيادة'])
    expect(attr(visible(html), 'aria-roledescription')).toBe('حقل رقمي')
    expect(attr(visible(markup(<NumberField aria-label="A" />)), 'aria-roledescription')).toBe('Number field')
  })

  it('digits: Latin under ar by default, Arabic-Indic from ar-u-nu-arab or format, and the sign kept at the left', () => {
    const ar = (node: ReactNode) => markup(<TopClassProvider direction="rtl" locale="ar">{node}</TopClassProvider>)
    expect(attr(visible(ar(<NumberField aria-label="A" defaultValue={1234.5} step="any" />)), 'value')).toBe('1,234.5')
    expect(attr(visible(ar(<NumberField aria-label="A" locale="ar-u-nu-arab" defaultValue={1234.5} step="any" />)), 'value')).toBe('١٬٢٣٤٫٥')
    expect(attr(visible(markup(<NumberField aria-label="A" format={{ numberingSystem: 'arab' }} defaultValue={12} />)), 'value')).toBe('١٢')
    expect(attr(visible(ar(<NumberField aria-label="A" defaultValue={-5} min={-10} />)), 'value')).toBe('‎-5')
  })

  it('disabled and readOnly reach the input and the hidden input; readOnly marks the steppers', () => {
    const off = markup(<NumberField aria-label="A" name="a" disabled defaultValue={1} />)
    expect([visible(off), hidden(off)].every((input) => input.includes('disabled=""'))).toBe(true)
    const kept = markup(<NumberField aria-label="A" name="a" readOnly defaultValue={1} />)
    expect([visible(kept), hidden(kept)].every((input) => /readOnly=""/i.test(input))).toBe(true)
    expect(steppers(kept).map((button) => [attr(button, 'aria-disabled'), button.includes('data-readonly=""'), button.includes(' disabled=""')]))
      .toEqual([['true', true, false], ['true', true, false]])
  })

  it('a value at max disables the increase stepper only', () => {
    expect(steppers(markup(<NumberField aria-label="A" defaultValue={8} max={8} />)).map((button) => button.includes(' disabled=""')))
      .toEqual([false, true])
  })

  it('required and form reach the hidden input', () => {
    const input = hidden(markup(<NumberField aria-label="A" name="a" required form="booking" />))
    expect(input).toContain('required=""')
    expect(attr(input, 'form')).toBe('booking')
  })

  it('size reaches the root as data-size, the type step on the root and the height on the group; custom emits neither', () => {
    const xl = markup(<NumberField aria-label="A" size="xl" />)
    expect(attr(xl, 'data-size')).toBe('xl')
    expect(attr(xl, 'class')).toContain(' text-base')
    expect(xl).toContain(' h-control-xl"')
    const custom = markup(<NumberField aria-label="A" size="custom" />)
    expect(custom).not.toMatch(/h-control-|text-(xs|sm|base)\b/)
  })

  it('fullWidth replaces the width of an Input with the parent\'s', () => {
    const root = attr(markup(<NumberField aria-label="A" fullWidth />), 'class') ?? ''
    expect(root.split(' ')).toEqual(expect.arrayContaining(['w-full', 'grid-cols-1']))
    expect(root.split(' ')).not.toContain('w-fit')
  })

  it('the rest props, style and the caller className reach the root div', () => {
    const html = markup(<NumberField aria-label="A" data-testid="n" title="Guests" style={{ marginBlock: 4 }} className="ms-2" />)
    const root = /<div [^>]*>/.exec(html)?.[0] ?? ''
    expect(root).toContain('data-testid="n"')
    expect(root).toContain('title="Guests"')
    expect(root).toContain('style="margin-block:4px"')
    expect(attr(root, 'class')?.endsWith(' ms-2')).toBe(true)
  })
})
