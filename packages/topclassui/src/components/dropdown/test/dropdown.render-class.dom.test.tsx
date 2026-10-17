import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import {
  DropdownGroup, DropdownGroupLabel, DropdownItem, DropdownLinkItem, DropdownPopup, DropdownRoot, DropdownSeparator,
  DropdownTrigger,
} from '../index.js'

const classes = (element: Element | null) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe("R-5.2-2: a render element's class follows the part's own and the consumer's, through cn()", () => {
  it('every row, the group, its label and the separator take the class their element was written with', async () => {
    render(
      <DropdownRoot defaultOpen>
        <DropdownTrigger render={<Button>Actions</Button>} />
        <DropdownPopup>
          <DropdownGroup data-testid="group" render={<div className="gap-2" />}>
            <DropdownGroupLabel className="py-2" render={<div className="py-3" />}>Account</DropdownGroupLabel>
            <DropdownItem className="px-2" render={<div className="px-5" />}>Profile</DropdownItem>
            <DropdownLinkItem href="/billing" render={<a className="px-6" />}>Billing</DropdownLinkItem>
          </DropdownGroup>
          <DropdownSeparator data-testid="line" render={<div className="my-3" />} />
        </DropdownPopup>
      </DropdownRoot>,
    )
    await screen.findByRole('menu')
    expect(classes(screen.getByTestId('group'))).toContain('gap-2')
    expect(classes(screen.getByTestId('group'))).not.toContain('gap-0.5')
    expect(classes(screen.getByText('Account'))).toEqual(['px-3', 'text-xs', 'font-medium', 'text-muted', 'py-3'])
    expect(classes(screen.getByRole('menuitem', { name: 'Profile' }))).toContain('px-5')
    expect(classes(screen.getByRole('menuitem', { name: 'Profile' }))).not.toContain('px-2')
    expect(classes(screen.getByRole('menuitem', { name: 'Billing' }))).toContain('px-6')
    expect(classes(screen.getByTestId('line'))).toContain('my-3')
    expect(classes(screen.getByTestId('line'))).not.toContain('my-1')
  })
})
