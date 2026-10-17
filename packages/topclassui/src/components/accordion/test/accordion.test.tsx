import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { AccordionItem, AccordionRoot } from '../index.js'

const one = (item: Parameters<typeof AccordionItem>[0], open = false) => markup(
  <AccordionRoot defaultValue={open ? [item.value] : []}>
    <AccordionItem {...item} />
  </AccordionRoot>,
)

const html = one({ value: 'install', title: 'How do I install it?', children: 'Run the add command.' })

/** The opening tag of the first element of a kind, or of the element that carries an attribute. */
const tag = (source: string, pattern: RegExp) => pattern.exec(source)?.[0] ?? ''

// The ssr project: what reaches the HTML before any script runs.
describe('on the server', () => {
  it('AccordionRoot is one div, the box, around its items', () => {
    expect(html).toMatch(/^<div data-orientation="vertical" class="grid grid-cols-1 overflow-hidden rounded-box /)
    expect(html).toMatch(/<\/div><\/div><\/div><\/div>$/)
  })

  it('an item is a div that holds a heading and then the panel, and nothing else', () => {
    const item = html.slice(html.indexOf('>') + 1, -'</div>'.length)
    expect(item).toMatch(/^<div [^>]*><h3 [^>]*><button /)
    expect(item.match(/<h3 /g)).toHaveLength(1)
    expect(item).toMatch(/<\/button><\/h3><div [^>]*><div role="region"[^>]*>Run the add command\.<\/div><\/div><\/div>$/)
  })

  it('the trigger is a real button inside the heading, closed, and names no panel while it is', () => {
    const button = tag(html, /<button [^>]*>/)
    expect(attr(button, 'type')).toBe('button')
    expect(attr(button, 'aria-expanded')).toBe('false')
    expect(attr(button, 'aria-disabled')).toBe('false')
    expect(button).not.toContain('aria-controls')
    expect(button).not.toContain('data-panel-open=""')
  })

  it('the title sits in a span of its own beside the caret, which is hidden from a screen reader', () => {
    expect(html).toContain('<span class="min-w-0 grow basis-[6ch]">How do I install it?</span>')
    const caret = tag(html, /<svg [^>]*>/)
    expect(attr(caret, 'aria-hidden')).toBe('true')
    expect(attr(caret, 'width')).toBe('1em')
  })

  it('the caret does not mirror in Arabic: a down caret looks the same both ways', () => {
    expect(classList(tag(html, /<svg [^>]*>/))).toEqual(['inline-block', 'shrink-0'])
  })

  it('the colour and the turn of the caret sit on the span around it, never on the svg', () => {
    const box = tag(html, /<span [^>]*><svg /)
    expect(classList(box)).toContain('text-muted')
    expect(classList(box)).toContain('group-data-panel-open:rotate-180')
  })

  it('the region is the element inside the panel, named by the id of its trigger', () => {
    const region = tag(html, /<div role="region"[^>]*>/)
    const id = attr(tag(html, /<button [^>]*>/), 'id')
    expect(id).toMatch(/^_R_\w+_$/)
    expect(attr(region, 'aria-labelledby')).toBe(id)
    expect(region).not.toContain('tabindex')
  })

  it('the panel itself has no role and no name: closed, it is a box with nothing in it to announce', () => {
    const panel = tag(html, /<div [^>]*id="base-ui-[^>]*>/)
    expect(panel).toContain('hidden=""')
    expect(panel).not.toContain('role=')
    expect(panel).not.toContain('aria-labelledby')
  })

  it('an item open from the start says so on its trigger, names its panel, and its panel is not hidden', () => {
    const open = one({ value: 'install', title: 'How do I install it?', children: 'Run the add command.' }, true)
    const button = tag(open, /<button [^>]*>/)
    const panel = tag(open, /<div [^>]*id="base-ui-[^>]*>/)
    expect(attr(button, 'aria-expanded')).toBe('true')
    expect(button).toContain('data-panel-open=""')
    expect(attr(button, 'aria-controls')).toBe(attr(panel, 'id'))
    expect(panel).not.toContain('hidden')
  })

  it('a disabled item says so to a screen reader and keeps its place in the tab order', () => {
    const button = tag(one({ value: 'billing', title: 'Billing', disabled: true }), /<button [^>]*>/)
    expect(attr(button, 'aria-disabled')).toBe('true')
    expect(button).toContain('data-disabled=""')
    expect(attr(button, 'tabindex')).toBe('0')
    expect(button).not.toMatch(/ disabled=""/)
  })

  it('renders a title that is an element as it was given', () => {
    const rich = one({ value: 'invoices', title: <><strong>Invoices</strong> <em>3 new</em></> })
    expect(rich).toContain('<span class="min-w-0 grow basis-[6ch]"><strong>Invoices</strong> <em>3 new</em></span>')
  })
})
