import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

describe('what the demos show of the props', () => {
  /** Opens the sheet of one trigger of a demo: the first, or the one with that label. */
  const openFirst = async (name: string, trigger?: string) => {
    const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
    render(<loaded.default />)
    await userEvent.click(trigger === undefined ? screen.getAllByRole('button')[0] as HTMLElement : screen.getByRole('button', { name: trigger }))
    return screen.findByRole('dialog')
  }

  it('end: a press on the scrim closes it', async () => {
    const popup = await openFirst('end')
    await userEvent.click(popup.parentElement?.previousElementSibling as Element)
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
  })

  it('end: placement is not written, and the sheet stands at the inline end', async () => {
    const popup = await openFirst('end')
    expect(popup.getAttribute('data-placement')).toBe('end')
    expect(popup.parentElement?.getAttribute('class')).toContain('justify-end')
    expect(readFileSync(join(import.meta.dirname, '..', 'dummy', 'end.tsx'), 'utf8')).not.toContain('placement=')
  })

  it('start: the three links are real anchors with an address, each drawn as a Button', async () => {
    const popup = await openFirst('start')
    const links = [...popup.querySelectorAll('a')]
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#docs', '#components', '#changelog'])
    for (const link of links) expect(link.getAttribute('data-variant'), link.textContent).toBe('ghost')
  })

  it('bottom: the sheet starts with the grabber, which no demo writes, and each country is a close', async () => {
    const popup = await openFirst('bottom')
    expect(popup.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
    expect(readFileSync(join(import.meta.dirname, '..', 'dummy', 'bottom.tsx'), 'utf8')).not.toContain('aria-hidden')
    await userEvent.click(screen.getByRole('button', { name: 'Morocco' }))
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
  })

  it('with-form: the popup stays a div with the dialog role, and one form inside it holds the fields and the submit button', async () => {
    const popup = await openFirst('with-form')
    expect(popup.tagName).toBe('DIV')
    const form = popup.querySelector('form')
    expect(form?.parentElement).toBe(popup)
    expect(form?.getAttribute('class')).toBe('contents')
    expect(form?.getAttribute('role')).toBeNull()
    expect([...(form?.querySelectorAll('input') ?? [])].map((input) => input.name)).toEqual(['name', 'email'])
    expect(form?.querySelector('button[type="submit"]')?.textContent).toBe('Send')
    // The x is outside the form and after it: pressing it submits nothing.
    expect(popup.lastElementChild?.getAttribute('type')).toBe('button')
    expect(form?.contains(popup.lastElementChild)).toBe(false)
  })

  it('with-form: it is a bottom sheet, the one a phone opens, with its grabber first', async () => {
    const popup = await openFirst('with-form')
    expect(popup.getAttribute('data-placement')).toBe('bottom')
    expect(popup.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })

  it('long-body: sixty entries in the body, which writes no tabindex of its own: nothing has a size here to overflow', async () => {
    const popup = await openFirst('long-body')
    const body = popup.querySelector('[data-drawer-content]')
    expect(body?.querySelectorAll('p')).toHaveLength(60)
    expect(body?.hasAttribute('tabindex')).toBe(false)
  })

  it('rtl: the viewport carries the direction and the language its portal would lose, and the popup writes neither', async () => {
    const popup = await openFirst('rtl')
    expect([popup.parentElement?.getAttribute('dir'), popup.parentElement?.getAttribute('lang')]).toEqual(['rtl', 'ar'])
    expect([popup.hasAttribute('dir'), popup.hasAttribute('lang')]).toEqual([false, false])
  })

  it('rtl: its start sheet closes by a swipe right and its end sheet by a swipe left, as its provider says', async () => {
    expect((await openFirst('rtl', 'القائمة')).getAttribute('data-swipe-direction')).toBe('right')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
    await userEvent.click(screen.getByRole('button', { name: 'التصفية' }))
    expect((await screen.findByRole('dialog')).getAttribute('data-swipe-direction')).toBe('left')
  })

  // The body takes its tab stop from its hook and the viewport its language from the provider, so no demo teaches either by hand.
  it('no demo writes a tabIndex, a lang on a part of the sheet, or a physical side', () => {
    const byHand = /tabIndex|<Drawer\w+[^>]*\slang=|swipeDirection|placement="(left|right)"/
    const DUMMY = join(import.meta.dirname, '..', 'dummy')
    const files = readdirSync(DUMMY).filter((file) => file.endsWith('.tsx'))
    expect(files).toHaveLength(13)
    expect(files.filter((file) => byHand.test(readFileSync(join(DUMMY, file), 'utf8')))).toEqual([])
    expect(byHand.test('<DrawerPopup lang="ar">')).toBe(true)
    expect(byHand.test('<DrawerBody tabIndex={0}>')).toBe(true)
    expect(byHand.test('<DrawerRoot placement="left">')).toBe(true)
    expect(byHand.test('<div dir="rtl" lang="ar">')).toBe(false)
  })

  it('sizes: custom carries the width of its className and no width of ours', async () => {
    const popup = await openFirst('sizes', 'custom')
    expect(popup.getAttribute('data-size')).toBe('custom')
    expect((popup.getAttribute('class') ?? '').split(' ').filter((cls) => cls.startsWith('max-w-'))).toEqual(['max-w-xl'])
  })

  it('non-modal: no scrim, and the page beside the sheet is left to the reader and the pointer', async () => {
    const popup = await openFirst('non-modal')
    expect(document.querySelectorAll('.bg-overlay')).toHaveLength(0)
    expect(popup.parentElement?.getAttribute('class')).toContain('pointer-events-none')
    expect(popup.getAttribute('class')).toContain('pointer-events-auto')
    expect(screen.getByRole('button', { name: 'Behind the panel' }).closest('[aria-hidden="true"]')).toBeNull()
  })

  it('trap-focus: no scrim either, but the page beside the sheet is hidden from a screen reader', async () => {
    const popup = await openFirst('trap-focus')
    expect(document.querySelectorAll('.bg-overlay')).toHaveLength(0)
    expect(popup.parentElement?.getAttribute('class')).toContain('pointer-events-none')
    expect(screen.getByText('Behind the panel').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('every demo starts its sheet with a DrawerHeader, so its title stands clear of the x', async () => {
    const DUMMY = join(import.meta.dirname, '..', 'dummy')
    for (const file of readdirSync(DUMMY).filter((name) => name.endsWith('.tsx'))) {
      const source = readFileSync(join(DUMMY, file), 'utf8')
      const popups = source.split('<DrawerPopup').length - 1
      expect(popups, file).toBeGreaterThan(0)
      expect(source.split(/<DrawerHeader[\s>]/).length - 1, file).toBe(popups)
    }
    const popup = await openFirst('top')
    expect(popup.firstElementChild?.querySelector('h2')?.textContent).toBe('Version 2.4')
  })
})
