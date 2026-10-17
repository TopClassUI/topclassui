import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { serveTabStopOn, useServerTabStop } from './use-server-tab-stop.js'

/** An item of a roving list: the stop is spread first, as Tabs does, so the caller's props win. */
function Item({ isStop, label }: { isStop: boolean; label: string }) {
  return <button type="button" {...useServerTabStop(isStop)} data-item="">{label}</button>
}

function Returned({ isStop }: { isStop: boolean }) {
  const returned = useServerTabStop(isStop)
  return <output>{JSON.stringify(returned)}</output>
}

// The ssr project: the server render, where no script has run and no effect ever will.
describe('in the server render', () => {
  it('writes tabindex="0" on the item that is the stop', () => {
    expect(renderToStaticMarkup(<Item isStop label="On" />)).toBe('<button type="button" tabindex="0" data-item="">On</button>')
  })

  it('writes no tabindex on an item that is not', () => {
    expect(renderToStaticMarkup(<Item isStop={false} label="Off" />)).toBe('<button type="button" data-item="">Off</button>')
  })

  it('returns exactly { tabIndex: 0 } or an empty object, so a spread adds nothing else', () => {
    expect(renderToStaticMarkup(<Returned isStop />)).toBe('<output>{&quot;tabIndex&quot;:0}</output>')
    expect(renderToStaticMarkup(<Returned isStop={false} />)).toBe('<output>{}</output>')
  })

  it('gives one stop to a list of three, on the one item that asks', () => {
    const html = renderToStaticMarkup(
      <div role="radiogroup" aria-label="Plan">
        <Item isStop={false} label="Free" />
        <Item isStop label="Pro" />
        <Item isStop={false} label="Team" />
      </div>,
    )
    expect(html.match(/tabindex="0"/g)).toEqual(['tabindex="0"'])
    expect(html).toContain('<button type="button" tabindex="0" data-item="">Pro</button>')
  })
})

// SHARED-FORMS-4: with no item to open on, the server HTML had no tab stop, and hydration then moved the tab order.
describe('serveTabStopOn', () => {
  const V = ({ value }: { value: string, disabled?: boolean }) => <i>{value}</i>
  const three = [<V key="a" value="a" disabled />, <div key="w"><><V value="b" /></></div>, <V key="c" value="c" />]

  it('keeps the value the page opens on when an item has it, disabled or not', () => {
    expect(serveTabStopOn(three, 'c')).toBe('c')
    expect(serveTabStopOn(three, 'a')).toBe('a')
  })

  it('gives the first enabled item the stop when none is checked, or the value names no item, under any wrapper', () => {
    expect(serveTabStopOn(three, null)).toBe('b')
    expect(serveTabStopOn(three, 'stale')).toBe('b')
  })

  it('changes nothing when it sees no item, no item is enabled, or the group is disabled', () => {
    expect(serveTabStopOn(<p>text</p>, null)).toBeNull()
    expect(serveTabStopOn([<V key="a" value="a" disabled />], 'stale')).toBe('stale')
    expect(serveTabStopOn(three, null, true)).toBeNull()
  })
})

// An effect runs after the first paint: the store answers during the render that hydrates.
describe('the source', () => {
  const source = readFileSync(join(import.meta.dirname, 'use-server-tab-stop.ts'), 'utf8')

  it("starts with 'use client' and learns of hydration with no effect", () => {
    expect(source.startsWith("'use client'\n")).toBe(true)
    expect(source.match(/use\w*Effect/g)).toBeNull()
  })
})
