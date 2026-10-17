import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Combobox } from '../index.js'
import type { ComboboxProps } from '../types.js'

// The ssr project: what reaches the HTML before any script runs.
const ITEMS = [{ value: 'next', label: 'Next.js' }, { value: 'astro', label: 'Astro' }, { value: 'remix', label: 'Remix', disabled: true }]

const html = (props: Partial<ComboboxProps> = {}) => markup(<Combobox aria-label="Framework" items={ITEMS} {...props} />)
const box = (out: string) => /^<span [^>]*>/.exec(out)?.[0] ?? ''
const input = (out: string) => /<input [^>]*role="combobox"[^>]*>/.exec(out)?.[0] ?? ''
const hidden = (out: string) => /<input [^>]*aria-hidden="true"[^>]*>/.exec(out)?.[0] ?? ''

describe('on the server', () => {
  it('a box that owns the width, around a text input with the combobox role, closed', () => {
    const out = html()
    expect(box(out)).toBe('<span class="relative inline-block max-w-full align-middle text-sm pointer-coarse:text-[max(1rem,16px)] w-[min(100%,var(--tc-input-width))]">')
    expect(input(out)).toMatch(/role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-autocomplete="list"/)
  })

  it('the input shows the label of the default value, and the hidden input sends its value', () => {
    const out = html({ name: 'framework', defaultValue: 'astro' })
    expect(attr(input(out), 'value')).toBe('Astro')
    expect(hidden(out)).toMatch(/name="framework" value="astro"/)
    expect(attr(input(html({ value: 'next', defaultValue: 'astro' })), 'value')).toBe('Next.js')
  })

  it('with nothing chosen the input is empty and the hidden input sends name=', () => {
    const out = html({ name: 'framework' })
    expect(attr(input(out), 'value')).toBe('')
    expect(hidden(out)).toMatch(/name="framework" value=""/)
    expect(hidden(out)).toContain('tabindex="-1"')
  })

  it('a value whose option is in no loaded page shows an empty input, and the hidden input still sends it', () => {
    const out = html({ name: 'framework', defaultValue: 'zz-not-loaded' })
    expect(attr(input(out), 'value')).toBe('')
    expect(hidden(out)).toMatch(/name="framework" value="zz-not-loaded"/)
    expect(attr(input(html({ value: 'zz-not-loaded' })), 'value')).toBe('')
    expect(attr(input(html({ value: 'astro' })), 'value')).toBe('Astro')
  })

  it('caps the typed query at 256 by default (R-5.7-8); the caller\'s number wins, and null removes the cap', () => {
    expect(attr(input(html()), 'maxLength')).toBe('256')
    expect(attr(input(html({ maxLength: 40 })), 'maxLength')).toBe('40')
    expect(attr(input(html({ maxLength: null })), 'maxLength')).toBeUndefined()
  })

  it('renders no option and no list on the server', () => {
    expect(html({ defaultValue: 'next' })).not.toContain('role="option"')
    expect(html({ defaultValue: 'next' })).not.toContain('role="listbox"')
  })

  it('id names the input, which a <label htmlFor> then points at', () => {
    expect(attr(input(markup(<Combobox id="framework" items={ITEMS} />)), 'id')).toBe('framework')
  })

  it('invalid sets aria-invalid on the input; off, a caller aria-invalid survives', () => {
    expect(attr(input(html({ invalid: true })), 'aria-invalid')).toBe('true')
    expect(attr(input(html()), 'aria-invalid')).toBeUndefined()
    expect(attr(input(html({ 'aria-invalid': true })), 'aria-invalid')).toBe('true')
  })

  it('status marks the input busy while a page loads, and draws the spinner in place of the caret', () => {
    expect(attr(input(html({ status: 'loading' })), 'aria-busy')).toBe('true')
    expect(attr(input(html({ status: 'loading-more' })), 'aria-busy')).toBe('true')
    expect(attr(input(html()), 'aria-busy')).toBeUndefined()
    expect(html({ status: 'loading' })).toContain('animate-spin')
    expect(html()).not.toContain('animate-spin')
  })

  it('size reaches the input as data-size and its height; the box takes the type step', () => {
    expect(attr(input(html({ size: 'xl' })), 'data-size')).toBe('xl')
    expect(attr(input(html({ size: 'xl' })), 'class')).toContain('h-control-xl')
    expect(attr(box(html({ size: 'xs' })), 'class')).toContain(' text-xs ')
    expect(attr(input(html()), 'data-size')).toBe('md')
  })

  it('the end padding of the size is replaced, so the text stays clear of the caret', () => {
    const classes = attr(input(html({ size: 'lg' })), 'class') ?? ''
    expect(classes).toContain('px-pad-x-lg')
    expect(classes.endsWith(' pe-9')).toBe(true)
  })

  it('size custom emits no height and no type step', () => {
    expect(html({ size: 'custom' })).not.toMatch(/h-control-|px-pad-x-|text-(xs|sm|base)\b/)
  })

  it('fullWidth replaces the width of an Input on the box', () => {
    expect(attr(box(html({ fullWidth: true })), 'class')).toMatch(/ w-full$/)
    expect(attr(box(html({ fullWidth: true })), 'class')).not.toContain('--tc-input-width')
  })

  it('className, style and the rest props reach the input; the box takes nothing from the caller', () => {
    const out = html({ className: 'ms-2', style: { marginBlock: 4 }, title: 'Framework', 'aria-describedby': 'hint', placeholder: 'Search' })
    expect(attr(input(out), 'class')?.endsWith(' ms-2')).toBe(true)
    expect(input(out)).toContain('style="margin-block:4px"')
    expect(attr(input(out), 'title')).toBe('Framework')
    expect(attr(input(out), 'aria-describedby')).toBe('hint')
    expect(attr(input(out), 'placeholder')).toBe('Search')
    expect(box(out)).not.toMatch(/ms-2|style=|title=/)
  })

  it('disabled reaches the input and the hidden input, so the form sends nothing', () => {
    const out = html({ disabled: true, name: 'f' })
    expect(input(out)).toContain(' disabled=""')
    expect(hidden(out)).toContain(' disabled=""')
  })

  it('readOnly and required reach the input and the hidden input', () => {
    const out = html({ readOnly: true, required: true, name: 'f', form: 'settings' })
    expect(input(out)).toContain('readOnly=""')
    expect(hidden(out)).toMatch(/form="settings"/)
    expect(hidden(out)).toContain('required=""')
  })

  it('the caret is drawn at the inline end, in a wrapper hidden from assistive technology', () => {
    expect(html()).toMatch(/<span aria-hidden="true" class="pointer-events-none absolute inset-y-0 inset-e-3 flex items-center text-muted"><svg/)
  })
})
