import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { DropdownItem, DropdownLinkItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'
import type { DropdownPopupProps } from '../types.js'

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
const row = (name: string) => screen.getByRole('menuitem', { name })
const icon = <svg aria-hidden="true" data-icon="" />

describe('DropdownItem', () => {
  it('is a div with the menuitem role, and holds the icon, the label and the shortcut in that order', async () => {
    await popup(<DropdownItem icon={icon} shortcut="Ctrl P">Profile</DropdownItem>)
    const item = screen.getByRole('menuitem')
    expect(item.tagName).toBe('DIV')
    expect([...item.children].map((child) => `${child.tagName} ${child.textContent}`)).toEqual(['SPAN ', 'SPAN Profile', 'SPAN Ctrl P'])
    expect(item.children[0]?.firstElementChild?.hasAttribute('data-icon')).toBe(true)
  })

  it('hides the icon from a screen reader: the label is the name, and the shortcut is read after it', async () => {
    await popup(<DropdownItem icon={icon} shortcut="Ctrl P">Profile</DropdownItem>)
    expect(screen.getByRole('menuitem').children[0]?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('menuitem').children[2]?.hasAttribute('aria-hidden')).toBe(false)
  })

  it('puts the label in the span that truncates it, and neither icon nor shortcut when none is given', async () => {
    await popup(<DropdownItem>Profile</DropdownItem>)
    expect(row('Profile').innerHTML).toBe('<span class="truncate min-w-0">Profile</span>')
  })

  it('cuts a label at 100 characters, the bound of boundaries.ts', async () => {
    await popup(<DropdownItem>{'a'.repeat(300)}</DropdownItem>)
    expect(screen.getByRole('menuitem').querySelector('span')?.textContent).toBe('a'.repeat(100))
  })

  it('keeps the shortcut whole beside a long label: it never shrinks, and is cut only past its own cap', async () => {
    await popup(<DropdownItem shortcut="Ctrl P">Profile</DropdownItem>)
    const list = classes(row('Profile Ctrl P').children[1])
    for (const cls of ['ms-auto', 'shrink-0', 'truncate', 'ps-4', 'font-mono', 'text-xs', 'text-muted', 'group-data-highlighted:text-inherit']) {
      expect(list, cls).toContain(cls)
    }
    expect(list).toContain('max-w-[min(calc(var(--spacing)*40),calc(var(--available-width)/2))]')
  })

  it('wears the shared row and its highlight, is 44 px under a finger, and never shrinks', async () => {
    await popup(<DropdownItem>Profile</DropdownItem>)
    const list = classes(row('Profile'))
    for (const cls of [
      'flex', 'min-h-(--tc-row-height)', 'w-full', 'items-center', 'gap-2', 'rounded-control', 'px-3', 'text-sm', 'outline-none',
      'data-highlighted:bg-primary-soft', 'data-highlighted:text-primary-on-soft', 'forced-colors:data-highlighted:bg-[Highlight]',
      'max-w-full', 'group', 'shrink-0', 'cursor-default', 'select-none', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
    ]) expect(list, cls).toContain(cls)
  })

  it('tone is neutral unless given, and is written as a design attribute', async () => {
    await popup(<><DropdownItem>Rename</DropdownItem><DropdownItem tone="danger">Delete</DropdownItem></>)
    expect(row('Rename').getAttribute('data-tone')).toBe('neutral')
    expect(row('Delete').getAttribute('data-tone')).toBe('danger')
  })

  it('danger colours the row and its highlight, and the primary highlight leaves: one fill, not two', async () => {
    await popup(<><DropdownItem>Rename</DropdownItem><DropdownItem tone="danger">Delete</DropdownItem></>)
    const danger = classes(row('Delete'))
    expect(danger).toContain('text-danger-on-soft')
    expect(danger).toContain('data-highlighted:bg-danger-soft')
    expect(danger).toContain('data-highlighted:text-danger-on-soft')
    expect(danger).not.toContain('data-highlighted:bg-primary-soft')
    expect(danger).not.toContain('data-highlighted:text-primary-on-soft')
    // Forced colours repaint a danger row as they do any other.
    expect(danger).toContain('forced-colors:data-highlighted:bg-[Highlight]')
    expect(classes(row('Rename'))).not.toContain('text-danger-on-soft')
  })

  it('a disabled row dims what it holds and not itself, so its highlight keeps its strength', async () => {
    await popup(<DropdownItem disabled>Rename</DropdownItem>)
    const list = classes(row('Rename'))
    expect(row('Rename').getAttribute('aria-disabled')).toBe('true')
    expect(list).toContain('data-disabled:*:opacity-50')
    expect(list).toContain('data-disabled:pointer-events-none')
    expect(list).not.toContain('data-disabled:opacity-50')
    expect(list).toContain('forced-colors:data-disabled:not-data-highlighted:text-[GrayText]')
  })

  it('takes a className last, a style, a ref, an id and a data attribute', async () => {
    const ref = { current: null as HTMLDivElement | null }
    await popup(
      <DropdownItem ref={ref} id="rename" className="px-6 text-base" data-testid="r" style={{ '--tc-radius': '0px' }}>Rename</DropdownItem>,
    )
    const item = row('Rename')
    expect(ref.current).toBe(item)
    expect(item.id).toBe('rename')
    expect(item.getAttribute('data-testid')).toBe('r')
    expect(item.style.getPropertyValue('--tc-radius')).toBe('0px')
    expect(classes(item)).toContain('px-6')
    expect(classes(item)).not.toContain('px-3')
    expect(classes(item)).not.toContain('text-sm')
  })

  it('a row with an icon alone is named by its aria-label', async () => {
    await popup(<DropdownItem icon={icon} aria-label="Settings" />)
    expect(row('Settings').children).toHaveLength(1)
  })

  it('an element where text is expected passes through as it is, with no span of ours around it', async () => {
    await popup(<DropdownItem><em>Emphasis</em></DropdownItem>)
    expect(row('Emphasis').innerHTML).toBe('<em>Emphasis</em>')
  })
})

describe('DropdownLinkItem', () => {
  it('is a real anchor with its href and the menuitem role, and looks like any row', async () => {
    await popup(<DropdownLinkItem href="/docs" icon={icon} shortcut="F1">Documentation</DropdownLinkItem>)
    const link = row('Documentation F1')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/docs')
    expect([...link.children].map((child) => child.textContent)).toEqual(['', 'Documentation', 'F1'])
    expect(classes(link)).toContain('min-h-(--tc-row-height)')
    expect(classes(link)).toContain('data-highlighted:bg-primary-soft')
  })

  it('passes target and rel to the anchor, and takes a tone', async () => {
    await popup(<DropdownLinkItem href="https://example.com" target="_blank" rel="noreferrer" tone="danger">Status</DropdownLinkItem>)
    expect(row('Status').getAttribute('target')).toBe('_blank')
    expect(row('Status').getAttribute('rel')).toBe('noreferrer')
    expect(row('Status').getAttribute('data-tone')).toBe('danger')
  })

  it('closes the menu on a press, which Base UI alone would leave open', async () => {
    await popup(<DropdownLinkItem href="#docs">Documentation</DropdownLinkItem>)
    await userEvent.click(row('Documentation'))
    expect(screen.getByRole('button', { name: 'Actions' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('stays open after a press with closeOnClick={false}', async () => {
    await popup(<DropdownLinkItem href="#docs" closeOnClick={false}>Documentation</DropdownLinkItem>)
    await userEvent.click(row('Documentation'))
    expect(screen.getByRole('button', { name: 'Actions' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('renders the element of render, with the href written on that element, and keeps the row inside it', async () => {
    await popup(<DropdownLinkItem render={<a data-link="app" href="/support" />}>Contact support</DropdownLinkItem>)
    const link = row('Contact support')
    expect(link.getAttribute('data-link')).toBe('app')
    expect(link.getAttribute('href')).toBe('/support')
    expect(link.innerHTML).toBe('<span class="truncate min-w-0">Contact support</span>')
  })
})
