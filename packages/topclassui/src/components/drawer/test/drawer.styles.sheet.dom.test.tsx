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

/** What every sheet wears, at any edge: the surface, the transform Base UI's swipe moves, the slide, the last-resort scroll. */
const SHEET = [
  ...RING_INSET,
  'bg-surface-raised', 'data-swiping:select-none', 'duration-(--tc-duration-slow)', 'ease-out', 'flex', 'flex-col',
  'overflow-y-auto', 'overscroll-contain', 'relative', 'scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]',
  'shadow-lg', 'text-body', 'transform-[translate(var(--drawer-swipe-movement-x,0px),var(--drawer-swipe-movement-y,0px))]',
  'transition-transform', 'w-full', 'wrap-anywhere', 'border-line', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]', '[scrollbar-width:thin]',
]

/** The first row keeps the corner of the x clear: of a side or a top sheet, its first child. */
const CLEAR_FIRST = [
  '*:first:not-last:min-h-[calc(0.75rem+var(--tc-target-min,24px))]', '*:first:not-last:pe-16',
  'pointer-coarse:*:first:not-last:min-h-[calc(0.75rem+var(--tc-target-coarse,44px))]',
]

/** Of a bottom sheet, its second: the grabber is the first. */
const CLEAR_SECOND = [
  '*:nth-2:not-last:min-h-[calc(var(--tc-target-min,24px)-0.375rem)]', '*:nth-2:not-last:pe-16',
  'pointer-coarse:*:nth-2:not-last:min-h-[calc(var(--tc-target-coarse,44px)-0.375rem)]',
]

/** The x, wherever it is: an icon button of at least 24 px, 44 under a coarse pointer, muted, with the ghost hover. */
const X = [
  ...RING,
  'active:bg-(--tc-soft-hover)', 'duration-(--tc-duration)', 'ease-out', 'hover:bg-(--tc-soft)', 'inline-flex',
  'items-center', 'justify-center', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
  'rounded-control', 'shrink-0', 'text-muted', 'tone-neutral',
  'transition-[color,background-color,border-color,outline-color,opacity,translate]',  'cursor-pointer', 'disabled:cursor-default', 'aria-disabled:cursor-default', 'data-disabled:cursor-default', 'data-readonly:cursor-default', 'data-loading:cursor-default',
]

describe('the sheet at each edge', () => {
  it('end, the default: as tall as the screen, a line at its inline start, the safe areas of the top, the foot and the end, sliding in from the end', async () => {
    expect(classes((await opened()).popup)).toEqual([
      ...SHEET, ...CLEAR_FIRST,
      'border-s-(length:--tc-line-width)', 'h-dvh', 'max-w-80', 'pb-safe', 'pe-safe', 'pt-safe',
      'data-ending-style:transform-[translateX(calc(100%*var(--tc-dir)))]',
      'data-starting-style:transform-[translateX(calc(100%*var(--tc-dir)))]',
    ].sort())
  })

  it('start: the mirror: a line at its inline end, the safe area of the start, sliding in from the start', async () => {
    expect(classes((await opened({ placement: 'start' })).popup)).toEqual([
      ...SHEET, ...CLEAR_FIRST,
      'border-e-(length:--tc-line-width)', 'h-dvh', 'max-w-80', 'pb-safe', 'ps-safe', 'pt-safe',
      'data-ending-style:transform-[translateX(calc(-100%*var(--tc-dir)))]',
      'data-starting-style:transform-[translateX(calc(-100%*var(--tc-dir)))]',
    ].sort())
  })

  it('bottom: nine tenths of the screen at most, a line at its top, the safe areas of the foot and both sides, sliding up; no width of its own', async () => {
    expect(classes((await opened({ placement: 'bottom' })).popup)).toEqual([
      ...SHEET, ...CLEAR_SECOND,
      'border-t-(length:--tc-line-width)', 'max-h-[90dvh]', 'pb-safe', 'pe-safe', 'ps-safe',
      'data-ending-style:transform-[translateY(100%)]', 'data-starting-style:transform-[translateY(100%)]',
    ].sort())
  })

  it('top: nine tenths at most, a line at its foot, the safe areas of the top and both sides, sliding down', async () => {
    expect(classes((await opened({ placement: 'top' })).popup)).toEqual([
      ...SHEET, ...CLEAR_FIRST,
      'border-b-(length:--tc-line-width)', 'max-h-[90dvh]', 'pe-safe', 'ps-safe', 'pt-safe',
      'data-ending-style:transform-[translateY(-100%)]', 'data-starting-style:transform-[translateY(-100%)]',
    ].sort())
  })

  it('the viewport seats each at its own edge', async () => {
    const seat = async (placement: NonNullable<DrawerRootProps['placement']>) => {
      const view = render(<DrawerRoot defaultOpen placement={placement}><DrawerPopup aria-label={placement} /></DrawerRoot>)
      const found = classes((await screen.findByRole('dialog')).parentElement).filter((name) => /^(justify|items)-/.test(name))
      view.unmount()
      return found
    }
    expect(await seat('start')).toEqual(['justify-start'])
    expect(await seat('end')).toEqual(['justify-end'])
    expect(await seat('top')).toEqual(['items-start'])
    expect(await seat('bottom')).toEqual(['items-end'])
  })

  it('the grabber of a bottom sheet: a bar 36 by 4 px in the middle of its top, that keeps a line under forced colours', async () => {
    expect(classes((await opened({ placement: 'bottom' })).grabber)).toEqual([
      'bg-line-strong', 'forced-colors:outline-(length:--tc-line-width)', 'h-1', 'mb-1', 'mt-2.5', 'mx-auto',
      'rounded-full', 'shrink-0', 'w-9',
    ])
  })
})

