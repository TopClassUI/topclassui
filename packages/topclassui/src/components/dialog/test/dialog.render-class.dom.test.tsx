import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DialogDescription, DialogPopup, DialogRoot, DialogTitle } from '../index.js'

const classes = (element: Element | null) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe("R-5.2-2: a render element's class follows the part's own and the consumer's, through cn()", () => {
  it('the title and the description take the class their element was written with', async () => {
    render(
      <DialogRoot defaultOpen>
        <DialogPopup>
          <DialogTitle className="font-bold" render={<h3 className="text-lg font-normal" />}>Publish</DialogTitle>
          <DialogDescription render={<p className="text-xs" />}>Live right away.</DialogDescription>
        </DialogPopup>
      </DialogRoot>,
    )
    await screen.findByRole('dialog')
    const title = screen.getByRole('heading', { level: 3 })
    expect(classes(title)).toEqual(['text-body', 'text-lg', 'font-normal'])
    expect(classes(screen.getByText('Live right away.'))).toEqual(['text-muted', 'text-xs'])
  })
})
