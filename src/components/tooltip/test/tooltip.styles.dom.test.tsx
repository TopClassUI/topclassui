import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipPopupProps, TooltipTriggerProps } from '../types.js'

/** An open tooltip, so the portal, the positioner and the arrow are all in the document. */
function opened(popup: Partial<TooltipPopupProps> = {}, trigger: Partial<TooltipTriggerProps> = {}) {
  render(
    <TooltipRoot defaultOpen>
      <TooltipTrigger render={<Button aria-label="Copy link" />} {...trigger}>C</TooltipTrigger>
      <TooltipPopup {...popup}>Copy link</TooltipPopup>
    </TooltipRoot>,
  )
  const element = screen.getByText('Copy link', { selector: '[data-placement]' })
  return {
    popup: element,
    positioner: element.parentElement,
    arrow: element.lastElementChild,
    trigger: screen.getByRole('button', { name: 'Copy link' }),
  }
}

const classes = (element: Element | null | undefined) =>
  (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).sort()

describe('every element carries exactly the classes the spec names', () => {
  it('the popup: a dark chip of small text that wraps, and breaks a long word', () => {
    expect(classes(opened().popup)).toEqual([
      'bg-neutral-solid', 'max-w-xs', 'px-3', 'py-1', 'rounded-control', 'text-neutral-on-solid',
      'text-xs', 'wrap-anywhere',
    ])
  })

  it('the positioner: the popup layer, hidden while its trigger is scrolled away', () => {
    expect(classes(opened().positioner)).toEqual(['data-anchor-hidden:invisible', 'z-(--tc-z-popup)'])
  })

  it('the arrow: a rotated square on the edge that faces the trigger, for each of the four sides', () => {
    expect(classes(opened().arrow)).toEqual([
      'bg-neutral-solid',
      'data-[side=bottom]:-top-1',
      'data-[side=inline-end]:-inset-s-1',
      'data-[side=inline-start]:-inset-e-1',
      'data-[side=top]:-bottom-1',
      'rotate-45',
      'size-2',
    ])
  })

  it('the arrow is a div, the last child of the popup, after the text', () => {
    const { popup, arrow } = opened()
    expect(arrow?.tagName).toBe('DIV')
    expect(popup.childNodes[0]?.textContent).toBe('Copy link')
    expect(popup.childNodes.length).toBe(2)
  })

  it('the trigger adds nothing to the classes of the Button it renders', () => {
    const plain = render(<Button aria-label="Plain">C</Button>)
    const expected = classes(screen.getByRole('button', { name: 'Plain' }))
    plain.unmount()
    expect(expected.length).toBeGreaterThan(10)
    expect(classes(opened().trigger)).toEqual(expected)
  })
})

describe('className is passed last', () => {
  it('lets every conflicting consumer class replace its own on the popup', () => {
    const { popup } = opened({ className: 'max-w-sm rounded-box bg-surface px-4 py-2 text-sm text-body' })
    expect(classes(popup)).toEqual([
      'bg-surface', 'max-w-sm', 'px-4', 'py-2', 'rounded-box', 'text-body', 'text-sm', 'wrap-anywhere',
    ])
  })

  it('keeps a consumer class that conflicts with nothing on the popup, beside every one of its own', () => {
    expect(classes(opened({ className: 'ms-2' }).popup)).toEqual([
      'bg-neutral-solid', 'max-w-xs', 'ms-2', 'px-3', 'py-1', 'rounded-control', 'text-neutral-on-solid',
      'text-xs', 'wrap-anywhere',
    ])
  })

  it('lets a trigger className beat the class of the Button it renders', () => {
    const list = classes(opened({}, { className: 'bg-surface h-control-sm' }).trigger)
    expect(list).toContain('bg-surface')
    expect(list).toContain('h-control-sm')
    expect(list).not.toContain('bg-primary-solid')
    expect(list).not.toContain('h-control-md')
  })

  it('lets a trigger className beat a class written on the render element itself', () => {
    render(
      <TooltipRoot>
        <TooltipTrigger className="bg-danger-solid" render={<Button aria-label="Delete" className="bg-surface" />}>
          D
        </TooltipTrigger>
        <TooltipPopup>Delete</TooltipPopup>
      </TooltipRoot>,
    )
    const list = classes(screen.getByRole('button', { name: 'Delete' }))
    expect(list).toContain('bg-danger-solid')
    expect(list).not.toContain('bg-surface')
  })

  it('puts a bare trigger className on the button exactly as given', () => {
    render(
      <TooltipRoot>
        <TooltipTrigger aria-label="Copy link" className="ms-2">C</TooltipTrigger>
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    expect(classes(screen.getByRole('button', { name: 'Copy link' }))).toEqual(['ms-2'])
  })
})

describe('style and the rest reach the popup and the trigger', () => {
  it('passes style through to the popup', () => {
    expect(opened({ style: { opacity: 0.5 } }).popup.getAttribute('style')).toBe('opacity: 0.5;')
  })

  it('spreads the rest onto the popup, not the positioner', () => {
    render(
      <TooltipRoot defaultOpen>
        <TooltipTrigger render={<Button aria-label="Copy link" />}>C</TooltipTrigger>
        <TooltipPopup id="tip" data-testid="tip" lang="en">Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    const popup = screen.getByTestId('tip')
    expect(popup.textContent).toBe('Copy link')
    expect(popup.getAttribute('id')).toBe('tip')
    expect(popup.getAttribute('lang')).toBe('en')
    expect(popup.parentElement?.hasAttribute('data-testid')).toBe(false)
  })

  it('spreads the rest onto the trigger element', () => {
    render(
      <TooltipRoot>
        <TooltipTrigger render={<Button aria-label="Copy link" />} id="copy" data-testid="copy" title="Copy">
          C
        </TooltipTrigger>
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    const trigger = screen.getByTestId('copy')
    expect(trigger.getAttribute('id')).toBe('copy')
    expect(trigger.getAttribute('title')).toBe('Copy')
    expect(trigger.getAttribute('aria-label')).toBe('Copy link')
  })

  it('lets a caller relabel the placement attribute, which is set before the rest like Button does', () => {
    expect(opened({ 'data-placement': 'custom' } as Partial<TooltipPopupProps>).popup.getAttribute('data-placement'))
      .toBe('custom')
  })
})

describe('the text', () => {
  it('takes an interpolated run, which JSX passes as an array', () => {
    const count = 3
    render(
      <TooltipRoot defaultOpen>
        <TooltipTrigger render={<Button aria-label={`Delete ${String(count)} rows`} />}>D</TooltipTrigger>
        <TooltipPopup>Delete {count} rows</TooltipPopup>
      </TooltipRoot>,
    )
    expect(screen.getByText('Delete 3 rows', { selector: '[data-placement]' }).textContent).toBe('Delete 3 rows')
  })
})
