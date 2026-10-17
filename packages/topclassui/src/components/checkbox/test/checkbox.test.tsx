import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Checkbox } from '../index.js'

// The ssr project: what reaches the HTML before any script runs.
describe('on the server', () => {
  it('the root is a native button with the role, its id and its state, and the drawn box inside it', () => {
    const html = markup(<Checkbox id="terms" />)
    expect(html).toMatch(/^<button data-unchecked="" type="button" tabindex="0" id="terms" role="checkbox" aria-checked="false" data-size="md" class="/)
    expect(html).toContain('></span></button><input ')
  })

  it('a label names it before any script runs: the id is on the button, never on the hidden input', () => {
    const html = markup(<><label htmlFor="terms">I accept the terms</label><Checkbox id="terms" name="terms" /></>)
    expect(html.match(/id="terms"/g)).toHaveLength(1)
    expect(html).toContain('<button data-unchecked="" type="button" tabindex="0" id="terms" role="checkbox"')
    expect(/<input [^>]*>/.exec(html)?.[0]).not.toContain('id=')
  })

  it('the hidden checkbox beside it carries the name and the value, and is checked when the box is ticked', () => {
    const input = /<input [^>]*>/.exec(markup(<Checkbox aria-label="Terms" name="terms" value="yes" defaultChecked />))?.[0] ?? ''
    expect(input).toContain('type="checkbox"')
    expect(input).toContain('name="terms"')
    expect(input).toContain('value="yes"')
    expect(input).toContain('checked=""')
    expect(input).toContain('tabindex="-1"')
    expect(input).toContain('aria-hidden="true"')
  })

  it('an unticked box with uncheckedValue serves an input of type hidden that sends it', () => {
    const html = markup(<Checkbox aria-label="News" name="news" uncheckedValue="no" />)
    expect(html).toContain('<input type="hidden" name="news" value="no"/>')
  })

  it('unticked: no mark is served, since Base UI mounts its Indicator only for a tick or a dash', () => {
    expect(markup(<Checkbox aria-label="Terms" />)).not.toContain('<svg')
  })

  it('ticked: data-checked on the root, aria-checked true, and the tick at 80% of the box', () => {
    const html = markup(<Checkbox aria-label="Terms" defaultChecked />)
    expect(attr(html, 'aria-checked')).toBe('true')
    expect(html).toMatch(/^<button data-checked=""/)
    expect(html).not.toContain('data-unchecked')
    expect(/<svg [^>]*>/.exec(html)?.[0]).toContain('width="80%" height="80%"')
    expect(html).toContain('<path d="M229.66,77.66')
  })

  it('indeterminate: aria-checked mixed, data-indeterminate and neither of the other two, and the dash', () => {
    const html = markup(<Checkbox aria-label="All" indeterminate />)
    expect(attr(html, 'aria-checked')).toBe('mixed')
    expect(html).toMatch(/^<button data-indeterminate=""/)
    expect(html).not.toMatch(/ data-(un)?checked=""/)
    expect(html).toContain('<path d="M224,128a8')
    expect(html).not.toContain('<path d="M229.66,77.66')
  })

  it('indeterminate wins over checked: still mixed, still the dash', () => {
    const html = markup(<Checkbox aria-label="All" indeterminate defaultChecked />)
    expect(attr(html, 'aria-checked')).toBe('mixed')
    expect(html).toContain('<path d="M224,128a8')
  })

  it('size reaches the root as data-size, md by default and custom when asked', () => {
    expect(attr(markup(<Checkbox aria-label="A" />), 'data-size')).toBe('md')
    expect(attr(markup(<Checkbox aria-label="A" size="xl" />), 'data-size')).toBe('xl')
    expect(attr(markup(<Checkbox aria-label="A" size="custom" />), 'data-size')).toBe('custom')
  })

  it('invalid sets aria-invalid; off, a caller aria-invalid survives', () => {
    expect(attr(markup(<Checkbox aria-label="A" invalid />), 'aria-invalid')).toBe('true')
    expect(attr(markup(<Checkbox aria-label="A" />), 'aria-invalid')).toBeUndefined()
    expect(attr(markup(<Checkbox aria-label="A" aria-invalid="true" />), 'aria-invalid')).toBe('true')
  })

  it('disabled is the real attribute on the button and on the input, so the form sends nothing', () => {
    const html = markup(<Checkbox aria-label="A" name="a" disabled defaultChecked />)
    expect(/<button [^>]*>/.exec(html)?.[0]).toContain(' disabled=""')
    expect(/<input [^>]*>/.exec(html)?.[0]).toContain('disabled=""')
  })

  it('readOnly and required are told to assistive technology, and required reaches the input', () => {
    const html = markup(<Checkbox aria-label="A" name="a" readOnly required />)
    expect(attr(html, 'aria-readonly')).toBe('true')
    expect(attr(html, 'aria-required')).toBe('true')
    expect(/<input [^>]*>/.exec(html)?.[0]).toContain('required=""')
  })

  it('form names the form the hidden input belongs to', () => {
    expect(/<input [^>]*>/.exec(markup(<Checkbox aria-label="A" name="a" form="settings" />))?.[0]).toContain('form="settings"')
  })

  it('the rest props, style and the caller className reach the root button', () => {
    const html = markup(<Checkbox aria-label="A" data-testid="c" title="Terms" style={{ marginBlock: 4 }} className="ms-2" />)
    const button = /<button [^>]*>/.exec(html)?.[0] ?? ''
    expect(button).toContain('data-testid="c"')
    expect(button).toContain('title="Terms"')
    expect(button).toContain('style="margin-block:4px"')
    expect(attr(button, 'class')?.endsWith(' ms-2')).toBe(true)
  })

  it('size custom emits no size class on the box', () => {
    expect(markup(<Checkbox aria-label="A" size="custom" defaultChecked />)).not.toContain('size-toggle-')
    expect(markup(<Checkbox aria-label="A" size="sm" />)).toContain('size-toggle-sm')
  })
})
