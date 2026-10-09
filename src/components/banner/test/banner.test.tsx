import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import * as entry from '../index.js'
import { Banner } from '../index.js'

const html = () => markup(<Banner aria-label="Release announcement">Version 2 is out.</Banner>)
const rootTag = (source: string) => /^<div[^>]*>/.exec(source)?.[0] ?? ''

describe('the element it renders', () => {
  it('is a div', () => {
    expect(html()).toMatch(/^<div /)
  })

  it('is a region, so a screen reader lists it among the landmarks', () => {
    expect(attr(rootTag(html()), 'role')).toBe('region')
  })

  it('is named by aria-label, without which a region is no landmark at all', () => {
    expect(attr(rootTag(html()), 'aria-label')).toBe('Release announcement')
  })

  it('is named by aria-labelledby just as well', () => {
    const source = markup(<Banner aria-labelledby="msg"><span id="msg">Version 2 is out.</span></Banner>)
    expect(attr(rootTag(source), 'aria-labelledby')).toBe('msg')
    expect(attr(rootTag(source), 'role')).toBe('region')
  })

  it('keeps the region role when a JS caller passes another, since the type has no role', () => {
    const props = { role: 'alert' } as object
    const source = markup(<Banner aria-label="Notice" {...props}>Saved.</Banner>)
    expect(attr(rootTag(source), 'role')).toBe('region')
    expect(source.match(/role=/g)).toHaveLength(1)
  })

  it('is not a live region: it is there when the page loads', () => {
    expect(html()).not.toContain('aria-live')
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const source = markup(<Banner aria-label="Notice" id="v2-release" data-testid="x" aria-describedby="help">Out.</Banner>)
    expect(source).toMatch(/^<div [^>]*id="v2-release"/)
    expect(attr(source, 'data-testid')).toBe('x')
    expect(attr(source, 'aria-describedby')).toBe('help')
  })

  it('passes style through to the root', () => {
    const source = markup(<Banner aria-label="Notice" style={{ opacity: 0.5 }}>Out.</Banner>)
    expect(source).toMatch(/^<div [^>]*style="opacity:0.5"/)
  })

  it('exports the component and its class string, and no part', () => {
    expect(Object.keys(entry).sort()).toEqual(['Banner', 'bannerVariants'])
  })
})

describe('the design attributes', () => {
  it('reports its tone, which the docs and tests read', () => {
    expect(attr(markup(<Banner aria-label="Notice" tone="danger">Failed.</Banner>), 'data-tone')).toBe('danger')
  })

  it('defaults to primary, the shared default tone', () => {
    expect(attr(html(), 'data-tone')).toBe('primary')
  })

  it('carries no data-variant and no data-size, because a banner has one of each', () => {
    expect(html()).not.toMatch(/data-(variant|size)/)
  })

  it('carries no state attribute: dismissing and sticking are the client half, not built', () => {
    expect(html()).not.toMatch(/data-(state|open|dismissed|dismissible|sticky|placement)/)
  })

  it('renders no button of its own, so the server half ships no dismiss control', () => {
    expect(html()).not.toContain('<button')
  })
})
