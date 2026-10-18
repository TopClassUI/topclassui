import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AccordionItem, AccordionRoot } from '../index.js'

const classes = (element: Element | null) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe("R-5.2-2: a render element's class follows the part's own and the consumer's, through cn()", () => {
  it('the root and the item take the class their element was written with', () => {
    const { container } = render(
      <AccordionRoot className="bg-surface" render={<section className="bg-page" />}>
        <AccordionItem value="shipping" title="Shipping" className="border-t-0" render={<article className="first:border-t" />}>Two days.</AccordionItem>
      </AccordionRoot>,
    )
    const root = container.querySelector('section')
    expect(classes(root)).toContain('bg-page')
    expect(classes(root)).not.toContain('bg-surface')
    expect(classes(root)).not.toContain('bg-surface-raised')
    const item = container.querySelector('article')
    expect(classes(item)).toContain('first:border-t')
    expect(classes(item)).not.toContain('first:border-t-0')
  })
})
