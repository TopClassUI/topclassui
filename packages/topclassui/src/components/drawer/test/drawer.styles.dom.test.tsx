import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'
import type { DrawerPopupProps, DrawerRootProps } from '../types.js'

/** A sheet open from the start, so the portal and every part in it are in the document. */
async function opened(root: DrawerRootProps = {}, popupProps: Partial<DrawerPopupProps> = {}) {
  render(
    <DrawerRoot defaultOpen {...root}>
      <DrawerTrigger render={<Button>Filters</Button>} />
      <DrawerPopup {...popupProps}>
        <DrawerHeader>
          <DrawerTitle>Filter the list</DrawerTitle>
          <DrawerDescription>Narrow it down.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>Status, owner and date.</DrawerBody>
        <DrawerFooter><DrawerClose /></DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>,
  )
  const popup = await screen.findByRole('dialog')
  const grabber = popup.querySelector(':scope > [aria-hidden="true"]')
  const [header, body, footer] = [...popup.children].slice(grabber ? 1 : 0)
  return {
    popup, grabber, header, body, footer,
    viewport: popup.parentElement,
    scrim: popup.parentElement?.previousElementSibling,
    x: popup.lastElementChild,
    title: screen.getByRole('heading', { level: 2 }),
    description: screen.getByText('Narrow it down.'),
    close: footer?.querySelector('button'),
  }
}

const classes = (element: Element | null | undefined) =>
  (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).sort()

/** The ring the x wears, drawn outside its box. */
const RING = [
  'focus-visible:outline-(length:--tc-ring-width)', 'focus-visible:outline-offset-(length:--tc-ring-offset)',
  'focus-visible:outline-ring', 'focus-visible:outline-solid', 'outline-none',
]

/** The ring of the popup and of the body, drawn inside the box: outside it is off the screen, or clipped. */
const RING_INSET = [
  'focus-visible:-outline-offset-(length:--tc-ring-width)', 'focus-visible:outline-(length:--tc-ring-width)',
  'focus-visible:outline-ring', 'focus-visible:outline-solid', 'outline-none',
]

/** What the footer asks of the actions in it: wrap the label, grow from the height of the size, 44 px under a finger. */
const ACTION_WRAP = [
  '**:whitespace-normal', '*:[&:is(button,a)]:data-size:text-center',
  '*:[&:is(button,a)]:data-size:not-data-[size=custom]:h-auto', '*:[&:is(button,a)]:data-size:not-data-[size=custom]:py-1',
  '*:[&:is(button,a)]:data-[size=xs]:min-h-control-xs', '*:[&:is(button,a)]:data-[size=sm]:min-h-control-sm', '*:[&:is(button,a)]:data-[size=md]:min-h-control-md',
  '*:[&:is(button,a)]:data-[size=lg]:min-h-control-lg', '*:[&:is(button,a)]:data-[size=xl]:min-h-control-xl',
  'pointer-coarse:*:[&:is(button,a)]:data-[size=xs]:min-h-[var(--tc-target-coarse,44px)]',
  'pointer-coarse:*:[&:is(button,a)]:data-[size=sm]:min-h-[var(--tc-target-coarse,44px)]',
  'pointer-coarse:*:[&:is(button,a)]:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]',
]

/** The x, wherever it is: an icon button of at least 24 px, 44 under a coarse pointer, muted, with the ghost hover. */
const X = [
  ...RING,
  'active:bg-(--tc-soft-hover)', 'duration-(--tc-duration)', 'ease-out', 'hover:bg-(--tc-soft)', 'inline-flex',
  'items-center', 'justify-center', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
  'rounded-control', 'shrink-0', 'text-muted', 'tone-neutral',
  'transition-[color,background-color,border-color,outline-color,opacity,translate]',
]

describe('every element carries exactly the classes the spec names', () => {
  it('the scrim: the overlay fill over the whole screen, on the drawer layer, fading in and out', async () => {
    expect(classes((await opened()).scrim)).toEqual([
      'bg-overlay', 'data-ending-style:opacity-0', 'data-starting-style:opacity-0', 'duration-(--tc-duration)',
      'ease-out', 'fixed', 'inset-0', 'transition-opacity', 'z-(--tc-z-drawer)',
    ])
  })

  it('the viewport: the whole screen, a row on the drawer layer that seats the sheet at its end', async () => {
    expect(classes((await opened()).viewport)).toEqual(['fixed', 'flex', 'inset-0', 'justify-end', 'z-(--tc-z-drawer)'])
  })

  it('the header: a bar that never shrinks, with a line under it, 4rem short of the edge the x is on', async () => {
    expect(classes((await opened()).header)).toEqual([
      'border-b-(length:--tc-line-width)', 'border-line', 'pe-16', 'ps-4', 'py-3.5', 'shrink-0',
    ])
  })

  it('the title and the description', async () => {
    const { title, description } = await opened()
    expect(classes(title)).toEqual(['font-semibold', 'text-base', 'text-body'])
    expect(classes(description)).toEqual(['text-muted', 'text-sm'])
  })

  it('the body: the scroll container, at least one line tall, with its ring drawn inside its box', async () => {
    expect(classes((await opened()).body)).toEqual([
      ...RING_INSET,
      '[@media(height<17rem)]:flex-none', '[@media(height<17rem)]:overflow-y-visible', 'flex-1', 'min-h-13',
      'overflow-y-auto', 'overscroll-contain', 'px-4', 'py-4', 'scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]',
      'text-sm', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]', '[scrollbar-width:thin]',
    ].sort())
  })

  it('the footer: a row that never shrinks, its actions at the end, with a line over it', async () => {
    expect(classes((await opened()).footer)).toEqual([
      ...ACTION_WRAP,
      'border-line', 'border-t-(length:--tc-line-width)', 'flex', 'flex-wrap', 'gap-2', 'items-center', 'justify-end',
      'px-4', 'py-4', 'shrink-0',
    ].sort())
  })

  it('a bare DrawerClose: the x and nothing that places it', async () => {
    expect(classes((await opened()).close)).toEqual([...X].sort())
  })

  it('the trigger adds nothing to the classes of the Button it renders', async () => {
    const plain = render(<Button aria-label="Plain">C</Button>)
    const expected = classes(screen.getByRole('button', { name: 'Plain' }))
    plain.unmount()
    expect(expected.length).toBeGreaterThan(10)
    await opened()
    expect(classes(screen.getByText('Filters', { selector: 'span' }).closest('button'))).toEqual(expected)
  })
})
