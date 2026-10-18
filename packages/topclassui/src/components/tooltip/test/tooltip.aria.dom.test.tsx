import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipPopupProps, TooltipRootProps } from '../types.js'

// R-5.6-1: Base UI 1.8.0 gives the popup no role and the trigger no aria-describedby, so Tooltip adds both.

function Copy({ id, ...props }: TooltipRootProps & Pick<TooltipPopupProps, 'id'>) {
  return (
    <TooltipRoot {...props}>
      <TooltipTrigger render={<Button variant="ghost" aria-label="Copy link" />}>C</TooltipTrigger>
      <TooltipPopup id={id}>Copy link</TooltipPopup>
    </TooltipRoot>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Copy link' })
/** Found by its text, so a test of the role does not also find the popup by that role. */
const popup = () => screen.queryByText('Copy link', { selector: '[data-placement]' })

describe('the open popup is a tooltip, and its trigger is described by it', () => {
  it('gives the open popup role tooltip, and the trigger an aria-describedby that names its id', async () => {
    render(<Copy />)
    await userEvent.tab()
    const id = popup()?.getAttribute('id') ?? ''
    expect(popup()?.getAttribute('role')).toBe('tooltip')
    expect(id).toMatch(/^_r_[0-9a-z]+_$/)
    expect(trigger().getAttribute('aria-describedby')).toBe(id)
    expect(screen.getByRole('tooltip').textContent).toBe('Copy link')
  })

  // Base UI's own ownership: a defaultOpen popup no trigger opened marks none with data-popup-open either.
  it('links nothing while closed, and drops the link once Escape closes it', async () => {
    render(<Copy />)
    expect(trigger().hasAttribute('aria-describedby')).toBe(false)
    await userEvent.tab()
    expect(trigger().hasAttribute('aria-describedby')).toBe(true)
    await userEvent.keyboard('{Escape}')
    expect(trigger().hasAttribute('aria-describedby')).toBe(false)
  })

  it("keeps a caller's popup id, and the trigger names that one", async () => {
    render(<Copy id="copy-tip" />)
    await userEvent.tab()
    expect(popup()?.getAttribute('id')).toBe('copy-tip')
    expect(trigger().getAttribute('aria-describedby')).toBe('copy-tip')
  })

  it('gives each root its own id, so two open tooltips never describe the other trigger', () => {
    render(
      <>
        <Copy open />
        <TooltipRoot open>
          <TooltipTrigger render={<Button aria-label="Paste" />}>P</TooltipTrigger>
          <TooltipPopup>Paste</TooltipPopup>
        </TooltipRoot>
      </>,
    )
    const paste = screen.getByText('Paste', { selector: '[data-placement]' })
    expect(paste.id).not.toBe(popup()?.id)
    expect(trigger().getAttribute('aria-describedby')).toBe(popup()?.id)
    expect(screen.getByRole('button', { name: 'Paste' }).getAttribute('aria-describedby')).toBe(paste.id)
  })

  it('hands the link to the function form of render and to the default button too', () => {
    render(
      <>
        <TooltipRoot open>
          <TooltipTrigger render={(props) => <button {...props} type="button" aria-label="Cut" />} />
          <TooltipPopup>Cut</TooltipPopup>
        </TooltipRoot>
        <TooltipRoot open>
          <TooltipTrigger aria-label="Undo">U</TooltipTrigger>
          <TooltipPopup>Undo</TooltipPopup>
        </TooltipRoot>
      </>,
    )
    for (const name of ['Cut', 'Undo']) {
      const tip = screen.getByText(name, { selector: '[role="tooltip"]' })
      expect(screen.getByRole('button', { name }).getAttribute('aria-describedby')).toBe(tip.id)
    }
    expect(screen.getByRole('button', { name: 'Undo' }).getAttribute('type')).toBe('button')
  })
})
