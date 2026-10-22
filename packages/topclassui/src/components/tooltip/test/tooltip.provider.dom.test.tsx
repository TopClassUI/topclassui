import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipProvider, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipProviderProps } from '../types.js'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

const wait = async (ms: number) => { await act(() => { vi.advanceTimersByTime(ms); return Promise.resolve() }) }

const hovered = () => screen.getByRole('button', { name: 'Copy link' })

/** The one a reader hovers, and a tooltip held open by open that mounts after it, as a docs stage does. */
function Page({ held }: { held: ReactNode }) {
  return (
    // TopClassProvider's group: one Tooltip.Provider around the app.
    <BaseTooltip.Provider>
      <TooltipRoot>
        <TooltipTrigger delay={0} render={<Button variant="ghost" aria-label="Copy link" />} />
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>
      {held}
    </BaseTooltip.Provider>
  )
}

const HELD = (
  <TooltipRoot open>
    <TooltipTrigger render={<Button variant="ghost" aria-label="Top" />} />
    <TooltipPopup>Top</TooltipPopup>
  </TooltipRoot>
)

async function hoverThenMount(held: ReactNode) {
  const { rerender } = render(<Page held={null} />)
  fireEvent.mouseEnter(hovered())
  await wait(1)
  expect(hovered().hasAttribute('data-popup-open'), 'open before the held one mounts').toBe(true)
  rerender(<Page held={held} />)
  await wait(1)
}

describe('TooltipProvider', () => {
  it('Base UI 1.8: a held-open tooltip mounting in the same group closes the hovered one', async () => {
    await hoverThenMount(HELD)
    expect(hovered().hasAttribute('data-popup-open')).toBe(false)
  })

  it('in a group of its own, the held-open tooltip leaves the hovered one open', async () => {
    await hoverThenMount(<TooltipProvider>{HELD}</TooltipProvider>)
    expect(hovered().hasAttribute('data-popup-open')).toBe(true)
    expect(screen.getByRole('button', { name: 'Top' }).hasAttribute('data-popup-open')).toBe(true)
  })

  it('clamps both delays into 0 to 10000 before Base UI sees them', () => {
    const forwarded = (props: TooltipProviderProps) => (TooltipProvider(props) as ReactElement<TooltipProviderProps>).props
    expect(forwarded({ delay: 20000, closeDelay: -5 })).toMatchObject({ delay: 10000, closeDelay: 0 })
    expect(forwarded({ delay: 250, closeDelay: 100 })).toMatchObject({ delay: 250, closeDelay: 100 })
  })

  it('forwards a delay left out as undefined, so Base UI keeps its 600', () => {
    const forwarded = (TooltipProvider({}) as ReactElement<TooltipProviderProps>).props
    expect(forwarded.delay).toBeUndefined()
    expect(forwarded.closeDelay).toBeUndefined()
  })
})
