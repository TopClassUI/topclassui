import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'
import type {
  DrawerBodyProps, DrawerCloseProps, DrawerDescriptionProps, DrawerFooterProps, DrawerHeaderProps, DrawerPopupProps,
  DrawerTitleProps, DrawerTriggerProps,
} from '../types.js'

interface Overrides {
  trigger?: Partial<DrawerTriggerProps>
  popup?: Partial<DrawerPopupProps>
  header?: Partial<DrawerHeaderProps>
  title?: Partial<DrawerTitleProps>
  description?: Partial<DrawerDescriptionProps>
  body?: Partial<DrawerBodyProps>
  footer?: Partial<DrawerFooterProps>
  close?: Partial<DrawerCloseProps>
  footerChildren?: ReactNode
}

/** A sheet open from the start, so the portal and every part in it are in the document. */
async function opened(overrides: Overrides = {}) {
  render(
    <DrawerRoot defaultOpen>
      <DrawerTrigger render={<Button>Filters</Button>} {...overrides.trigger} />
      <DrawerPopup {...overrides.popup}>
        <DrawerHeader {...overrides.header}>
          <DrawerTitle {...overrides.title}>Filter the list</DrawerTitle>
          <DrawerDescription {...overrides.description}>Narrow it down.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody {...overrides.body}>Status, owner and date.</DrawerBody>
        <DrawerFooter {...overrides.footer}>
          {overrides.footerChildren ?? <DrawerClose {...overrides.close} />}
        </DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>,
  )
  const popup = await screen.findByRole('dialog')
  const [header, body, footer] = popup.children
  return {
    popup, header, body, footer,
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

describe('className is passed last', () => {
  it('lets a consumer class replace the conflicting one on the popup, and keeps the rest', async () => {
    const list = classes((await opened({ popup: { className: 'max-w-sm bg-surface shadow-none border-s-0' } })).popup)
    expect(list).toContain('max-w-sm')
    expect(list).toContain('bg-surface')
    expect(list).toContain('shadow-none')
    expect(list).toContain('border-s-0')
    for (const own of ['max-w-80', 'bg-surface-raised', 'shadow-lg', 'border-s-(length:--tc-line-width)']) expect(list, own).not.toContain(own)
    expect(list).toContain('flex-col')
    expect(list).toContain('h-dvh')
  })

  it('lets a consumer turn the slide off, or swap it for one of its own', async () => {
    const list = classes((await opened({ popup: { className: 'transition-none' } })).popup)
    expect(list).toContain('transition-none')
    expect(list).not.toContain('transition-transform')
  })

  it('does the same on the header, the title, the description, the body and the footer', async () => {
    const parts = await opened({
      header: { className: 'ps-8' }, title: { className: 'text-lg' }, description: { className: 'text-xs' },
      body: { className: 'px-8 py-2' }, footer: { className: 'justify-start' },
    })
    expect(classes(parts.header)).toEqual([
      'border-b-(length:--tc-line-width)', 'border-line', 'pe-16', 'ps-8', 'py-4', 'shrink-0',
    ])
    expect(classes(parts.title)).toEqual(['font-semibold', 'text-body', 'text-lg'])
    expect(classes(parts.description)).toEqual(['text-muted', 'text-xs'])
    expect(classes(parts.body)).toContain('px-8')
    expect(classes(parts.body)).toContain('py-2')
    expect(classes(parts.body)).not.toContain('px-4')
    expect(classes(parts.body)).not.toContain('py-4')
    expect(classes(parts.footer)).toContain('justify-start')
    expect(classes(parts.footer)).not.toContain('justify-end')
  })

  it('keeps a consumer class that conflicts with nothing beside every class of the body', async () => {
    const list = classes((await opened({ body: { className: 'grid gap-3' } })).body)
    expect(list).toContain('grid')
    expect(list).toContain('gap-3')
    expect(list).toContain('overflow-y-auto')
    expect(list).toHaveLength(17)
  })

  it('lets a consumer class beat the x, on a bare DrawerClose', async () => {
    const list = classes((await opened({ close: { className: 'text-body rounded-box' } })).close)
    expect(list).toContain('text-body')
    expect(list).toContain('rounded-box')
    expect(list).not.toContain('text-muted')
    expect(list).not.toContain('rounded-control')
  })

  it('lets a trigger className beat the class of the Button it renders', async () => {
    await opened({ trigger: { className: 'bg-surface h-control-sm' } })
    const list = classes(screen.getByText('Filters', { selector: 'span' }).closest('button'))
    expect(list).toContain('bg-surface')
    expect(list).toContain('h-control-sm')
    expect(list).not.toContain('bg-primary-solid')
    expect(list).not.toContain('h-control-md')
  })

  it('lets a DrawerClose className beat the class of the Button it renders', async () => {
    const { close } = await opened({
      footerChildren: <DrawerClose className="h-control-sm" render={<Button variant="outline">Reset</Button>} />,
    })
    expect(classes(close)).toContain('h-control-sm')
    expect(classes(close)).not.toContain('h-control-md')
    expect(classes(close)).toContain('rounded-control')
  })

  it('puts a className on a DrawerClose with children exactly as given', async () => {
    const { close } = await opened({ footerChildren: <DrawerClose className="ms-2">Reset</DrawerClose> })
    expect(classes(close)).toEqual(['ms-2'])
  })
})

describe('style and the rest reach the element each part renders', () => {
  it('passes style through to the popup, beside the variables Base UI writes there for the swipe', async () => {
    const { popup } = await opened({ popup: { style: { opacity: 0.5 } } })
    const style = popup.style
    expect(style.opacity).toBe('0.5')
    expect(style.getPropertyValue('--drawer-swipe-movement-x')).toBe('0px')
    expect(style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px')
    expect(style.getPropertyValue('--nested-drawers')).toBe('0')
  })

  it('spreads the rest onto the popup, not the viewport or the scrim', async () => {
    const { popup, viewport, scrim } = await opened({ popup: { id: 'filters', lang: 'en', 'aria-label': 'Filters' } })
    expect(popup.getAttribute('id')).toBe('filters')
    expect(popup.getAttribute('lang')).toBe('en')
    expect(popup.getAttribute('aria-label')).toBe('Filters')
    expect(viewport?.hasAttribute('lang')).toBe(false)
    expect(scrim?.hasAttribute('lang')).toBe(false)
  })

  it('spreads the rest onto the header, the body and the footer', async () => {
    const parts = await opened({
      header: { id: 'head', style: { opacity: 0.5 } }, body: { id: 'body', tabIndex: 0 }, footer: { id: 'foot', role: 'group' },
    })
    expect(parts.header?.getAttribute('id')).toBe('head')
    expect(parts.header?.getAttribute('style')).toBe('opacity: 0.5;')
    expect(parts.body?.getAttribute('id')).toBe('body')
    expect(parts.body?.getAttribute('tabindex')).toBe('0')
    expect(parts.footer?.getAttribute('id')).toBe('foot')
    expect(parts.footer?.getAttribute('role')).toBe('group')
  })

  it('keeps the children of the popup between the grabber and the x: they are not spread onto it twice', async () => {
    const { popup, x } = await opened()
    expect(popup.querySelectorAll('h2')).toHaveLength(1)
    expect(popup.lastElementChild).toBe(x)
    expect(x?.tagName).toBe('BUTTON')
  })

  it('lets a caller relabel the placement and the size attributes, which are set before the rest like Button does', async () => {
    const { popup } = await opened({ popup: { 'data-size': 'wide', 'data-placement': 'docked' } as Partial<DrawerPopupProps> })
    expect(popup.getAttribute('data-size')).toBe('wide')
    expect(popup.getAttribute('data-placement')).toBe('docked')
  })

  it('spreads the rest onto a DrawerClose, bare or with content', async () => {
    const { close } = await opened({ close: { id: 'x', title: 'Close' } })
    expect(close?.getAttribute('id')).toBe('x')
    expect(close?.getAttribute('title')).toBe('Close')
  })
})
