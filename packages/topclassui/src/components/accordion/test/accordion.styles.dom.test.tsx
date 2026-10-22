import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AccordionItem, AccordionRoot } from '../index.js'
import type { AccordionItemProps, AccordionRootProps } from '../types.js'

/** One open item, so every element an Accordion draws is in the document. */
function opened(root: Partial<AccordionRootProps> = {}, item: Partial<AccordionItemProps> = {}) {
  render(
    <AccordionRoot defaultValue={['one']} {...root}>
      <AccordionItem value="one" title="One" {...item}>Text</AccordionItem>
    </AccordionRoot>,
  )
  const trigger = screen.getByRole('button', { name: 'One' })
  const panel = trigger.parentElement?.nextElementSibling
  return {
    trigger,
    heading: trigger.parentElement,
    item: trigger.parentElement?.parentElement,
    root: trigger.parentElement?.parentElement?.parentElement,
    title: trigger.firstElementChild,
    caret: trigger.lastElementChild,
    panel,
    content: panel?.firstElementChild,
  }
}

const classes = (element: Element | null | undefined) =>
  (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).sort()

describe('every element carries exactly the classes the spec names', () => {
  it('the root: the raised box with a line, which clips, breaks a long word, is one grid column and dims as one when disabled', () => {
    expect(classes(opened().root)).toEqual([
      'bg-surface-raised', 'border-(length:--tc-line-width)', 'border-line', 'data-disabled:opacity-50',
      'forced-colors:data-disabled:opacity-100', 'grid', 'grid-cols-1', 'group/accordion', 'overflow-hidden',
      'rounded-box', 'text-body', 'wrap-anywhere',
    ])
  })

  it('the item: a line above it, and none above the first', () => {
    expect(classes(opened().item)).toEqual(['border-line', 'border-t-(length:--tc-line-width)', 'first:border-t-0'])
  })

  it('the heading: no class at all, so it is the size of the trigger it holds', () => {
    expect(opened().heading?.hasAttribute('class')).toBe(false)
  })

  it('the trigger: a full-width row with the ghost hover, the inset ring, the 24 and 44 px floors and the corner rules', () => {
    expect(classes(opened().trigger)).toEqual([
      '[:first-child>*>&]:rounded-t-box',
      '[:last-child>*>&]:not-data-panel-open:rounded-b-box',
      'active:bg-(--tc-soft-hover)',
      'aria-disabled:cursor-default',
      'cursor-pointer',
      'data-disabled:cursor-default',
      'data-disabled:pointer-events-none',
      'data-loading:cursor-default',
      'data-readonly:cursor-default',
      'disabled:cursor-default',
      'disabled:pointer-events-none',
      'duration-(--tc-duration)',
      'ease-out',
      'flex',
      'flex-wrap',
      'focus-visible:-outline-offset-(length:--tc-ring-width)',
      'focus-visible:outline-(length:--tc-ring-width)',
      'focus-visible:outline-ring',
      'focus-visible:outline-solid',
      'font-medium',
      'forced-colors:data-disabled:opacity-100',
      'forced-colors:data-disabled:text-[GrayText]',
      'gap-2.5',
      'group',
      'hover:bg-(--tc-soft)',
      'items-center',
      'min-h-[var(--tc-target-min,24px)]',
      'min-w-[var(--tc-target-min,24px)]',
      'not-forced-colors:not-group-data-disabled/accordion:data-disabled:opacity-50',
      'not-forced-colors:not-group-data-disabled/accordion:disabled:opacity-50',
      'outline-none',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
      'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      'px-3.5',
      'py-3',
      'text-body',
      'text-sm',
      'text-start',
      'tone-neutral',
      'transition-[color,background-color,border-color,outline-color,opacity,translate]',
      'w-full',
    ])
  })

  it('the trigger has no justify-between and no truncate: the title takes the room and wraps, and under six letters the caret wraps instead', () => {
    const { trigger, title } = opened()
    expect(classes(trigger)).not.toContain('justify-between')
    expect(classes(title)).toEqual(['basis-[6ch]', 'grow', 'min-w-0'])
    expect(classes(trigger)).toContain('flex-wrap')
  })

  it('the caret box: at the inline end on a line of its own too, muted, turned by the open trigger, and the grey of the system when that is disabled', () => {
    expect(classes(opened().caret)).toEqual([
      'duration-(--tc-duration)', 'flex', 'forced-colors:group-data-disabled:text-[GrayText]',
      'group-data-panel-open:rotate-180', 'ms-auto', 'shrink-0', 'text-muted', 'transition-[rotate]',
    ])
  })

  it('the svg carries no colour of its own: one set there would survive forced colours', () => {
    expect(classes(opened().caret?.firstElementChild)).toEqual(['inline-block', 'shrink-0'])
  })

  it('the panel: small muted text that fades, and no padding, so a closed one is 0 px tall', () => {
    expect(classes(opened().panel)).toEqual([
      'data-ending-style:opacity-0', 'data-starting-style:opacity-0', 'duration-(--tc-duration)', 'ease-out', 'text-muted',
      'text-sm', 'transition-opacity',
    ])
  })

  it('the region: the padding, 4 px above for a ring, a sideways scroll and the inset ring of a tab stop', () => {
    expect(classes(opened().content)).toEqual([
      '[:last-child>*>&]:rounded-b-box',
      '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]',
      '[scrollbar-width:thin]',
      'focus-visible:-outline-offset-(length:--tc-ring-width)',
      'focus-visible:outline-(length:--tc-ring-width)',
      'focus-visible:outline-ring',
      'focus-visible:outline-solid',
      'outline-none',
      'overflow-x-auto',
      'overscroll-x-contain',
      'pb-3.5',
      'pt-1',
      'px-3.5',
    ])
  })
})

