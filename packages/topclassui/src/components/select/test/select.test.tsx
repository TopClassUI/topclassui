import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Select } from '../index.js'
import type { SelectProps } from '../types.js'

// The ssr project: what reaches the HTML before any script runs.
const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco', disabled: true }]

const html = (props: Partial<SelectProps> = {}) => markup(<Select aria-label="Country" items={ITEMS} {...props} />)
const box = (out: string) => /^<span [^>]*>/.exec(out)?.[0] ?? ''
const trigger = (out: string) => /<button [^>]*>/.exec(out)?.[0] ?? ''
const input = (out: string) => /<input [^>]*>/.exec(out)?.[0] ?? ''
const shown = (out: string) => /<button [^>]*><span [^>]*>([^<]*)<\/span>/.exec(out)?.[1]

describe('on the server', () => {
  it('a box that owns the width, around a native button with the combobox role and the one tab stop', () => {
    const out = html()
    expect(out).toMatch(/^<span class="inline-grid align-middle w-fit max-w-full grid-cols-\[minmax\(0,var\(--tc-input-width\)\)\] text-sm /)
    expect(trigger(out)).toMatch(/^<button type="button" [^>]*tabindex="0" [^>]*role="combobox" aria-expanded="false" aria-haspopup="listbox"/)
  })

  it('the trigger prints the label of the default value, not the value', () => {
    expect(shown(html({ defaultValue: 'eg' }))).toBe('Egypt')
    expect(shown(html({ value: 'jo', defaultValue: 'eg' }))).toBe('Jordan')
  })

  it('with nothing chosen the trigger prints the placeholder: the English label, or the caller\'s', () => {
    expect(shown(html())).toBe('Select')
    expect(shown(html({ placeholder: 'Choose a country' }))).toBe('Choose a country')
    expect(trigger(html())).toContain('data-placeholder=""')
  })

  it('renders no option before the trigger takes the focus', () => {
    expect(html({ defaultValue: 'jo' })).not.toContain('role="option"')
    expect(html({ defaultValue: 'jo' })).not.toContain('Egypt')
  })

  it('the hidden input carries the name and the value, and an empty value with nothing chosen', () => {
    expect(input(html({ name: 'country', defaultValue: 'eg' }))).toMatch(/name="country" value="eg"/)
    expect(input(html({ name: 'country' }))).toMatch(/name="country" value=""/)
    expect(input(html())).toContain('aria-hidden="true"')
    expect(input(html())).toContain('tabindex="-1"')
  })

  it('id names the trigger, which a <label htmlFor> then points at', () => {
    expect(attr(trigger(markup(<Select id="country" items={ITEMS} />)), 'id')).toBe('country')
  })

  it('invalid sets aria-invalid on the trigger; off, a caller aria-invalid survives', () => {
    expect(attr(trigger(html({ invalid: true })), 'aria-invalid')).toBe('true')
    expect(attr(trigger(html()), 'aria-invalid')).toBeUndefined()
    expect(attr(trigger(html({ 'aria-invalid': true })), 'aria-invalid')).toBe('true')
  })

  it('size reaches the trigger as data-size and its height, and the box as its type step', () => {
    expect(attr(trigger(html({ size: 'xl' })), 'data-size')).toBe('xl')
    expect(attr(trigger(html({ size: 'xl' })), 'class')).toContain('h-control-xl px-pad-x-xl text-base')
    expect(attr(box(html({ size: 'xs' })), 'class')).toContain(' text-xs ')
    expect(attr(trigger(html()), 'data-size')).toBe('md')
  })

  it('size custom emits no height and no type step', () => {
    const out = html({ size: 'custom' })
    expect(out).not.toMatch(/h-control-|px-pad-x-|text-(xs|sm|base)\b/)
  })

  it('the box carries FIELD_HOLDER, and fullWidth replaces its width and its column', () => {
    expect(attr(box(html()), 'class')).toContain('w-fit max-w-full grid-cols-[minmax(0,var(--tc-input-width))]')
    const full = attr(box(html({ fullWidth: true })), 'class') ?? ''
    expect(full).toContain('w-full grid-cols-1')
    expect(full).not.toContain('w-fit')
    expect(full).not.toContain('grid-cols-[minmax')
  })

  it('className, style and the rest props reach the trigger; the box takes nothing from the caller', () => {
    const out = html({ className: 'ms-2', style: { marginBlock: 4 }, title: 'Country', 'aria-describedby': 'hint' })
    expect(attr(trigger(out), 'class')?.endsWith(' ms-2')).toBe(true)
    expect(trigger(out)).toContain('style="margin-block:4px"')
    expect(trigger(out)).toContain('title="Country"')
    expect(trigger(out)).toContain('aria-describedby="hint"')
    expect(box(out)).not.toMatch(/ms-2|style=|title=/)
  })

  it('disabled is the real attribute on the trigger and the input, so the form sends nothing', () => {
    const out = html({ disabled: true, name: 'c' })
    expect(trigger(out)).toContain(' disabled=""')
    expect(input(out)).toContain(' disabled=""')
  })

  it('readOnly and required are told to assistive technology, and reach the hidden input', () => {
    const out = html({ readOnly: true, required: true, form: 'settings' })
    expect(trigger(out)).toContain('data-readonly=""')
    expect(attr(trigger(out), 'aria-readonly')).toBe('true')
    expect(attr(trigger(out), 'aria-required')).toBe('true')
    expect(input(out)).toMatch(/form="settings"[^>]* required=""/)
  })

  it('the caret is drawn at the inline end, in a wrapper that holds its colour', () => {
    expect(html()).toMatch(/<\/span><span aria-hidden="true" class="flex shrink-0 text-muted"><svg width="0.875rem"/)
  })
})
