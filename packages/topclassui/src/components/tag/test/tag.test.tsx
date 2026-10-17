import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Tag } from '../index.js'
import type { TagProps } from '../types.js'

const html = (props: TagProps = {}) => markup(<Tag {...props}>React</Tag>)

describe('the element it renders', () => {
  it('is a span, so it sits inside a line of text', () => {
    expect(html()).toMatch(/^<span /)
  })

  it('has no role, because the text carries the meaning and colour never does alone', () => {
    expect(html()).not.toContain('role=')
  })

  it('renders its children', () => {
    expect(html()).toContain('React')
  })

  it('spreads the rest onto the root', () => {
    // JSX, not an object: TypeScript accepts a data-* key only as an attribute.
    const html_ = markup(<Tag id="topic" data-testid="x" title="Topic">React</Tag>)
    expect(attr(html_, 'id')).toBe('topic')
    expect(attr(html_, 'data-testid')).toBe('x')
    expect(attr(html_, 'title')).toBe('Topic')
  })

  it('passes style through to the root', () => {
    expect(attr(html({ style: { opacity: 0.5 } }), 'style')).toBe('opacity:0.5')
  })
})

describe('the design attributes', () => {
  it('reports its tone and size, which the docs and tests read', () => {
    const html_ = html({ tone: 'danger', size: 'lg' })
    expect(attr(html_, 'data-tone')).toBe('danger')
    expect(attr(html_, 'data-size')).toBe('lg')
  })

  it('defaults to neutral and md, which is where it parts from Badge', () => {
    const html_ = html()
    expect(attr(html_, 'data-tone')).toBe('neutral')
    expect(attr(html_, 'data-size')).toBe('md')
  })

  it('reports no variant, because soft is the only look and not a choice', () => {
    expect(html()).not.toContain('data-variant')
  })

  it('carries no state attribute, because the server half has no states', () => {
    expect(html()).not.toMatch(/data-(state|disabled|loading|open|removable)/)
  })

  it('renders no button without onRemove, because the x is the client half', () => {
    expect(html()).not.toContain('<button')
  })
})
