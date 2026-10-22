import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

// The ssr project: what reaches the HTML before any script runs.
const segments = (html: string) => [...html.matchAll(/<button [^>]*>/g)].map(([button]) => button)
const inputs = (html: string) => [...html.matchAll(/<input [^>]*>/g)].map(([input]) => input)
const tabStops = (html: string) => segments(html).map((button) => attr(button, 'tabindex'))
// Base UI writes a state attribute such as data-disabled before the role.
const trackOf = (html: string) => /<div [^>]*role="radiogroup"[^>]*>/.exec(html)?.[0] ?? ''

type Props = Partial<Parameters<typeof SegmentedControlRoot>[0]>

const view = (props: Props = {}) => markup(
  <SegmentedControlRoot aria-label="View" name="view" defaultValue="board" {...props}>
    <SegmentedControlItem value="board">Board</SegmentedControlItem>
    <SegmentedControlItem value="table">Table</SegmentedControlItem>
    <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
  </SegmentedControlRoot>,
)

describe('on the server', () => {
  it('a holder of one column around the track, which is a div with role radiogroup, its name and its size', () => {
    expect(view()).toMatch(/^<div class="grid grid-cols-1"><div role="radiogroup" aria-label="View" data-size="md" class="relative flex w-fit /)
  })

  it('each segment is a native button with the role and its text in a span that truncates, then its radio input', () => {
    const html = view()
    expect(segments(html)).toHaveLength(3)
    for (const button of segments(html)) {
      expect(button).toMatch(/^<button data-(un)?checked="" type="button" tabindex="-?[01]" role="radio" aria-checked="(true|false)" /)
    }
    expect(html).toContain('<span dir="auto" class="truncate min-w-0">Table</span></button><input type="radio"')
  })

  it('one tab stop, on the segment of the default value; the others are -1 as Base UI serves them', () => {
    expect(tabStops(view())).toEqual(['0', '-1', '-1'])
    expect(tabStops(view({ defaultValue: 'calendar' }))).toEqual(['-1', '-1', '0'])
  })

  it('the controlled value wins over the default for the tab stop and the selection', () => {
    const html = view({ value: 'table', defaultValue: 'calendar' })
    expect(tabStops(html)).toEqual(['-1', '0', '-1'])
    expect(segments(html).map((button) => attr(button, 'aria-checked'))).toEqual(['false', 'true', 'false'])
  })

  it('a tabIndex the caller writes on a segment wins over the server tab stop', () => {
    const html = markup(
      <SegmentedControlRoot aria-label="View" defaultValue="a">
        <SegmentedControlItem value="a" tabIndex={-1}>A</SegmentedControlItem>
      </SegmentedControlRoot>,
    )
    expect(tabStops(html)).toEqual(['-1'])
  })

  it('selected: data-checked and aria-checked true; no indicator and no icon of its own', () => {
    const html = view({ defaultValue: 'table' })
    expect(segments(html)[1]).toMatch(/^<button data-checked=""/)
    expect(attr(segments(html)[1] ?? '', 'aria-checked')).toBe('true')
    expect(html).not.toContain('<svg')
  })

  it('each radio input carries the name and its value, and the default one is checked', () => {
    const all = inputs(view({ defaultValue: 'table' }))
    expect(all.map((input) => [attr(input, 'type'), attr(input, 'name'), attr(input, 'value'), input.includes('checked=""')]))
      .toEqual([['radio', 'view', 'board', false], ['radio', 'view', 'table', true], ['radio', 'view', 'calendar', false]])
    for (const input of all) expect(input).toContain('tabindex="-1" style="clip-path:inset(50%)')
  })

  it('invalid sets aria-invalid on the track and never on a segment; off, a caller aria-invalid survives', () => {
    const html = view({ invalid: true })
    expect(attr(trackOf(html), 'aria-invalid')).toBe('true')
    expect(segments(html).filter((button) => button.includes('aria-invalid'))).toEqual([])
    expect(attr(trackOf(view()), 'aria-invalid')).toBeUndefined()
    expect(attr(trackOf(view({ 'aria-invalid': true })), 'aria-invalid')).toBe('true')
  })

  it('size reaches the track as data-size and its height, and each segment its padding and type step', () => {
    const html = view({ size: 'xl' })
    expect(attr(trackOf(html), 'data-size')).toBe('xl')
    expect(attr(trackOf(html), 'class')?.endsWith(' min-h-control-xl')).toBe(true)
    expect(segments(html).every((button) => attr(button, 'class')?.endsWith(' px-5 text-base'))).toBe(true)
    expect(segments(view({ size: 'xs' })).every((button) => attr(button, 'class')?.endsWith(' px-2 text-xs'))).toBe(true)
    expect(segments(view()).every((button) => attr(button, 'class')?.endsWith(' px-2.75 text-xs'))).toBe(true)
  })

  it('size custom emits no height, no padding and no type step', () => {
    const html = view({ size: 'custom' })
    expect(html).not.toMatch(/min-h-control-|\bpx-[2-5]\b|\btext-(xs|sm|base)\b/)
  })

  it('fullWidth: the holder and the track fill the parent, and the segments share it', () => {
    const html = view({ fullWidth: true })
    expect(html).toMatch(/^<div class="grid grid-cols-1 w-full">/)
    const track = attr(trackOf(html), 'class')?.split(' ') ?? []
    expect(track).toEqual(expect.arrayContaining(['w-full', '*:flex-1']))
    expect(track).not.toContain('w-fit')
    expect(attr(trackOf(view()), 'class')?.split(' ')).not.toContain('*:flex-1')
  })

  it('disabled on the track is the real attribute on every button and input, so the form sends nothing', () => {
    const html = view({ disabled: true })
    expect(attr(trackOf(html), 'aria-disabled')).toBe('true')
    expect(segments(html).every((button) => button.includes(' disabled=""'))).toBe(true)
    expect(inputs(html).every((input) => input.includes('disabled=""'))).toBe(true)
  })

  it('a disabled segment is disabled alone', () => {
    const html = markup(
      <SegmentedControlRoot aria-label="View" defaultValue="a">
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b" disabled>B</SegmentedControlItem>
      </SegmentedControlRoot>,
    )
    expect(segments(html).map((button) => button.includes(' disabled=""'))).toEqual([false, true])
  })

  it('readOnly and required are told to assistive technology, and required reaches every input', () => {
    const html = view({ readOnly: true, required: true })
    expect(attr(trackOf(html), 'aria-readonly')).toBe('true')
    expect(attr(trackOf(html), 'aria-required')).toBe('true')
    expect(inputs(html).every((input) => input.includes('required=""'))).toBe(true)
  })

  it('form names the form every radio input belongs to', () => {
    expect(inputs(view({ form: 'settings' })).every((input) => input.includes('form="settings"'))).toBe(true)
  })

  it('the rest props, style and the caller className reach the track, and the holder takes none of them', () => {
    const html = view({ title: 'View', style: { marginBlock: 4 }, className: 'ms-2', id: 'v' })
    const track = trackOf(html)
    expect(track).toContain('title="View"')
    expect(track).toContain('style="margin-block:4px"')
    expect(track).toContain('id="v"')
    expect(attr(track, 'class')?.endsWith(' ms-2')).toBe(true)
    expect(html).toMatch(/^<div class="grid grid-cols-1"><div [^>]*role="radiogroup"/)
  })

  it('a segment: the rest props, the id, the style and the className go to its button', () => {
    const html = markup(
      <SegmentedControlRoot aria-label="View" defaultValue="a">
        <SegmentedControlItem value="a" id="view-a" title="A" data-testid="s" className="ms-2" style={{ marginBlock: 4 }}>A</SegmentedControlItem>
      </SegmentedControlRoot>,
    )
    const button = segments(html)[0] ?? ''
    for (const part of ['id="view-a"', 'title="A"', 'data-testid="s"', 'style="margin-block:4px"']) expect(button).toContain(part)
    expect(attr(button, 'class')?.endsWith(' ms-2')).toBe(true)
  })

  it('an icon sits in a span of its own before the label; with no icon there is no span', () => {
    const html = markup(
      <SegmentedControlRoot aria-label="View" defaultValue="a">
        <SegmentedControlItem value="a" icon={<i />}>A</SegmentedControlItem>
        <SegmentedControlItem value="b" icon={null}>B</SegmentedControlItem>
      </SegmentedControlRoot>,
    )
    expect(html).toContain('<span class="flex shrink-0"><i></i></span><span dir="auto" class="truncate min-w-0">A</span>')
    expect(html).toContain('aria-checked="false" id="')
    expect(html.match(/flex shrink-0"/g)).toHaveLength(1)
  })
})