describe('the state attributes are Base UI own', () => {
  it('an open trigger carries data-panel-open, which is what turns the caret', () => {
    const { trigger, panel } = opened()
    expect(trigger.hasAttribute('data-panel-open')).toBe(true)
    expect(panel?.hasAttribute('data-open')).toBe(true)
  })

  it('a closed one carries neither, and its panel says data-closed', () => {
    const { trigger, panel } = opened({ defaultValue: [] })
    expect(trigger.hasAttribute('data-panel-open')).toBe(false)
    expect(panel?.hasAttribute('data-closed')).toBe(true)
  })

  it('a disabled trigger carries data-disabled, which dims it and names its colour under forced colours', () => {
    expect(opened({}, { disabled: true }).trigger.hasAttribute('data-disabled')).toBe(true)
  })

  it('a disabled root carries data-disabled, which dims the box, and so do its items and their triggers', () => {
    const { root, item, trigger } = opened({ disabled: true })
    for (const element of [root, item, trigger]) expect(element?.hasAttribute('data-disabled')).toBe(true)
  })

  it('no part writes a data-state, a data-size or a data-variant: an accordion has no design value', () => {
    const { root, item, trigger, panel } = opened()
    for (const element of [root, item, trigger, panel]) {
      expect(element?.hasAttribute('data-state')).toBe(false)
      expect(element?.hasAttribute('data-size')).toBe(false)
      expect(element?.hasAttribute('data-variant')).toBe(false)
    }
  })
})

describe('className is passed last', () => {
  it('lets a consumer class replace the radius and the fill of the box, and keeps the rest', () => {
    expect(classes(opened({ className: 'rounded-control bg-surface' }).root)).toEqual([
      'bg-surface', 'border-(length:--tc-line-width)', 'border-line', 'data-disabled:opacity-50',
      'forced-colors:data-disabled:opacity-100', 'grid', 'grid-cols-1', 'group/accordion', 'overflow-hidden',
      'rounded-control', 'text-body', 'wrap-anywhere',
    ])
  })

  it('keeps a consumer class that conflicts with nothing on the item, beside every one of its own', () => {
    expect(classes(opened({}, { className: 'scroll-mt-20' }).item)).toEqual([
      'border-line', 'border-t-(length:--tc-line-width)', 'first:border-t-0', 'scroll-mt-20',
    ])
  })
})
