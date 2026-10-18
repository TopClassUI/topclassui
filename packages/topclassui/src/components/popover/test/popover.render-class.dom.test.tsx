import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle } from '../index.js'

const classes = (element: Element | null) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe("R-5.2-2: a render element's class follows the part's own and the consumer's, through cn()", () => {
  it('the title and the description take the class their element was written with', async () => {
    render(
      <PopoverRoot defaultOpen>
        <PopoverPopup>
          <PopoverTitle className="font-bold" render={<h3 className="text-lg font-normal" />}>Share</PopoverTitle>
          <PopoverDescription render={<p className="text-xs" />}>Anyone with the link.</PopoverDescription>
        </PopoverPopup>
      </PopoverRoot>,
    )
    await screen.findByRole('dialog')
    expect(classes(screen.getByRole('heading', { level: 3 }))).toEqual(['text-body', 'text-lg', 'font-normal'])
    expect(classes(screen.getByText('Anyone with the link.'))).toEqual(['text-muted', 'text-xs'])
  })
})
