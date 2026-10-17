import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'
import { Command } from '../index.js'
import type { CommandProps } from '../types.js'

interface Entry { id: string, label: string }

/** Open from the start with nothing to list, so the empty text shows an action with a tooltip. */
function Ask(props: Partial<CommandProps<Entry>>) {
  return (
    <Command
      defaultOpen
      items={[] as Entry[]}
      getKey={(entry) => entry.id}
      getLabel={(entry) => entry.label}
      onSelect={() => undefined}
      emptyFallback={
        <TooltipRoot>
          <TooltipTrigger delay={0} render={<Button>Ask for one</Button>} />
          <TooltipPopup>Sends the query to the team</TooltipPopup>
        </TooltipRoot>
      }
      {...props}
    />
  )
}

const dialog = () => screen.queryByRole('dialog')
const tooltip = () => document.querySelector('[data-placement][data-open]')
// By its place: Base UI ends the text of the live region with a word joiner, which a text match trips on.
const ask = () => screen.getByRole('status').querySelector('button') as HTMLButtonElement

async function ready() {
  await screen.findByRole('dialog', {}, { timeout: 15_000 })
  await waitFor(() => { expect(document.activeElement?.getAttribute('role')).toBe('combobox') })
}

async function hover(element: HTMLElement) {
  await act(() => {
    fireEvent.mouseEnter(element)
    fireEvent.mouseMove(element)
    return Promise.resolve()
  })
  await waitFor(() => { expect(tooltip()?.textContent).toBe('Sends the query to the team') })
}

describe('one Escape closes one thing', () => {
  it('the input is a combobox whose list is always open, and still the first Escape there closes the palette', async () => {
    render(<Ask />)
    await ready()
    expect(screen.getByRole('combobox').hasAttribute('data-popup-open')).toBe(true)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(dialog()).toBeNull() })
  })

  // The second Escape is in e2e/command.spec.ts: happy-dom matches the :has() guard on the input alone.
  it('with a tooltip open inside, the first Escape closes the tooltip only, and the caller hears nothing', async () => {
    const onOpenChange = vi.fn()
    render(<Ask onOpenChange={onOpenChange} />)
    await ready()
    await hover(ask())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(tooltip()).toBeNull() })
    expect(dialog()?.hasAttribute('data-open')).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})
