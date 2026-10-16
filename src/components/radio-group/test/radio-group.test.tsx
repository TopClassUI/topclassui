import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { RadioGroupItem, RadioGroupRoot } from '../index.js'

// The ssr project: what reaches the HTML before any script runs.
const radios = (html: string) => [...html.matchAll(/<button [^>]*>/g)].map(([button]) => button)
const inputs = (html: string) => [...html.matchAll(/<input [^>]*>/g)].map(([input]) => input)
const tabStops = (html: string) => radios(html).map((button) => attr(button, 'tabindex'))

const plan = (props: Partial<Parameters<typeof RadioGroupRoot>[0]> = {}) => markup(
  <RadioGroupRoot aria-label="Plan" name="plan" {...props}>
    <RadioGroupItem value="free">Free</RadioGroupItem>
    <RadioGroupItem value="pro">Pro</RadioGroupItem>
    <RadioGroupItem value="team">Team</RadioGroupItem>
  </RadioGroupRoot>,
)

describe('on the server', () => {
  it('the root is a div with role radiogroup, its name, its size and its orientation', () => {
    expect(plan()).toMatch(/^<div role="radiogroup" aria-label="Plan" data-size="md" data-orientation="vertical" class="/)
  })

  it('each radio is a native button with the role, inside a label that holds its text', () => {
    const html = plan({ defaultValue: 'pro' })
    expect(radios(html)).toHaveLength(3)
    for (const button of radios(html)) {
      expect(button).toMatch(/^<button data-(un)?checked="" type="button" tabindex="-?[01]" role="radio" aria-checked="(true|false)" /)
    }
    expect(html.match(/<label [^>]*><button /g)).toHaveLength(3)
    expect(html).toContain('<span class="min-w-0 wrap-anywhere peer-disabled:opacity-50">Pro</span></label>')
  })

  it('one tab stop, on the radio of the default value; the others are -1 as Base UI serves them', () => {
    expect(tabStops(plan({ defaultValue: 'pro' }))).toEqual(['-1', '0', '-1'])
    expect(tabStops(plan({ defaultValue: 'team' }))).toEqual(['-1', '-1', '0'])
  })

  it('the controlled value wins over the default for the tab stop and the check', () => {
    const html = plan({ value: 'free', defaultValue: 'team' })
    expect(tabStops(html)).toEqual(['0', '-1', '-1'])
    expect(radios(html).map((button) => attr(button, 'aria-checked'))).toEqual(['true', 'false', 'false'])
  })

  it('no value and no default: no radio is checked and the first is the tab stop, as Base UI makes it once hydrated', () => {
    const html = plan()
    expect(tabStops(html)).toEqual(['0', '-1', '-1'])
    expect(radios(html).map((button) => attr(button, 'aria-checked'))).toEqual(['false', 'false', 'false'])
    expect(html).not.toContain('<svg')
  })

  it('a tabIndex the caller writes on a radio wins over the server tab stop', () => {
    const html = markup(
      <RadioGroupRoot aria-label="Plan" defaultValue="a">
        <RadioGroupItem value="a" tabIndex={-1}>A</RadioGroupItem>
      </RadioGroupRoot>,
    )
    expect(tabStops(html)).toEqual(['-1'])
  })

  it('checked: data-checked, aria-checked true, and the dot at 56% of the circle', () => {
    const html = plan({ defaultValue: 'pro' })
    const checked = radios(html)[1] ?? ''
    expect(checked).toMatch(/^<button data-checked=""/)
    expect(attr(checked, 'aria-checked')).toBe('true')
    expect(html.match(/<svg /g)).toHaveLength(1)
    expect(/<svg [^>]*>/.exec(html)?.[0]).toContain('width="56%" height="56%"')
    expect(html).toContain('<path d="M232,128A104')
  })

  it('each radio input carries the name and its value, and the default one is checked', () => {
    const all = inputs(plan({ defaultValue: 'pro' }))
    expect(all.map((input) => [attr(input, 'type'), attr(input, 'name'), attr(input, 'value'), input.includes('checked=""')]))
      .toEqual([['radio', 'plan', 'free', false], ['radio', 'plan', 'pro', true], ['radio', 'plan', 'team', false]])
    for (const input of all) {
      expect(input).toContain('tabindex="-1"')
      expect(input).toContain('aria-hidden="true"')
      expect(input).not.toContain(' id=')
    }
  })

  it('invalid sets aria-invalid on the group and never on a radio; off, a caller aria-invalid survives', () => {
    const html = plan({ invalid: true })
    expect(attr(html, 'aria-invalid')).toBe('true')
    expect(radios(html).filter((button) => button.includes('aria-invalid'))).toEqual([])
    expect(attr(plan(), 'aria-invalid')).toBeUndefined()
    expect(attr(plan({ 'aria-invalid': true }), 'aria-invalid')).toBe('true')
  })

  it('size reaches the root as data-size, and the circle and the text step of each radio', () => {
    expect(attr(plan({ size: 'xl' }), 'data-size')).toBe('xl')
    expect(plan({ size: 'xl' })).toContain('size-toggle-xl')
    expect(plan({ size: 'xs' })).toMatch(/<label class="[^"]* text-xs"/)
    expect(plan({ size: 'lg' })).toMatch(/<label class="[^"]* text-base"/)
    expect(plan()).toMatch(/<label class="[^"]* text-sm"/)
  })

  it('size custom emits no circle size and no text step', () => {
    const html = plan({ size: 'custom' })
    expect(html).not.toContain('size-toggle-')
    expect(html).not.toMatch(/ text-(xs|sm|base)"/)
  })

  it('orientation is written as data-orientation, and horizontal is a row that wraps', () => {
    const html = plan({ orientation: 'horizontal' })
    expect(attr(html, 'data-orientation')).toBe('horizontal')
    expect(attr(html, 'class')).toContain('flex-row flex-wrap')
    expect(attr(plan(), 'class')).toContain('flex-col')
  })

  it('disabled on the group is the real attribute on every button and input, so the form sends nothing', () => {
    const html = plan({ disabled: true, defaultValue: 'pro' })
    expect(attr(html, 'aria-disabled')).toBe('true')
    expect(radios(html).every((button) => button.includes(' disabled=""'))).toBe(true)
    expect(inputs(html).every((input) => input.includes('disabled=""'))).toBe(true)
  })

  it('a disabled item is disabled alone', () => {
    const html = markup(
      <RadioGroupRoot aria-label="Plan" defaultValue="a">
        <RadioGroupItem value="a">A</RadioGroupItem>
        <RadioGroupItem value="b" disabled>B</RadioGroupItem>
      </RadioGroupRoot>,
    )
    expect(radios(html).map((button) => button.includes(' disabled=""'))).toEqual([false, true])
  })

  it('readOnly and required are told to assistive technology, and required reaches every input', () => {
    const html = plan({ readOnly: true, required: true })
    expect(attr(html, 'aria-readonly')).toBe('true')
    expect(attr(html, 'aria-required')).toBe('true')
    expect(inputs(html).every((input) => input.includes('required=""'))).toBe(true)
  })

  it('form names the form every radio input belongs to', () => {
    expect(inputs(plan({ form: 'settings' })).every((input) => input.includes('form="settings"'))).toBe(true)
  })

  it('the rest props, style and the caller className reach the group', () => {
    const html = plan({ title: 'Plan', style: { marginBlock: 4 }, className: 'ms-2' })
    const root = /<div [^>]*>/.exec(html)?.[0] ?? ''
    expect(root).toContain('title="Plan"')
    expect(root).toContain('style="margin-block:4px"')
    expect(attr(root, 'class')?.endsWith(' ms-2')).toBe(true)
  })

  it('an item: className and style go to the label; the rest props and the id go to the radio button', () => {
    const html = markup(
      <RadioGroupRoot aria-label="Plan">
        <RadioGroupItem value="a" id="plan-a" title="A" data-testid="r" className="ms-2" style={{ marginBlock: 4 }}>A</RadioGroupItem>
      </RadioGroupRoot>,
    )
    const label = /<label [^>]*>/.exec(html)?.[0] ?? ''
    expect(attr(label, 'class')?.endsWith(' ms-2')).toBe(true)
    expect(label).toContain('style="margin-block:4px"')
    const button = radios(html)[0] ?? ''
    expect(button).toContain('id="plan-a"')
    expect(button).toContain('title="A"')
    expect(button).toContain('data-testid="r"')
    expect(button).not.toContain('style=')
  })
})
