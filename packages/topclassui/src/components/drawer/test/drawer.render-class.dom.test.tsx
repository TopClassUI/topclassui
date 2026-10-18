import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DrawerBody, DrawerDescription, DrawerPopup, DrawerRoot, DrawerTitle } from '../index.js'

const classes = (element: Element | null) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe("R-5.2-2: a render element's class follows the part's own and the consumer's, through cn()", () => {
  it('the title, the description and the body take the class their element was written with', async () => {
    render(
      <DrawerRoot defaultOpen>
        <DrawerPopup>
          <DrawerTitle className="font-bold" render={<h3 className="text-lg font-normal" />}>Filters</DrawerTitle>
          <DrawerDescription render={<p className="text-xs" />}>Narrow the list.</DrawerDescription>
          <DrawerBody className="px-2" render={<section className="px-6" />}>Status and owner.</DrawerBody>
        </DrawerPopup>
      </DrawerRoot>,
    )
    await screen.findByRole('dialog')
    expect(classes(screen.getByRole('heading', { level: 3 }))).toEqual(['text-body', 'text-lg', 'font-normal'])
    expect(classes(screen.getByText('Narrow the list.'))).toEqual(['text-muted', 'text-xs'])
    const body = screen.getByText('Status and owner.')
    expect(body.tagName).toBe('SECTION')
    expect(classes(body)).toContain('px-6')
    expect(classes(body)).not.toContain('px-2')
    expect(classes(body)).not.toContain('px-4')
  })
})
