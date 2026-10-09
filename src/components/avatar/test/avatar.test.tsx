import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Svg } from '#components/svg/index.js'
import { user } from '#icons/data/user.js'
import { attr, markup as render } from '#test/markup.js'
import { AvatarFallback, AvatarImage, AvatarRoot } from '../index.js'

/** React 19 hoists a preload link ahead of any eager img it renders; the part's own markup follows it. */
const markup = (element: ReactElement) =>
  render(element).replace(/^<link rel="preload" as="image" [^>]*>/, '')

describe('AvatarRoot', () => {
  it('is one span around its children, with the size as an attribute', () => {
    expect(markup(<AvatarRoot>OA</AvatarRoot>)).toMatch(/^<span data-size="md" class="[^"]+">OA<\/span>$/)
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
    it(`reports size ${size} as data-size (R-5.7-6)`, () => {
      expect(attr(markup(<AvatarRoot size={size} />), 'data-size')).toBe(size)
    })
  }

  it('has no role and no tab stop, because nothing about it can be activated', () => {
    const html = markup(<AvatarRoot>OA</AvatarRoot>)
    expect(html).not.toContain('role=')
    expect(html).not.toContain('tabindex')
  })

  it('spreads the rest and the style onto its span', () => {
    const html = markup(
      <AvatarRoot id="a" data-testid="x" aria-label="Omar Abed" title="Omar" style={{ opacity: 0.5 }}>OA</AvatarRoot>,
    )
    expect(attr(html, 'id')).toBe('a')
    expect(attr(html, 'data-testid')).toBe('x')
    expect(attr(html, 'aria-label')).toBe('Omar Abed')
    expect(attr(html, 'title')).toBe('Omar')
    expect(attr(html, 'style')).toBe('opacity:0.5')
  })
})

describe('AvatarFallback', () => {
  it('is one span around the initials', () => {
    expect(markup(<AvatarFallback>OA</AvatarFallback>)).toMatch(/^<span class="[^"]+">OA<\/span>$/)
  })

  it('holds an Svg icon as readily as text', () => {
    const html = markup(<AvatarFallback><Svg icon={user} /></AvatarFallback>)
    expect(html).toMatch(/^<span class="[^"]+"><svg [^>]+><path [^>]+><\/path><\/svg><\/span>$/)
  })

  it('spreads the rest onto its span, so a caller can hide initials a visible name repeats', () => {
    const html = markup(<AvatarFallback id="f" aria-hidden style={{ opacity: 0.5 }}>OA</AvatarFallback>)
    expect(attr(html, 'id')).toBe('f')
    expect(attr(html, 'aria-hidden')).toBe('true')
    expect(attr(html, 'style')).toBe('opacity:0.5')
  })
})

describe('AvatarImage', () => {
  it('is one plain img with the alt and the source it was given', () => {
    expect(markup(<AvatarImage src="/team/omar.jpg" alt="Omar Abed" />))
      .toMatch(/^<img alt="Omar Abed" class="[^"]+" src="\/team\/omar\.jpg"\/>$/)
  })

  it('keeps an empty alt as an empty alt, for a picture beside a written name', () => {
    expect(markup(<AvatarImage src="/a.jpg" alt="" />)).toMatch(/^<img alt="" /)
  })

  it('ships no handler: hiding a broken image is the client half', () => {
    expect(markup(<AvatarImage src="/a.jpg" alt="A" />)).not.toMatch(/ on[a-z]+=/)
  })

  it('passes the native image attributes and the style through', () => {
    const html = markup(
      <AvatarImage src="/a.jpg" alt="A" loading="lazy" width={40} height={40} id="i" data-testid="x" style={{ opacity: 0.5 }} />,
    )
    expect(attr(html, 'loading')).toBe('lazy')
    expect(attr(html, 'width')).toBe('40')
    expect(attr(html, 'height')).toBe('40')
    expect(attr(html, 'id')).toBe('i')
    expect(attr(html, 'data-testid')).toBe('x')
    expect(attr(html, 'style')).toBe('opacity:0.5')
  })
})

describe('the parts compose', () => {
  const html = markup(
    <AvatarRoot size="lg">
      <AvatarImage src="/team/omar.jpg" alt="Omar Abed" />
      <AvatarFallback>OA</AvatarFallback>
    </AvatarRoot>,
  )

  it('renders the image and the fallback together inside the root, in the order given', () => {
    expect(html).toMatch(
      /^<span data-size="lg" class="[^"]+"><img alt="Omar Abed" class="[^"]+" src="\/team\/omar\.jpg"\/><span class="[^"]+">OA<\/span><\/span>$/,
    )
  })

  it('always renders the fallback, since no script will put it back when the image fails', () => {
    expect(html.split('>OA<').length - 1).toBe(1)
  })

  it('takes the fallback first too: the image is positioned, so it paints over either way', () => {
    const swapped = markup(
      <AvatarRoot>
        <AvatarFallback>OA</AvatarFallback>
        <AvatarImage src="/a.jpg" alt="A" />
      </AvatarRoot>,
    )
    expect(swapped).toMatch(/^<span [^>]+><span class="[^"]+">OA<\/span><img alt="A" class="[^"]*absolute[^"]*" src="\/a\.jpg"\/><\/span>$/)
  })
})
