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

  it('exports the component, its client export with a handler and its class string, and no part', () => {
    expect(Object.keys(entry).sort()).toEqual(['Banner', 'BannerDismissible', 'bannerVariants'])
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

  it('carries no state attribute, dismissible or not: a dismissed banner is gone, not marked', () => {
    expect(html()).not.toMatch(/data-(state|open|dismissed|dismissible|sticky|placement)/)
    const shell = markup(<Banner aria-label="Notice" dismissible id="v2">Out.</Banner>)
    expect(shell).not.toMatch(/data-(state|open|dismissed|dismissible|sticky|placement)/)
  })

  it('renders no button of its own unless dismissible, so a plain banner ships no dismiss control', () => {
    expect(html()).not.toContain('<button')
    expect(markup(<Banner aria-label="Notice" dismissible={false} id="v2">Out.</Banner>)).not.toContain('<button')
  })
})

describe('a dismissible banner on the server', () => {
  const shell = () => markup(
    <Banner aria-label="Release announcement" tone="warning" dismissible id="release-v2" className="mt-4">Version 2 is out.</Banner>,
  )

  it('is shown, since the server cannot read the storage that remembers a dismissal', () => {
    expect(shell()).toMatch(/^<div [^>]*role="region"/)
    expect(shell()).toContain('Version 2 is out.')
  })

  it('keeps the root of the plain banner: tone, classes with the caller last, name, role and id', () => {
    const tag = rootTag(shell())
    expect(attr(tag, 'data-tone')).toBe('warning')
    expect(attr(tag, 'aria-label')).toBe('Release announcement')
    expect(attr(tag, 'id')).toBe('release-v2')
    expect(attr(tag, 'class')?.endsWith(' mt-4')).toBe(true)
    expect(attr(tag, 'class')).toContain('bg-warning-soft')
  })

  it('ends with one plain button, after the message, named in English with no provider', () => {
    const source = shell()
    expect(source.match(/<button/g)).toHaveLength(1)
    expect(source).toMatch(/Version 2 is out\.<\/div><button type="button" aria-label="Dismiss"/)
    expect(source).toMatch(/<\/svg><\/button><\/div>$/)
  })

  it('keeps the region role when a JS caller passes another', () => {
    const props = { role: 'alert' } as object
    const source = markup(<Banner aria-label="Notice" dismissible id="v2" {...props}>Saved.</Banner>)
    expect(attr(rootTag(source), 'role')).toBe('region')
  })

  it('falls back to the plain banner when a JS caller leaves the id out, since nothing could remember it', () => {
    const props = { dismissible: true } as object
    expect(markup(<Banner aria-label="Notice" {...props}>Saved.</Banner>)).not.toContain('<button')
  })
})
