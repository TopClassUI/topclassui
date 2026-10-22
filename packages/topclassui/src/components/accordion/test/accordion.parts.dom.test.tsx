import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AccordionItem, AccordionRoot } from '../index.js'

const trigger = (name = 'One') => screen.getByRole('button', { name })
const itemOf = (name = 'One') => trigger(name).parentElement?.parentElement as HTMLElement
const panelOf = (name = 'One') => trigger(name).parentElement?.nextElementSibling as HTMLElement
const rootOf = (name = 'One') => itemOf(name).parentElement as HTMLElement

describe('what each part passes on (R-5.7-3)', () => {
  it('AccordionRoot merges className last, and passes style, ref and the rest to its div', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <AccordionRoot ref={ref} id="faq" data-section="help" aria-label="Help" style={{ maxWidth: 420 }} className="rounded-none p-2">
        <AccordionItem value="one" title="One">Text</AccordionItem>
      </AccordionRoot>,
    )
    const root = rootOf()
    expect(ref.current).toBe(root)
    expect(root.id).toBe('faq')
    expect(root.getAttribute('data-section')).toBe('help')
    expect(root.getAttribute('aria-label')).toBe('Help')
    expect(root.style.maxWidth).toBe('420px')
    // rounded-none replaced the radius of the box: the consumer's class won the conflict.
    expect(root.className.split(' ').sort()).toEqual([
      'bg-surface-raised', 'border-(length:--tc-line-width)', 'border-line', 'data-disabled:opacity-50',
      'forced-colors:data-disabled:opacity-100', 'grid', 'grid-cols-1', 'group/accordion', 'overflow-hidden',
      'p-2', 'rounded-none', 'text-body', 'wrap-anywhere',
    ])
  })

  it('AccordionItem merges className last, and passes style, ref and the rest to the item, not the trigger', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <AccordionRoot>
        <AccordionItem ref={ref} value="one" title="One" id="first" data-kind="faq" style={{ scrollMarginTop: 80 }} className="border-t-0 bg-surface">
          Text
        </AccordionItem>
      </AccordionRoot>,
    )
    const item = itemOf()
    expect(ref.current).toBe(item)
    expect(item.id).toBe('first')
    expect(item.getAttribute('data-kind')).toBe('faq')
    expect(item.style.scrollMarginTop).toBe('80px')
    expect(item.className).toBe('border-line first:border-t-0 border-t-0 bg-surface')
    expect(trigger().id).not.toBe('first')
    expect(trigger().hasAttribute('data-kind')).toBe(false)
  })

  it('the item value never reaches the page as an attribute of the item', () => {
    render(
      <AccordionRoot>
        <AccordionItem value="one" title="One">Text</AccordionItem>
      </AccordionRoot>,
    )
    expect(itemOf().hasAttribute('value')).toBe(false)
    expect(itemOf().hasAttribute('title')).toBe(false)
  })

  it('onOpenChange on an item hears its own open and close', async () => {
    const onOpenChange = vi.fn()
    render(
      <AccordionRoot>
        <AccordionItem value="one" title="One" onOpenChange={onOpenChange}>Text</AccordionItem>
        <AccordionItem value="two" title="Two">Text</AccordionItem>
      </AccordionRoot>,
    )
    await userEvent.click(trigger('One'))
    await userEvent.click(trigger('One'))
    expect(onOpenChange.mock.calls.map((call) => call[0] as boolean)).toEqual([true, false])
  })
})

describe('the region and its name', () => {
  it('the trigger carries an id from useId, and the region inside the panel is named by it', () => {
    render(
      <AccordionRoot defaultValue={['one']}>
        <AccordionItem value="one" title="One">First</AccordionItem>
        <AccordionItem value="two" title="Two">Second</AccordionItem>
      </AccordionRoot>,
    )
    const region = screen.getByRole('region', { name: 'One' })
    expect(region).toBe(panelOf('One').firstElementChild)
    expect(region.getAttribute('aria-labelledby')).toBe(trigger('One').id)
    expect(trigger('One').id).not.toBe(trigger('Two').id)
    expect(trigger('One').id).not.toBe('')
  })

  it('a panel has no role and no name of its own, open or closed', () => {
    render(
      <AccordionRoot defaultValue={['one']}>
        <AccordionItem value="one" title="One">First</AccordionItem>
        <AccordionItem value="two" title="Two">Second</AccordionItem>
      </AccordionRoot>,
    )
    for (const name of ['One', 'Two']) {
      expect(panelOf(name).hasAttribute('role'), name).toBe(false)
      expect(panelOf(name).hasAttribute('aria-labelledby'), name).toBe(false)
    }
  })

  it('a closed panel is hidden until found, which is what lets the browser search it', () => {
    render(
      <AccordionRoot>
        <AccordionItem value="one" title="One">First</AccordionItem>
      </AccordionRoot>,
    )
    expect(panelOf().getAttribute('hidden')).toBe('until-found')
  })

  it('the region is no tab stop while nothing in it scrolls', () => {
    render(
      <AccordionRoot defaultValue={['one']}>
        <AccordionItem value="one" title="One">First</AccordionItem>
      </AccordionRoot>,
    )
    expect(screen.getByRole('region', { name: 'One' }).hasAttribute('tabindex')).toBe(false)
  })
})
