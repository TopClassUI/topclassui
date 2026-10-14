import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Switch } from '../index.js'

// The ssr project: what reaches the HTML before any script runs.
describe('on the server', () => {
  it('the root is a native button with the role, its id and its state, and the drawn track inside it', () => {
    const html = markup(<Switch id="digest" />)
    expect(html).toMatch(/^<button data-unchecked="" type="button" tabindex="0" id="digest" role="switch" aria-checked="false" data-size="md" class="/)
    expect(html).toContain('</span></span></button><input ')
  })

  it('a label names it before any script runs: the id is on the button, never on the hidden input', () => {
    const html = markup(<><label htmlFor="digest">Weekly digest</label><Switch id="digest" name="digest" /></>)
    expect(html.match(/id="digest"/g)).toHaveLength(1)
    expect(html).toContain('<button data-unchecked="" type="button" tabindex="0" id="digest" role="switch"')
    expect(/<input [^>]*>/.exec(html)?.[0]).not.toContain('id=')
  })

  it('the hidden checkbox beside it carries the name and the value, and is checked when the switch is on', () => {
    const input = /<input [^>]*>/.exec(markup(<Switch aria-label="Digest" name="digest" value="weekly" defaultChecked />))?.[0] ?? ''
    expect(input).toContain('type="checkbox"')
    expect(input).toContain('name="digest"')
    expect(input).toContain('value="weekly"')
    expect(input).toContain('checked=""')
    expect(input).toContain('tabindex="-1"')
    expect(input).toContain('aria-hidden="true"')
  })

  it('an off switch with uncheckedValue serves an input of type hidden that sends it', () => {
    const html = markup(<Switch aria-label="News" name="news" uncheckedValue="no" />)
    expect(html).toContain('<input type="hidden" name="news" value="no"/>')
  })

  it('on: data-checked on the root and on the thumb, and aria-checked true', () => {
    const html = markup(<Switch aria-label="Digest" defaultChecked />)
    expect(attr(html, 'aria-checked')).toBe('true')
    expect(html.match(/data-checked=""/g)).toHaveLength(2)
    expect(html).not.toContain('data-unchecked')
  })

  it('size reaches the root as data-size, md by default and custom when asked', () => {
    expect(attr(markup(<Switch aria-label="A" />), 'data-size')).toBe('md')
    expect(attr(markup(<Switch aria-label="A" size="xl" />), 'data-size')).toBe('xl')
    expect(attr(markup(<Switch aria-label="A" size="custom" />), 'data-size')).toBe('custom')
  })

  it('invalid sets aria-invalid; off, a caller aria-invalid survives', () => {
    expect(attr(markup(<Switch aria-label="A" invalid />), 'aria-invalid')).toBe('true')
    expect(attr(markup(<Switch aria-label="A" />), 'aria-invalid')).toBeUndefined()
    expect(attr(markup(<Switch aria-label="A" aria-invalid="true" />), 'aria-invalid')).toBe('true')
  })

  it('disabled is the real attribute on the button and on the input, so the form sends nothing', () => {
    const html = markup(<Switch aria-label="A" name="a" disabled defaultChecked />)
    expect(/<button [^>]*>/.exec(html)?.[0]).toContain(' disabled=""')
    expect(/<input [^>]*>/.exec(html)?.[0]).toContain('disabled=""')
  })

  it('readOnly and required are told to assistive technology, and required reaches the input', () => {
    const html = markup(<Switch aria-label="A" name="a" readOnly required />)
    expect(attr(html, 'aria-readonly')).toBe('true')
    expect(attr(html, 'aria-required')).toBe('true')
    expect(/<input [^>]*>/.exec(html)?.[0]).toContain('required=""')
  })

  it('form names the form the hidden input belongs to', () => {
    expect(/<input [^>]*>/.exec(markup(<Switch aria-label="A" name="a" form="settings" />))?.[0]).toContain('form="settings"')
  })

  it('the rest props, style and the caller className reach the root button', () => {
    const html = markup(<Switch aria-label="A" data-testid="s" title="Digest" style={{ marginBlock: 4 }} className="ms-2" />)
    const button = /<button [^>]*>/.exec(html)?.[0] ?? ''
    expect(button).toContain('data-testid="s"')
    expect(button).toContain('title="Digest"')
    expect(button).toContain('style="margin-block:4px"')
    expect(attr(button, 'class')?.endsWith(' ms-2')).toBe(true)
  })

  it('size custom emits no size class on the track and no slide on the thumb', () => {
    const html = markup(<Switch aria-label="A" size="custom" />)
    expect(html).not.toContain('h-toggle-')
    expect(html).not.toContain('translate-x-')
  })
})
