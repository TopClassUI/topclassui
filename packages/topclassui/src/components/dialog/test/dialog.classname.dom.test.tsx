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

describe('className is passed last', () => {
  it('lets a consumer class replace the conflicting one on the popup, and keeps the rest', async () => {
    const list = classes((await opened({ popup: { className: 'max-w-sm bg-surface rounded-control shadow-none' } })).popup)
    expect(list).toContain('max-w-sm')
    expect(list).toContain('bg-surface')
    expect(list).toContain('rounded-control')
    expect(list).toContain('shadow-none')
    for (const own of ['max-w-95', 'bg-surface-raised', 'rounded-box', 'shadow-(--tc-shadow-overlay)']) expect(list, own).not.toContain(own)
    expect(list).toContain('flex-col')
  })

  it('does the same on the header, the title, the description, the body and the footer', async () => {
    const parts = await opened({
      header: { className: 'px-8' }, title: { className: 'text-lg' }, description: { className: 'text-xs' },
      body: { className: 'px-8 py-2' }, footer: { className: 'justify-start' },
    })
    expect(classes(parts.header)).toEqual([
      'border-b-(length:--tc-line-width)', 'border-transparent', 'flex', 'gap-3', 'group-has-data-scrolls/dialog:border-line',
      'items-start', 'px-8', 'py-3.5', 'shrink-0',
    ])
    expect(classes(parts.title)).toEqual(['font-semibold', 'text-body', 'text-lg'])
    expect(classes(parts.description)).toEqual(['text-muted', 'text-xs'])
    expect(classes(parts.body)).toContain('px-8')
    expect(classes(parts.body)).toContain('py-2')
    expect(classes(parts.body)).not.toContain('px-4.5')
    expect(classes(parts.body)).not.toContain('py-4.5')
    expect(classes(parts.footer)).toContain('justify-start')
    expect(classes(parts.footer)).not.toContain('justify-end')
  })

  it('keeps a consumer class that conflicts with nothing beside every class of the body', async () => {
    const list = classes((await opened({ body: { className: 'grid gap-3' } })).body)
    expect(list).toContain('grid')
    expect(list).toContain('gap-3')
    expect(list).toContain('overflow-y-auto')
    expect(list).toHaveLength(20)
  })

  it('lets a consumer class beat the x, on a bare DialogClose', async () => {
    const list = classes((await opened({ close: { className: 'text-body rounded-box' } })).close)
    expect(list).toContain('text-body')
    expect(list).toContain('rounded-box')
    expect(list).not.toContain('text-muted')
    expect(list).not.toContain('rounded-control')
  })

  it('lets a trigger className beat the class of the Button it renders', async () => {
    await opened({ trigger: { className: 'bg-surface h-control-sm' } })
    const list = classes(screen.getByText('Publish', { selector: 'span' }).closest('button'))
    expect(list).toContain('bg-surface')
    expect(list).toContain('h-control-sm')
    expect(list).not.toContain('bg-primary-solid')
    expect(list).not.toContain('h-control-md')
  })

  it('lets a DialogClose className beat the class of the Button it renders', async () => {
    const { close } = await opened({
      footerChildren: <DialogClose className="h-control-sm" render={<Button variant="outline">Cancel</Button>} />,
    })
    expect(classes(close)).toContain('h-control-sm')
    expect(classes(close)).not.toContain('h-control-md')
    expect(classes(close)).toContain('rounded-control')
  })

  it('puts a className on a DialogClose with children exactly as given', async () => {
    const { close } = await opened({ footerChildren: <DialogClose className="ms-2">Cancel</DialogClose> })
    expect(classes(close)).toEqual(['ms-2'])
  })
})

describe('style and the rest reach the element each part renders', () => {
  it('passes style through to the popup, beside the variable Base UI writes there', async () => {
    const { popup } = await opened({ popup: { style: { opacity: 0.5 } } })
    expect(popup.getAttribute('style')).toBe('--nested-dialogs: 0; opacity: 0.5;')
  })

  it('spreads the rest onto the popup, not the viewport or the scrim', async () => {
    const { popup, viewport, scrim } = await opened({ popup: { id: 'publish', lang: 'en', 'aria-label': 'Publish' } })
    expect(popup.getAttribute('id')).toBe('publish')
    expect(popup.getAttribute('lang')).toBe('en')
    expect(popup.getAttribute('aria-label')).toBe('Publish')
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

  it('never forwards closeButton or size onto an element', async () => {
    const { popup, header } = await opened({ popup: { size: 'lg' }, header: { closeButton: false } })
    expect(popup.hasAttribute('size')).toBe(false)
    expect(header?.hasAttribute('closebutton')).toBe(false)
    expect(header?.outerHTML).not.toMatch(/closeButton|closebutton/)
  })

  it('lets a caller relabel the size attribute, which is set before the rest like Button does', async () => {
    const { popup } = await opened({ popup: { 'data-size': 'wide' } as Partial<DialogPopupProps> })
    expect(popup.getAttribute('data-size')).toBe('wide')
  })

  it('spreads the rest onto the x and onto a DialogClose with content', async () => {
    const { close } = await opened({ close: { id: 'x', title: 'Close' } })
    expect(close?.getAttribute('id')).toBe('x')
    expect(close?.getAttribute('title')).toBe('Close')
  })
})
