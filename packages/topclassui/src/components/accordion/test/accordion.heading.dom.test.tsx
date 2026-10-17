import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ACCORDION_BOUNDARIES } from '../boundaries.js'
import { ACCORDION_DEFAULTS, ACCORDION_HEADINGS } from '../constants.js'
import { AccordionItem, AccordionRoot } from '../index.js'
import { headingFor } from '../lib.js'

/** The tag of the heading an item with this level renders its trigger in. */
function tagAt(level?: number): string | undefined {
  const { unmount } = render(
    <AccordionRoot>
      <AccordionItem value="one" title="One" headingLevel={level}>Text</AccordionItem>
    </AccordionRoot>,
  )
  const tag = screen.getByRole('button', { name: 'One' }).parentElement?.tagName
  unmount()
  return tag
}

describe('headingLevel', () => {
  it('is an h3 when nothing is passed, as Base UI renders it', () => {
    expect(tagAt()).toBe('H3')
    expect(ACCORDION_DEFAULTS.headingLevel).toBe(3)
  })

  it('renders each of the five levels as its own tag', () => {
    expect([2, 3, 4, 5, 6].map(tagAt)).toEqual(['H2', 'H3', 'H4', 'H5', 'H6'])
  })

  it('9 renders an h6: HTML has no h7, and a div would drop the heading', () => {
    expect(tagAt(9)).toBe('H6')
    expect(tagAt(Number.POSITIVE_INFINITY)).toBe('H6')
  })

  it('1, 0 and -3 render an h2: the h1 is the title of the page', () => {
    expect([1, 0, -3].map(tagAt)).toEqual(['H2', 'H2', 'H2'])
  })

  it('a level between two is rounded to the nearer one', () => {
    expect(tagAt(2.4)).toBe('H2')
    expect(tagAt(4.5)).toBe('H5')
  })

  it('the heading holds the trigger and nothing else, and is exposed at its level', () => {
    render(
      <AccordionRoot>
        <AccordionItem value="one" title="One" headingLevel={4}>Text</AccordionItem>
      </AccordionRoot>,
    )
    const heading = screen.getByRole('heading', { level: 4, name: 'One' })
    expect(heading.children).toHaveLength(1)
    expect(heading.firstElementChild).toBe(screen.getByRole('button', { name: 'One' }))
  })

  it('each item takes its own level, so an accordion inside a panel can go one deeper', () => {
    render(
      <AccordionRoot defaultValue={['outer']}>
        <AccordionItem value="outer" title="Outer" headingLevel={2}>
          <AccordionRoot>
            <AccordionItem value="inner" title="Inner" headingLevel={3}>Text</AccordionItem>
          </AccordionRoot>
        </AccordionItem>
      </AccordionRoot>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Outer' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Inner' })).toBeTruthy()
  })
})

describe('headingFor', () => {
  it('maps the five levels to the five tags', () => {
    expect([2, 3, 4, 5, 6].map(headingFor)).toEqual(['h2', 'h3', 'h4', 'h5', 'h6'])
  })

  it('holds a level outside the bounds at the nearer bound', () => {
    expect([9, 7, 1, -1].map(headingFor)).toEqual(['h6', 'h6', 'h2', 'h2'])
  })

  it('answers the lowest heading for a level that is no number', () => {
    expect(headingFor(Number.NaN)).toBe('h2')
  })

  it('the bounds and the table name the same five levels', () => {
    expect(ACCORDION_BOUNDARIES).toEqual({ headingLevelMin: 2, headingLevelMax: 6 })
    expect(ACCORDION_HEADINGS).toEqual({ 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' })
  })
})
