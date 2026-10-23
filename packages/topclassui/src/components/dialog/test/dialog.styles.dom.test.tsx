import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'
import type {
  DialogBodyProps, DialogCloseProps, DialogDescriptionProps, DialogFooterProps, DialogHeaderProps, DialogPopupProps,
  DialogTitleProps, DialogTriggerProps,
} from '../types.js'

interface Overrides {
  trigger?: Partial<DialogTriggerProps>
  popup?: Partial<DialogPopupProps>
  header?: Partial<DialogHeaderProps>
  title?: Partial<DialogTitleProps>
  description?: Partial<DialogDescriptionProps>
  body?: Partial<DialogBodyProps>
  footer?: Partial<DialogFooterProps>
  close?: Partial<DialogCloseProps>
  footerChildren?: ReactNode
}

/** A dialog open from the start, so the portal and every part in it are in the document. */
async function opened(overrides: Overrides = {}) {
  render(
    <DialogRoot defaultOpen>
      <DialogTrigger render={<Button>Publish</Button>} {...overrides.trigger} />
      <DialogPopup {...overrides.popup}>
        <DialogHeader {...overrides.header}>
          <DialogTitle {...overrides.title}>Publish changes</DialogTitle>
          <DialogDescription {...overrides.description}>Live right away.</DialogDescription>
        </DialogHeader>
        <DialogBody {...overrides.body}>11 files changed.</DialogBody>
        <DialogFooter {...overrides.footer}>
          {overrides.footerChildren ?? <DialogClose {...overrides.close} />}
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>,
  )
  const popup = await screen.findByRole('dialog')
  const [header, body, footer] = popup.children
  return {
    popup, header, body, footer,
    viewport: popup.parentElement,
    scrim: popup.parentElement?.previousElementSibling,
    heading: header?.children[0],
    x: header?.children[1],
    title: screen.getByRole('heading', { level: 2 }),
    description: screen.getByText('Live right away.'),
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

/** The ring of the popup and of the body, drawn inside the box: outside it lies on the scrim, or is clipped. */
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

describe('every element carries exactly the classes the spec names', () => {
  it('the scrim: the overlay fill over the whole screen, on the dialog layer, fading in and out', async () => {
    expect(classes((await opened()).scrim)).toEqual([
      'bg-overlay', 'data-ending-style:opacity-0', 'data-starting-style:opacity-0', 'duration-(--tc-duration)',
      'ease-out', 'fixed', 'inset-0', 'transition-opacity', 'z-(--tc-z-dialog)',
    ])
  })

  it('the viewport: the whole screen less the inset, centring the popup on the dialog layer', async () => {
    expect(classes((await opened()).viewport)).toEqual([
      '[container-type:size]', 'fixed', 'grid', 'inset-0', 'p-(--tc-overlay-inset)', 'place-items-center', 'z-(--tc-z-dialog)',
    ])
  })

  it('the popup: a column no taller than the screen, on the raised surface, 380 px at most', async () => {
    expect(classes((await opened()).popup)).toEqual([
      ...RING_INSET,
      'bg-surface-raised', 'border-(length:--tc-line-width)', 'border-line', 'group/dialog', 'data-ending-style:opacity-0',
      'data-ending-style:scale-95', 'data-starting-style:opacity-0', 'data-starting-style:scale-95',
      'duration-(--tc-duration)', 'ease-out', 'flex', 'flex-col', 'max-h-[calc(100dvh-2*var(--tc-overlay-inset))]',
      'max-w-95', 'origin-(--transform-origin)', 'overflow-y-auto', 'overscroll-contain', 'rounded-box',
      'scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]', 'shadow-(--tc-shadow-overlay)', 'text-body', 'transition-[opacity,scale]',
      'w-full', 'wrap-anywhere', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]', '[scrollbar-width:thin]',
    ].sort())
  })

  it('the header: a row that never shrinks, with a line under it while the body scrolls', async () => {
    expect(classes((await opened()).header)).toEqual([
      'border-b-(length:--tc-line-width)', 'border-transparent', 'flex', 'gap-3', 'group-has-data-scrolls/dialog:border-line',
      'items-start', 'px-4.5', 'py-3.5', 'shrink-0',
    ])
  })

  it('the column inside the header: the one that gives way, so a long title wraps beside the x', async () => {
    expect(classes((await opened()).heading)).toEqual(['flex-1', 'min-w-0'])
  })

  it('the title and the description', async () => {
    const { title, description } = await opened()
    expect(classes(title)).toEqual(['font-semibold', 'text-base', 'text-body'])
    expect(classes(description)).toEqual(['text-muted', 'text-sm'])
  })

  it('the body: the scroll container, at least one line tall, with its ring drawn inside its box', async () => {
    expect(classes((await opened()).body)).toEqual([
      ...RING_INSET,
      '[@container(height<15rem)]:overflow-y-visible', '[@container(height<15rem)]:shrink-0', 'flex-1', 'min-h-15',
      'overflow-y-auto', 'overscroll-contain', 'px-4.5', 'py-4.5', 'scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]',
      'text-muted', 'text-sm', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]', '[scrollbar-width:thin]',
    ].sort())
  })

  it('the footer: a row that never shrinks, its actions at the end, with a line over it while the body scrolls', async () => {
    expect(classes((await opened()).footer)).toEqual([
      ...ACTION_WRAP,
      'border-t-(length:--tc-line-width)', 'border-transparent', 'group-has-data-scrolls/dialog:border-line', 'flex', 'flex-wrap', 'gap-2', 'items-center', 'justify-end',
      'px-4.5', 'py-3.5', 'shrink-0',
    ].sort())
  })

  it('the x: an icon button of at least 24 px, 44 under a coarse pointer, muted, with the ghost hover', async () => {
    const expected = [
      ...RING,
      '-me-1.25', 'active:bg-(--tc-soft-hover)', 'duration-(--tc-duration)', 'ease-out', 'hover:bg-(--tc-soft)', 'inline-flex',
      'items-center', 'justify-center', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      'rounded-control', 'shrink-0', 'text-muted', 'tone-neutral',
      'transition-[color,background-color,border-color,outline-color,opacity,translate]',
      'cursor-pointer', 'disabled:cursor-not-allowed', 'aria-disabled:cursor-not-allowed', 'data-disabled:cursor-not-allowed', 'data-readonly:cursor-default', 'data-loading:cursor-default',
    ].sort()
    const { x, close } = await opened()
    expect(classes(x)).toEqual(expected)
    // A bare DialogClose anywhere is the same button.
    expect(classes(close)).toEqual(expected)
  })

  it('the trigger adds nothing to the classes of the Button it renders', async () => {
    const plain = render(<Button aria-label="Plain">C</Button>)
    const expected = classes(screen.getByRole('button', { name: 'Plain' }))
    plain.unmount()
    expect(expected.length).toBeGreaterThan(10)
    await opened()
    expect(classes(screen.getByText('Publish', { selector: 'span' }).closest('button'))).toEqual(expected)
  })
})

describe('the width follows the size', () => {
  const WIDTH = { xs: 'max-w-80', sm: 'max-w-90', md: 'max-w-95', lg: 'max-w-128', xl: 'max-w-160' } as const

  for (const [size, width] of Object.entries(WIDTH) as [keyof typeof WIDTH, string][]) {
    it(`${size} is ${width}`, async () => {
      expect(classes((await opened({ popup: { size } })).popup).filter((name) => name.startsWith('max-w-'))).toEqual([width])
    })
  }

  it('custom sets no width at all, and keeps every other class', async () => {
    const list = classes((await opened({ popup: { size: 'custom' } })).popup)
    expect(list.filter((name) => name.startsWith('max-w-'))).toEqual([])
    expect(list).toContain('w-full')
    expect(list).toContain('max-h-[calc(100dvh-2*var(--tc-overlay-inset))]')
  })

  it('custom takes its width from className', async () => {
    const list = classes((await opened({ popup: { size: 'custom', className: 'max-w-3xl' } })).popup)
    expect(list.filter((name) => name.startsWith('max-w-'))).toEqual(['max-w-3xl'])
  })
})
