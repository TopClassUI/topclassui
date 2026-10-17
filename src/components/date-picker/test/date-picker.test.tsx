import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { DatePicker } from '../index.js'
import type { DatePickerProps } from '../types.js'

// The ssr project: what reaches the HTML before any script runs.
const html = (props: Partial<DatePickerProps> = {}) => markup(<DatePicker aria-label="Check-in" {...props} />)
const box = (out: string) => /^<span [^>]*>/.exec(out)?.[0] ?? ''
const trigger = (out: string) => /<button [^>]*>/.exec(out)?.[0] ?? ''
const input = (out: string) => /<input [^>]*>/.exec(out)?.[0] ?? ''
const shown = (out: string) => /<span id="[^"]*"[^>]*>([^<]*)<\/span>/.exec(out)?.[1]

/** The text of every id an aria-describedby names, in order, read from the HTML itself. */
function described(out: string): string[] {
  const ids = attr(trigger(out), 'aria-describedby')?.split(' ') ?? []
  return ids.map((id) => new RegExp(`<[a-z]+ id="${id}"[^>]*>([^<]*)<`).exec(out)?.[1] ?? `(no ${id})`)
}

describe('on the server', () => {
  it('a box that owns the width, around a native button that opens a dialog and is the one tab stop', () => {
    const out = html()
    expect(out).toMatch(/^<span class="relative inline-grid align-middle w-fit max-w-full grid-cols-\[minmax\(0,var\(--tc-input-width\)\)\] text-sm /)
    expect(trigger(out)).toMatch(/^<button type="button" /)
    expect(trigger(out)).toContain('aria-haspopup="dialog"')
    expect(trigger(out)).toContain('aria-expanded="false"')
    expect(out.match(/tabindex="0"/g)).toEqual(['tabindex="0"'])
    expect(trigger(out)).toContain('tabindex="0"')
  })

  it('the trigger shows the default in the provider\'s locale, English with none', () => {
    expect(shown(html({ defaultValue: '2026-09-22' }))).toBe('Sep 22, 2026')
    expect(shown(html({ value: '2026-10-02', defaultValue: '2026-09-22' }))).toBe('Oct 2, 2026')
  })

  it('with nothing chosen, or a string that is no day, the placeholder: the English label, or the caller\'s', () => {
    expect(shown(html())).toBe('Pick a date')
    expect(shown(html({ defaultValue: '2026-02-30' }))).toBe('Pick a date')
    expect(shown(html({ placeholder: 'Arrival' }))).toBe('Arrival')
    expect(html()).toContain('data-placeholder=""')
    expect(html({ defaultValue: '2026-09-22' })).not.toContain('data-placeholder=""')
  })

  it('the form input holds the ISO value and the name, is hidden twice over, and is empty with nothing chosen', () => {
    expect(input(html({ name: 'checkIn', defaultValue: '2026-10-02' }))).toMatch(/name="checkIn" value="2026-10-02"/)
    expect(input(html({ name: 'checkIn' }))).toMatch(/name="checkIn" value=""/)
    expect(input(html())).toContain('aria-hidden="true"')
    expect(input(html())).toContain('tabindex="-1"')
    expect(input(html())).toMatch(/ autocomplete="off"/i)
  })

  it('a value outside the range is kept in the trigger and the input, as given', () => {
    const out = html({ name: 'd', defaultValue: '2030-01-01', minDate: '2026-09-25', maxDate: '2027-03-31' })
    expect(shown(out)).toBe('Jan 1, 2030')
    expect(input(out)).toContain('value="2030-01-01"')
  })

  it('no calendar is in the HTML: no grid, no day, no month name', () => {
    const out = html({ defaultValue: '2026-09-22' })
    expect(out).not.toMatch(/role="grid"|role="dialog"|September/)
  })

  it('aria-describedby starts with the value\'s id, so the day is heard after the label', () => {
    const out = html({ defaultValue: '2026-09-22', 'aria-describedby': 'hint' })
    expect(attr(trigger(out), 'aria-describedby')?.split(' ')[0]).toBe(/<span id="([^"]*)"/.exec(out)?.[1])
    expect(described(markup(<><DatePicker aria-label="A" defaultValue="2026-09-22" aria-describedby="hint" /><span id="hint">Rooms from 15:00</span></>)))
      .toEqual(['Sep 22, 2026', 'Rooms from 15:00'])
  })

  it('required: the value, then the word "required" in a hidden span, then the caller\'s text; the input is required', () => {
    const out = markup(<><DatePicker aria-label="A" required aria-describedby="hint" /><span id="hint">Rooms from 15:00</span></>)
    expect(described(out)).toEqual(['Pick a date', 'required', 'Rooms from 15:00'])
    expect(out).toMatch(/<span id="[^"]*" hidden="">required<\/span>/)
    expect(input(out)).toContain(' required=""')
    expect(trigger(out)).not.toContain('aria-required')
  })

  it('id names the trigger, which a <label htmlFor> then points at', () => {
    expect(attr(trigger(markup(<DatePicker id="check-in" />)), 'id')).toBe('check-in')
  })

  it('invalid sets aria-invalid on the trigger; off, a caller aria-invalid survives', () => {
    expect(attr(trigger(html({ invalid: true })), 'aria-invalid')).toBe('true')
    expect(attr(trigger(html()), 'aria-invalid')).toBeUndefined()
    expect(attr(trigger(html({ 'aria-invalid': true })), 'aria-invalid')).toBe('true')
  })

  it('size reaches the trigger as data-size and its height, and the box as its type step; custom emits neither', () => {
    expect(attr(trigger(html({ size: 'xl' })), 'data-size')).toBe('xl')
    expect(attr(trigger(html({ size: 'xl' })), 'class')).toContain('h-control-xl px-pad-x-xl text-base')
    expect(attr(box(html({ size: 'xs' })), 'class')).toContain(' text-xs ')
    expect(attr(trigger(html()), 'data-size')).toBe('md')
    expect(html({ size: 'custom' })).not.toMatch(/h-control-|px-pad-x-|text-(xs|sm|base)\b/)
  })

  it('fullWidth replaces the width and the column of the box', () => {
    const full = attr(box(html({ fullWidth: true })), 'class') ?? ''
    expect(full).toContain('w-full grid-cols-1')
    expect(full).not.toContain('w-fit')
  })

  it('className, style and the rest props reach the trigger; the box takes nothing from the caller', () => {
    const out = html({ className: 'ms-2', style: { marginBlock: 4 }, title: 'Arrival' })
    expect(attr(trigger(out), 'class')?.endsWith(' ms-2')).toBe(true)
    expect(trigger(out)).toContain('style="margin-block:4px"')
    expect(trigger(out)).toContain('title="Arrival"')
    expect(box(out)).not.toMatch(/ms-2|style=|title=/)
  })

  it('disabled is the real attribute on the trigger and the input, so the form sends nothing; form reaches the input', () => {
    const out = html({ disabled: true, name: 'c', form: 'booking' })
    expect(trigger(out)).toContain(' disabled=""')
    expect(input(out)).toContain(' disabled=""')
    expect(input(out)).toContain('form="booking"')
  })

  it('the calendar icon comes first, hidden, in a wrapper that holds its colour', () => {
    expect(html()).toMatch(/<button [^>]*><span aria-hidden="true" class="flex shrink-0 text-muted"><svg width="0.875rem"/)
  })
})
