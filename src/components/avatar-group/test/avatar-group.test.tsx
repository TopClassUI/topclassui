import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { AvatarGroup } from '../index.js'
import type { AvatarGroupProps } from '../types.js'

/** Plain spans, so the root is read on its own and not through what an Avatar renders. */
const two = (props: AvatarGroupProps = {}) =>
  markup(<AvatarGroup {...props}><span>A</span><span>B</span></AvatarGroup>)

/** The whole default render, written out, so an extra attribute or element also fails. */
const DEFAULT = '<span role="group" data-size="md"'
  + ' class="inline-flex items-center *:ring-2 *:ring-page *:not-first:-ms-2">'
  + '<span>A</span><span>B</span></span>'

describe('the element it renders', () => {
  it('is a span with the group role holding its children in order, and nothing else', () => {
    expect(two()).toBe(DEFAULT)
  })

  it('is a group, so a screen reader meets the row of faces as one thing', () => {
    expect(attr(two(), 'role')).toBe('group')
  })

  it('renders an empty group for no children, with no counter', () => {
    expect(markup(<AvatarGroup />))
      .toBe('<span role="group" data-size="md" class="inline-flex items-center *:ring-2 *:ring-page *:not-first:-ms-2"></span>')
  })

  it('takes a name from aria-label, which role group reads out', () => {
    expect(attr(two({ 'aria-label': 'Reviewers' }), 'aria-label')).toBe('Reviewers')
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html = markup(<AvatarGroup id="team" data-testid="x" title="The team"><span>A</span></AvatarGroup>)
    expect(attr(html, 'id')).toBe('team')
    expect(attr(html, 'data-testid')).toBe('x')
    expect(attr(html, 'title')).toBe('The team')
  })

  it('passes style through to the root', () => {
    expect(attr(two({ style: { opacity: 0.5 } }), 'style')).toBe('opacity:0.5')
  })

  it('writes none of its own props onto the element', () => {
    const html = two({ max: 1, locale: 'de' })
    expect(html).not.toContain('max=')
    expect(html).not.toContain('locale=')
    expect(html).not.toContain('labels=')
  })
})

describe('className', () => {
  it('is merged last, after every class of the group', () => {
    expect(classList(two({ className: 'gap-1' }))).toEqual([
      'inline-flex', 'items-center', '*:ring-2', '*:ring-page', '*:not-first:-ms-2', 'gap-1',
    ])
  })

  it('wins a conflict, so a caller can change the display or the overlap', () => {
    expect(classList(two({ className: 'flex' }))).toEqual([
      'items-center', '*:ring-2', '*:ring-page', '*:not-first:-ms-2', 'flex',
    ])
    expect(classList(two({ className: '*:not-first:-ms-1' }))).toEqual([
      'inline-flex', 'items-center', '*:ring-2', '*:ring-page', '*:not-first:-ms-1',
    ])
  })
})

describe('the design attributes', () => {
  it('defaults to md, which the playground shows', () => {
    expect(attr(two(), 'data-size')).toBe('md')
    expect(attr(two({ size: undefined }), 'data-size')).toBe('md')
  })

  for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const) {
    it(`reports ${size}, and the root carries the same classes at every size`, () => {
      const html = two({ size })
      expect(attr(html, 'data-size')).toBe(size)
      expect(classList(html)).toEqual(['inline-flex', 'items-center', '*:ring-2', '*:ring-page', '*:not-first:-ms-2'])
    })
  }
})

describe('no caller value gets past the role', () => {
  it('stays a group when a JavaScript caller passes a role the type refuses', () => {
    const forced = { role: 'presentation' } as unknown as AvatarGroupProps
    expect(attr(two(forced), 'role')).toBe('group')
  })

  it('reports its own size when a caller passes data-size too', () => {
    const html = markup(<AvatarGroup size="lg" data-size="xs"><span>A</span></AvatarGroup>)
    expect(attr(html, 'data-size')).toBe('lg')
  })
})
