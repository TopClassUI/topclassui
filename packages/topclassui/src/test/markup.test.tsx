import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from './markup.js'

// The helper 46 component folders read, so it gets the same treatment as the rest.
describe('attr', () => {
  it('reads an attribute by its whole name, not a suffix of another', () => {
    const html = '<button data-testid="x" id="save">'
    expect(attr(html, 'id')).toBe('save')
    expect(attr(html, 'testid')).toBeUndefined()
  })

  it('is undefined for an attribute that is not there', () => {
    expect(attr('<span>', 'class')).toBeUndefined()
  })

  it('reads an empty presence attribute as the empty string', () => {
    expect(attr('<button disabled="" data-loading="">', 'data-loading')).toBe('')
  })
})

describe('classList', () => {
  it('splits on any run of whitespace and drops the empties', () => {
    expect(classList('<i class="a  b\nc">')).toEqual(['a', 'b', 'c'])
  })

  it('is empty when there is no class attribute at all', () => {
    expect(classList('<i>')).toEqual([])
  })
})

describe('markup', () => {
  it('renders an element to static HTML with no hydration markers', () => {
    expect(markup(<i className="a">x</i>)).toBe('<i class="a">x</i>')
  })
})