describe('the x of the sheet adds its place to the x', () => {
  const placed = async (placement: NonNullable<DrawerRootProps['placement']>) => {
    const all = classes((await opened({ placement })).x)
    expect(all.filter((name) => !/^(absolute|top-|inset-e-)/.test(name)), 'the rest is the x').toEqual([...X].sort())
    return all.filter((name) => /^(absolute|top-|inset-e-)/.test(name))
  }

  it('end: absolute, 0.75rem and the safe area in from the top and from the end', async () => {
    expect(await placed('end')).toEqual(['absolute', 'inset-e-[calc(0.75rem+var(--tc-safe-end))]', 'top-[calc(0.75rem+var(--tc-safe-top))]'])
  })

  it('start: its inline end is in the middle of the screen, so no safe area is added there', async () => {
    expect(await placed('start')).toEqual(['absolute', 'inset-e-3', 'top-[calc(0.75rem+var(--tc-safe-top))]'])
  })

  it('top: as end', async () => {
    expect(await placed('top')).toEqual(['absolute', 'inset-e-[calc(0.75rem+var(--tc-safe-end))]', 'top-[calc(0.75rem+var(--tc-safe-top))]'])
  })

  it('bottom: its top is in the middle of the screen, so no safe area is added there', async () => {
    expect(await placed('bottom')).toEqual(['absolute', 'inset-e-[calc(0.75rem+var(--tc-safe-end))]', 'top-3'])
  })
})

describe('the width follows the size, on a side sheet only', () => {
  const WIDTH = { xs: 'max-w-64', sm: 'max-w-72', md: 'max-w-80', lg: 'max-w-96', xl: 'max-w-120' } as const
  const widths = (element: Element) => classes(element).filter((name) => name.startsWith('max-w-'))

  for (const placement of ['end', 'start'] as const) {
    for (const [size, width] of Object.entries(WIDTH) as [keyof typeof WIDTH, string][]) {
      it(`${placement}: ${size} is ${width}`, async () => {
        expect(widths((await opened({ size, placement })).popup)).toEqual([width])
      })
    }
  }

  it('custom sets no width at all, and keeps every other class', async () => {
    const { popup } = await opened({ size: 'custom' })
    expect(widths(popup)).toEqual([])
    expect(classes(popup)).toContain('w-full')
    expect(classes(popup)).toContain('h-dvh')
  })

  it('custom takes its width from the className of the popup', async () => {
    expect(widths((await opened({ size: 'custom' }, { className: 'max-w-xl' })).popup)).toEqual(['max-w-xl'])
  })

  for (const placement of ['top', 'bottom'] as const) {
    it(`a ${placement} sheet spans the screen whatever the size: xl gives it no width`, async () => {
      expect(widths((await opened({ placement, size: 'xl' })).popup)).toEqual([])
    })
  }
})
