import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipTriggerProps } from '../types.js'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

type Delays = Pick<TooltipTriggerProps, 'delay' | 'closeDelay'>

function Copy(props: Delays) {
  return (
    <TooltipRoot>
      <TooltipTrigger {...props} render={<Button variant="ghost" aria-label="Copy link" />}>C</TooltipTrigger>
      <TooltipPopup>Copy link</TooltipPopup>
    </TooltipRoot>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Copy link' })
/** Base UI marks the trigger while its popup is open, which outlasts no exit animation. */
const isOpen = () => trigger().hasAttribute('data-popup-open')

/** Base UI times the open delay from the pointer resting, which needs a move. */
function hover() {
  fireEvent.mouseEnter(trigger())
  fireEvent.mouseMove(trigger())
}

const wait = async (ms: number) => { await act(() => { vi.advanceTimersByTime(ms); return Promise.resolve() }) }

/** Opened at once, then left, so the next wait measures the close delay alone. */
async function openThenLeave(element: ReactNode) {
  render(element)
  hover()
  await wait(1)
  expect(isOpen(), 'opened before leaving').toBe(true)
  fireEvent.mouseLeave(trigger())
}

/** What the trigger hands Base UI, read off the element it returns: no hover can see the floor. */
const forwarded = (props: Delays) => (TooltipTrigger(props) as ReactElement<Delays>).props

describe('delay', () => {
  it('is clamped to ten seconds, so a delay of 20000 opens at 10000', async () => {
    render(<Copy delay={20000} />)
    hover()
    await wait(9999)
    expect(isOpen()).toBe(false)
    await wait(2)
    expect(isOpen()).toBe(true)
  })

  it('opens at once for 0', async () => {
    render(<Copy delay={0} />)
    hover()
    await wait(1)
    expect(isOpen()).toBe(true)
  })

  it('opens at once for a negative delay, as for 0', async () => {
    render(<Copy delay={-500} />)
    hover()
    await wait(1)
    expect(isOpen()).toBe(true)
  })

  it('opens at once for a NaN delay, as for 0', async () => {
    render(<Copy delay={Number.NaN} />)
    hover()
    await wait(1)
    expect(isOpen()).toBe(true)
  })

  it('keeps a delay inside the limits exactly as given', async () => {
    render(<Copy delay={250} />)
    hover()
    await wait(249)
    expect(isOpen()).toBe(false)
    await wait(2)
    expect(isOpen()).toBe(true)
  })

  it('left out, waits Base UI own 600 ms', async () => {
    render(<Copy />)
    hover()
    await wait(599)
    expect(isOpen()).toBe(false)
    await wait(2)
    expect(isOpen()).toBe(true)
  })

  it('left out, is not forwarded at all, so a provider delay reaches the trigger', async () => {
    render(<BaseTooltip.Provider delay={100}><Copy /></BaseTooltip.Provider>)
    hover()
    await wait(99)
    expect(isOpen()).toBe(false)
    await wait(2)
    expect(isOpen()).toBe(true)
  })

  it('given, beats a provider delay, because the trigger is the closer instruction', async () => {
    render(<BaseTooltip.Provider delay={100}><Copy delay={300} /></BaseTooltip.Provider>)
    hover()
    await wait(101)
    expect(isOpen()).toBe(false)
    await wait(200)
    expect(isOpen()).toBe(true)
  })
})

describe('closeDelay', () => {
  it('is clamped to ten seconds, so a closeDelay of 20000 closes at 10000', async () => {
    await openThenLeave(<Copy delay={0} closeDelay={20000} />)
    await wait(9999)
    expect(isOpen()).toBe(true)
    await wait(2)
    expect(isOpen()).toBe(false)
  })

  it('keeps a closeDelay inside the limits exactly as given', async () => {
    await openThenLeave(<Copy delay={0} closeDelay={300} />)
    await wait(299)
    expect(isOpen()).toBe(true)
    await wait(2)
    expect(isOpen()).toBe(false)
  })

  it('is clamped up to 0, so a negative closeDelay closes on leave with no timer at all', async () => {
    await openThenLeave(<Copy delay={0} closeDelay={-500} />)
    expect(isOpen()).toBe(false)
  })

  it('left out, closes on leave with Base UI own 0', async () => {
    await openThenLeave(<Copy delay={0} />)
    await wait(1)
    expect(isOpen()).toBe(false)
  })

  it('left out, is not forwarded at all, so a provider closeDelay reaches the trigger', async () => {
    await openThenLeave(<BaseTooltip.Provider closeDelay={400}><Copy delay={0} /></BaseTooltip.Provider>)
    await wait(399)
    expect(isOpen()).toBe(true)
    await wait(2)
    expect(isOpen()).toBe(false)
  })
})

describe('the floor of both clamps, read off the value the trigger forwards to Base UI', () => {
  it('forwards a negative delay as 0', () => {
    expect(forwarded({ delay: -500 }).delay).toBe(0)
  })

  it('forwards a NaN delay as 0', () => {
    expect(forwarded({ delay: Number.NaN }).delay).toBe(0)
  })

  it('forwards a negative closeDelay as 0', () => {
    expect(forwarded({ closeDelay: -500 }).closeDelay).toBe(0)
  })

  it('forwards a NaN closeDelay as 0', () => {
    expect(forwarded({ closeDelay: Number.NaN }).closeDelay).toBe(0)
  })
})
