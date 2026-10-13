import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { DrawerBody, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle } from '../index.js'
import type { DrawerRootProps } from '../types.js'

/** An open sheet with one field in its body. */
const sheet = (root: DrawerRootProps = {}) => (
  <DrawerRoot defaultOpen {...root}>
    <DrawerPopup>
      <DrawerHeader><DrawerTitle>Invite</DrawerTitle></DrawerHeader>
      <DrawerBody><input aria-label="Name" name="name" /></DrawerBody>
    </DrawerPopup>
  </DrawerRoot>
)

const rtl = (children: ReactNode) => <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
const ltr = (children: ReactNode) => <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>

/** The physical swipe Base UI was handed, which it reports on the popup. */
async function swipeOf(tree: ReactNode) {
  render(tree)
  return (await screen.findByRole('dialog')).getAttribute('data-swipe-direction')
}

// Which way a finger really has to go is measured in e2e/drawer.spec.ts; here, what Base UI is told.
describe('the root hands Base UI the swipe that leaves by the sheet own edge', () => {
  it('ltr: end closes by a swipe right, the default placement', async () => {
    expect(await swipeOf(ltr(sheet()))).toBe('right')
  })

  it('rtl: end closes by a swipe left', async () => {
    expect(await swipeOf(rtl(sheet()))).toBe('left')
  })

  it('ltr: start closes by a swipe left', async () => {
    expect(await swipeOf(ltr(sheet({ placement: 'start' })))).toBe('left')
  })

  it('rtl: start closes by a swipe right', async () => {
    expect(await swipeOf(rtl(sheet({ placement: 'start' })))).toBe('right')
  })

  for (const [wrap, direction] of [[ltr, 'ltr'], [rtl, 'rtl']] as const) {
    it(`${direction}: top closes by a swipe up`, async () => {
      expect(await swipeOf(wrap(sheet({ placement: 'top' })))).toBe('up')
    })

    it(`${direction}: bottom closes by a swipe down`, async () => {
      expect(await swipeOf(wrap(sheet({ placement: 'bottom' })))).toBe('down')
    })
  }

  it('follows the nearest provider: an RTL island on an LTR page swipes as RTL does', async () => {
    expect(await swipeOf(ltr(rtl(sheet())))).toBe('left')
  })

  it('and an LTR island on an RTL page swipes as LTR does', async () => {
    expect(await swipeOf(rtl(ltr(sheet({ placement: 'start' }))))).toBe('left')
  })

  // The direction is the provider's and never read from the DOM (R-13-1), so with none it is left to right.
  it('with no provider at all it is the left-to-right swipe, even inside an element that says rtl', async () => {
    expect(await swipeOf(<div dir="rtl">{sheet()}</div>)).toBe('right')
  })

  it('never takes a swipeDirection from the caller: the placement decides', async () => {
    const forced = { swipeDirection: 'up' } as DrawerRootProps
    expect(await swipeOf(ltr(sheet({ ...forced, placement: 'bottom' })))).toBe('down')
  })
})

/** The clicks a field receives when a finger taps it: happy-dom makes none of its own from a touch. */
async function tapField(tree: ReactNode) {
  render(tree)
  const popup = await screen.findByRole('dialog')
  const field = popup.querySelector('input') as HTMLInputElement
  let clicks = 0
  field.addEventListener('click', () => { clicks += 1 })
  const touch = { clientX: 20, clientY: 20, target: field }
  fireEvent.touchStart(field, { touches: [touch], changedTouches: [touch] })
  fireEvent.touchEnd(field, { touches: [], changedTouches: [touch] })
  return { clicks, focused: document.activeElement === field }
}

// Base UI's viewport reads the provider: around the children of the popup alone, the viewport never hears of it.
describe('a bottom sheet is wrapped in Base UI’s keyboard provider, around its viewport', () => {
  it('a tap on a field of a bottom sheet is taken by the provider, which focuses the field and clicks it itself', async () => {
    expect(await tapField(sheet({ placement: 'bottom' }))).toEqual({ clicks: 1, focused: true })
  })

  for (const placement of ['start', 'end', 'top'] as const) {
    it(`a ${placement} sheet has no provider: the tap is left to the browser`, async () => {
      expect(await tapField(sheet({ placement }))).toEqual({ clicks: 0, focused: false })
    })
  }
})
