import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { CardBody, CardFooter, CardHeader, CardRoot } from '../index.js'
import type { CardRootProps } from '../types.js'

/** The four parts take the same div props, so one table drives the shared checks. */
const PARTS: [string, ComponentType<CardRootProps>][] = [
  ['CardRoot', CardRoot],
  ['CardHeader', CardHeader],
  ['CardBody', CardBody],
  ['CardFooter', CardFooter],
]

describe('every part is one plain div', () => {
  for (const [name, Part] of PARTS) {
    it(`${name} renders a single div around its children and nothing else`, () => {
      expect(markup(<Part>Inside</Part>), name).toMatch(/^<div class="[^"]+">Inside<\/div>$/)
    })

    it(`${name} has no role and no tab stop, because nothing about it can be activated`, () => {
      const html = markup(<Part>Inside</Part>)
      expect(html, name).not.toContain('role=')
      expect(html, name).not.toContain('tabindex')
    })

    it(`${name} carries no design or state attribute, because Card has neither`, () => {
      expect(markup(<Part>Inside</Part>), name).not.toContain('data-')
    })

    it(`${name} spreads the rest onto its div`, () => {
      // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
      const html = markup(<Part id="p" data-testid="x" aria-labelledby="t" title="Plan">Inside</Part>)
      expect(attr(html, 'id'), name).toBe('p')
      expect(attr(html, 'data-testid'), name).toBe('x')
      expect(attr(html, 'aria-labelledby'), name).toBe('t')
      expect(attr(html, 'title'), name).toBe('Plan')
    })

    it(`${name} passes style through`, () => {
      expect(attr(markup(<Part style={{ opacity: 0.5 }}>Inside</Part>), 'style'), name).toBe('opacity:0.5')
    })

    it(`${name} renders nothing of its own when it has no children`, () => {
      expect(markup(<Part />), name).toMatch(/^<div class="[^"]+"><\/div>$/)
    })
  }
})

describe('the parts compose', () => {
  const html = markup(
    <CardRoot>
      <CardHeader><h2>Monthly report</h2></CardHeader>
      <CardBody>Revenue rose 12% against April.</CardBody>
      <CardFooter><button type="button">Download PDF</button></CardFooter>
    </CardRoot>,
  )

  it('nests the header, the body and the footer inside the root, in that order', () => {
    expect(html).toMatch(
      /^<div class="[^"]+"><div class="[^"]+"><h2>Monthly report<\/h2><\/div><div class="[^"]+">Revenue rose 12% against April\.<\/div><div class="[^"]+"><button type="button">Download PDF<\/button><\/div><\/div>$/,
    )
  })

  it('renders each piece of content exactly once', () => {
    for (const text of ['Monthly report', 'Revenue rose 12% against April.', 'Download PDF']) {
      expect(html.split(text).length - 1, text).toBe(1)
    }
  })

  it('leaves the heading element to the caller and adds no heading role of its own', () => {
    expect(markup(<CardHeader><h3>Plan</h3></CardHeader>)).toMatch(/^<div class="[^"]+"><h3>Plan<\/h3><\/div>$/)
  })

  it('keeps a link inside a sentence as one run of text in the body', () => {
    expect(markup(<CardBody>Read the <a href="/terms">terms</a> first.</CardBody>))
      .toMatch(/^<div class="[^"]+">Read the <a href="\/terms">terms<\/a> first\.<\/div>$/)
  })
})
