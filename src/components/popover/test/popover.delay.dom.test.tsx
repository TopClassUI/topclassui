import { act, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverTriggerProps } from '../types.js'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

type Hover = Pick<PopoverTriggerProps, 'delay' | 'closeDelay' | 'openOnHover'>

function Billing({ openOnHover = true, ...delays }: Hover) {
  return (
    <PopoverRoot>
      <PopoverTrigger openOnHover={openOnHover} {...delays} render={<Button variant="ghost">Billing details</Button>} />
      <PopoverPopup>
        <PopoverTitle>How billing works</PopoverTitle>
        <PopoverDescription>Only the seats in use are billed.</PopoverDescription>
      </PopoverPopup>
    </PopoverRoot>
  )
}

const trigger = () => screen.getByRole('button', { name: 'Billing details' })
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
const forwarded = (props: Hover) => (PopoverTrigger(props) as ReactElement<Hover>).props

describe('delay, with openOnHover', () => {
  it('is clamped to ten seconds, so a delay of 20000 opens at 10000', async () => {
    render(<Billing delay={20000} />)
    hover()
    await wait(9999)
    expect(isOpen()).toBe(false)
    await wait(2)
    expect(isOpen()).toBe(true)
  })

  it('opens at once for 0', async () => {
    render(<Billing delay={0} />)
    hover()
    await wait(1)
    expect(isOpen()).toBe(true)
  })

  it('keeps a delay inside the limits exactly as given', async () => {
    render(<Billing delay={250} />)
    hover()
    await wait(249)
    expect(isOpen()).toBe(false)
    await wait(2)
    expect(isOpen()).toBe(true)
  })

  it('left out, waits the 300 ms of Base UI', async () => {
    render(<Billing />)
    hover()
    await wait(299)
    expect(isOpen()).toBe(false)
    await wait(2)
    expect(isOpen()).toBe(true)
  })
})

describe('closeDelay, with openOnHover', () => {
  it('is clamped to ten seconds, so a closeDelay of 20000 closes at 10000', async () => {
    await openThenLeave(<Billing delay={0} closeDelay={20000} />)
    await wait(9999)
    expect(isOpen()).toBe(true)
    await wait(2)
    expect(isOpen()).toBe(false)
  })

  it('keeps a closeDelay inside the limits exactly as given', async () => {
    await openThenLeave(<Billing delay={0} closeDelay={300} />)
    await wait(299)
    expect(isOpen()).toBe(true)
    await wait(2)
    expect(isOpen()).toBe(false)
  })

  it('left out, closes on leave with the 0 of Base UI', async () => {
    await openThenLeave(<Billing delay={0} />)
    await wait(1)
    expect(isOpen()).toBe(false)
  })
})

describe('without openOnHover the pointer opens nothing, whatever the delays', () => {
  it('a hover of a second leaves it shut', async () => {
    render(<Billing openOnHover={false} delay={0} />)
    hover()
    await wait(1000)
    expect(isOpen()).toBe(false)
  })
})

describe('what the trigger forwards to Base UI, read off the element it returns', () => {
  it('forwards a negative delay as 0, and a NaN one', () => {
    expect(forwarded({ delay: -500 }).delay).toBe(0)
    expect(forwarded({ delay: Number.NaN }).delay).toBe(0)
  })

  it('forwards a negative closeDelay as 0, and a NaN one', () => {
    expect(forwarded({ closeDelay: -500 }).closeDelay).toBe(0)
    expect(forwarded({ closeDelay: Number.NaN }).closeDelay).toBe(0)
  })

  it('forwards the top of the range and nothing above it', () => {
    expect(forwarded({ delay: 10000, closeDelay: 10000 })).toMatchObject({ delay: 10000, closeDelay: 10000 })
    expect(forwarded({ delay: 10001, closeDelay: 60000 })).toMatchObject({ delay: 10000, closeDelay: 10000 })
  })

  // Clamped only when passed: a default written here would hide a change of Base UI's own.
  it('forwards a delay left out as undefined, not as 300 or 0', () => {
    const props = forwarded({})
    expect(props.delay).toBeUndefined()
    expect(props.closeDelay).toBeUndefined()
    expect('delay' in props).toBe(true)
  })

  it('passes openOnHover through untouched', () => {
    expect(forwarded({ openOnHover: true }).openOnHover).toBe(true)
    expect(forwarded({}).openOnHover).toBeUndefined()
  })
})
