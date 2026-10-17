import { render, screen } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import {
  DropdownGroup, DropdownGroupLabel, DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger,
} from '../index.js'
import type { DropdownPopupProps, DropdownTriggerProps } from '../types.js'

/** An open menu with whatever the popup is given. */
async function popup(children: ReactNode, props: DropdownPopupProps = {}) {
  const view = render(
    <DropdownRoot defaultOpen>
      <DropdownTrigger render={<Button>Actions</Button>} />
      <DropdownPopup {...props}>{children}</DropdownPopup>
    </DropdownRoot>,
  )
  return { ...view, element: await screen.findByRole('menu') }
}

const classes = (element: Element | null | undefined) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe('DropdownGroup, DropdownGroupLabel and DropdownSeparator', () => {
  const grouped = (
    <>
      <DropdownGroup id="sort" className="gap-1">
        <DropdownGroupLabel id="sort-label" className="text-sm">Sort by</DropdownGroupLabel>
        <DropdownItem>Name</DropdownItem>
      </DropdownGroup>
      <DropdownSeparator id="line" className="my-2" />
      <DropdownItem>Refresh</DropdownItem>
    </>
  )

  it('a group is named by the label inside it', async () => {
    await popup(grouped)
    const group = screen.getByRole('group', { name: 'Sort by' })
    expect(group.id).toBe('sort')
    expect(group.getAttribute('aria-labelledby')).toBe('sort-label')
    expect(group.querySelector('[role="menuitem"]')?.textContent).toBe('Name')
  })

  it('a label is no row: Base UI gives it no role and no tab stop, so the arrow keys pass it', async () => {
    await popup(grouped)
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Name', 'Refresh'])
    const label = document.getElementById('sort-label')
    expect(label?.textContent).toBe('Sort by')
    expect([label?.hasAttribute('role'), label?.hasAttribute('tabindex')]).toEqual([false, false])
  })

  it('a separator is a horizontal line a screen reader announces', async () => {
    await popup(grouped)
    const line = screen.getByRole('separator')
    expect(line.id).toBe('line')
    expect(line.getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('each wears its own classes and takes a className last', async () => {
    await popup(grouped)
    expect(classes(document.getElementById('sort'))).toEqual(['flex', 'shrink-0', 'flex-col', 'gap-1'])
    expect(classes(document.getElementById('sort-label'))).toEqual(['px-3', 'py-1.5', 'font-medium', 'text-muted', 'text-sm'])
    expect(classes(document.getElementById('line'))).toEqual(['shrink-0', 'border-t-(length:--tc-line-width)', 'border-line', 'my-2'])
  })
})

describe('DropdownPopup', () => {
  it('passes the rest of its props to the menu, and a className last', async () => {
    const { element } = await popup(<DropdownItem>Rename</DropdownItem>, { 'id': 'm', 'aria-label': 'Row actions', 'className': 'max-w-96 p-2' })
    expect(element.id).toBe('m')
    expect(element.getAttribute('aria-label')).toBe('Row actions')
    expect(classes(element)).toContain('max-w-96')
    expect(classes(element)).toContain('p-2')
    expect(classes(element)).not.toContain('p-1.5')
    expect(classes(element)).not.toContain('max-w-[min(calc(var(--spacing)*80),round(down,var(--available-width),1px))]')
  })

  it('wears the surface, the row cap, the scroll area, the width bounds and the inset ring', async () => {
    const list = classes((await popup(<DropdownItem>Rename</DropdownItem>)).element)
    for (const cls of [
      'flex', 'flex-col', 'gap-0.5', 'p-1.5', 'wrap-anywhere', 'overflow-y-auto', 'overscroll-contain', 'rounded-box', 'bg-surface-raised',
      'shadow-lg', 'max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)))]',
      'min-w-[min(calc(var(--spacing)*48),round(down,var(--available-width),1px))]', 'max-w-[min(calc(var(--spacing)*80),round(down,var(--available-width),1px))]',
      'origin-(--transform-origin)', 'focus-visible:-outline-offset-(length:--tc-ring-width)',
    ]) expect(list, cls).toContain(cls)
  })

  it('reports its placement as a design attribute: bottom-start unless given', async () => {
    const first = await popup(<DropdownItem>Rename</DropdownItem>)
    expect(first.element.getAttribute('data-placement')).toBe('bottom-start')
    first.unmount()
    expect((await popup(<DropdownItem>Rename</DropdownItem>, { placement: 'end-top' })).element.getAttribute('data-placement')).toBe('end-top')
  })

  it('the positioner around it is ours alone: the popup layer, hidden with its trigger, and none of the rest props', async () => {
    const { element } = await popup(<DropdownItem>Rename</DropdownItem>, { id: 'm' })
    expect(classes(element.parentElement)).toEqual(['z-(--tc-z-popup)', 'data-anchor-hidden:invisible'])
    expect(element.parentElement?.id).toBe('')
  })

  it('container mounts the menu inside the element it names, and keepMounted keeps a closed one in the document', async () => {
    const host = document.createElement('section')
    document.body.appendChild(host)
    const { element, unmount } = await popup(<DropdownItem>Rename</DropdownItem>, { container: host })
    expect(host.contains(element)).toBe(true)
    unmount()
    host.remove()
    render(
      <DropdownRoot>
        <DropdownTrigger render={<Button>Actions</Button>} />
        <DropdownPopup keepMounted><DropdownItem>Rename</DropdownItem></DropdownPopup>
      </DropdownRoot>,
    )
    expect(document.querySelector('[role="menu"]')?.textContent).toBe('Rename')
    expect(document.querySelector('[role="menu"]')?.parentElement?.hasAttribute('hidden')).toBe(true)
  })
})

describe('the two delays of DropdownTrigger', () => {
  /** What the trigger hands Base UI, read off the element it returns: no hover can see the floor. */
  const forwarded = (props: DropdownTriggerProps) => (DropdownTrigger(props) as ReactElement<DropdownTriggerProps>).props

  it('clamps a delay that is passed to 0 and 10000', () => {
    expect(forwarded({ delay: 20000, closeDelay: -5 })).toMatchObject({ delay: 10000, closeDelay: 0 })
    expect(forwarded({ delay: -1, closeDelay: 60000 })).toMatchObject({ delay: 0, closeDelay: 10000 })
  })

  it('passes a delay inside the range untouched', () => {
    expect(forwarded({ delay: 250, closeDelay: 120 })).toMatchObject({ delay: 250, closeDelay: 120 })
  })

  it('forwards a delay left out as undefined, so the 100 and 0 of Base UI apply', () => {
    const props = forwarded({})
    expect(props.delay).toBeUndefined()
    expect(props.closeDelay).toBeUndefined()
  })
})
