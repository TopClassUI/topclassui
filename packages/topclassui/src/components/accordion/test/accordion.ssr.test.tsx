import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AccordionItem, AccordionRoot } from '../index.js'
import type { AccordionRootProps } from '../types.js'

/** Three questions, as a page would write them. The second holds a link, which only an open panel may offer. */
const faq = (props: AccordionRootProps = {}) => (
  <AccordionRoot {...props}>
    <AccordionItem value="install" title="How do I install it?">Run the add command.</AccordionItem>
    <AccordionItem value="arabic" title="Does it work in Arabic?">
      <p>Yes, <a href="/rtl">read how</a>.</p>
    </AccordionItem>
    <AccordionItem value="bundle" title="How big is the bundle?">About one kilobyte.</AccordionItem>
  </AccordionRoot>
)

/** The server HTML a browser is sent, before any script has run. */
const html = (props?: AccordionRootProps) => renderToString(faq(props))

/** Each panel of the HTML: the opening tag of the element that hides or shows it, and what its region holds. */
function panels(source: string): Array<{ tag: string, inside: string }> {
  const parts = source.split('<div role="region"')
  return parts.slice(1).map((part, index) => {
    const before = parts[index] ?? ''
    return { tag: before.slice(before.lastIndexOf('<div ')), inside: part.slice(part.indexOf('>') + 1, part.indexOf('</div></div></div>')) }
  })
}

// PLAN 19, Phase 6: "a test fetches the server HTML and finds the text of closed accordion panels".
describe('the text of a closed panel is in the server HTML', () => {
  it('holds the answer of every item when all three are closed', () => {
    const sent = html()
    expect(sent).toContain('Run the add command.')
    expect(sent).toContain('<p>Yes, <a href="/rtl">read how</a>.</p>')
    expect(sent).toContain('About one kilobyte.')
  })

  it('sends each closed panel hidden, so nothing of it is shown before the script runs', () => {
    const found = panels(html())
    expect(found).toHaveLength(3)
    for (const panel of found) expect(panel.tag).toContain('hidden=""')
    expect(found.map((panel) => panel.inside.replace(/<[^>]+>/g, ''))).toEqual([
      'Run the add command.', 'Yes, read how.', 'About one kilobyte.',
    ])
  })

  it('sends an open panel with no hidden attribute, and the two closed ones still hold their text', () => {
    const found = panels(html({ defaultValue: ['arabic'] }))
    expect(found.map((panel) => panel.tag.includes('hidden'))).toEqual([true, false, true])
    expect(found[0]?.inside).toContain('Run the add command.')
    expect(found[2]?.inside).toContain('About one kilobyte.')
  })

  it('keeps the text of the closed panels with multiple, too', () => {
    const sent = html({ multiple: true, defaultValue: ['install', 'bundle'] })
    expect(panels(sent).map((panel) => panel.tag.includes('hidden'))).toEqual([false, true, false])
    expect(sent).toContain('read how')
  })

  it('the scan reads the tag that wraps a region, and what the region holds', () => {
    const probe = '<div><div id="a" hidden=""><div role="region" aria-labelledby="x">One</div></div></div><div><div id="b"><div role="region">Two <b>2</b></div></div></div>'
    expect(panels(probe)).toEqual([
      { tag: '<div id="a" hidden="">', inside: 'One' },
      { tag: '<div id="b">', inside: 'Two <b>2</b>' },
    ])
  })
})

describe('hiddenUntilFound={false} takes the closed panels out of the HTML', () => {
  it('sends the text of the open panel only', () => {
    const sent = html({ hiddenUntilFound: false, defaultValue: ['install'] })
    expect(sent).toContain('Run the add command.')
    expect(sent).not.toContain('read how')
    expect(sent).not.toContain('About one kilobyte.')
    expect(panels(sent)).toHaveLength(1)
  })

  it('sends them again with keepMounted, hidden as before', () => {
    const sent = html({ hiddenUntilFound: false, keepMounted: true })
    expect(sent).toContain('About one kilobyte.')
    for (const panel of panels(sent)) expect(panel.tag).toContain('hidden=""')
  })
})
