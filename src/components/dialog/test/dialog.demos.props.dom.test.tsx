import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

describe('what the demos show of the props', () => {
  /** Opens the dialog of one trigger of a demo: the first, or the one with that label. */
  const openFirst = async (name: string, trigger?: string) => {
    const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
    render(<loaded.default />)
    await userEvent.click(trigger === undefined ? screen.getAllByRole('button')[0] as HTMLElement : screen.getByRole('button', { name: trigger }))
    return screen.findByRole('dialog')
  }

  it('confirm: a press outside leaves it open, because the root carries disablePointerDismissal', async () => {
    const popup = await openFirst('confirm')
    await userEvent.click(popup.parentElement?.previousElementSibling as Element)
    await new Promise((resolve) => { setTimeout(resolve, 30) })
    expect(popup.hasAttribute('data-open')).toBe(true)
  })

  it('basic: the same press closes it', async () => {
    const popup = await openFirst('basic')
    await userEvent.click(popup.parentElement?.previousElementSibling as Element)
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })
  })

  it('with-form: the popup stays a div with the dialog role, and one form inside it holds the field and the submit button', async () => {
    const popup = await openFirst('with-form')
    expect(popup.tagName).toBe('DIV')
    const form = popup.querySelector('form')
    expect(form?.parentElement).toBe(popup)
    expect(form?.getAttribute('class')).toBe('contents')
    expect(form?.getAttribute('role')).toBeNull()
    expect(form?.querySelector('input[name="name"]')).not.toBeNull()
    expect(form?.querySelector('button[type="submit"]')?.textContent).toBe('Save')
  })

  it('with-form: the first focus is in the field, not on the x', async () => {
    const popup = await openFirst('with-form')
    await waitFor(() => { expect(document.activeElement).toBe(popup.querySelector('input[name="name"]')) })
  })

  it('long-body: the body can take focus, so a keyboard reaches a text with no control in it', async () => {
    const popup = await openFirst('long-body')
    expect(popup.children[1]?.getAttribute('tabindex')).toBe('0')
    expect(popup.children[1]?.querySelectorAll('p')).toHaveLength(40)
  })

  it('rtl: the popup carries the language its portal would lose, and its viewport the direction', async () => {
    const popup = await openFirst('rtl')
    expect(popup.getAttribute('lang')).toBe('ar')
    expect(popup.parentElement?.getAttribute('dir')).toBe('rtl')
  })

  it('sizes: custom carries the width of its className and no width of ours', async () => {
    const popup = await openFirst('sizes', 'custom')
    expect(popup.getAttribute('data-size')).toBe('custom')
    expect((popup.getAttribute('class') ?? '').split(' ').filter((cls) => cls.startsWith('max-w-'))).toEqual(['max-w-3xl'])
  })

  it('confirm: the consequence is the description of the dialog, so it is read out when it opens', async () => {
    const popup = await openFirst('confirm')
    const description = document.getElementById(popup.getAttribute('aria-describedby') ?? 'none')
    expect(description?.textContent).toBe('This removes the project and every file in it. This cannot be undone.')
    expect(description?.tagName).toBe('P')
    expect(description?.parentElement).toBe(popup.children[1])
    // Announced as a dialog: no AlertDialog is built.
    expect(popup.getAttribute('role')).toBe('dialog')
  })

  it('long-content: the body can take focus too, because on a small phone it scrolls', async () => {
    expect((await openFirst('long-content')).children[1]?.getAttribute('tabindex')).toBe('0')
  })

  it('non-modal: no scrim, and the page behind is left to the reader and the pointer', async () => {
    const popup = await openFirst('non-modal')
    expect(document.querySelectorAll('.bg-overlay')).toHaveLength(0)
    expect(popup.parentElement?.getAttribute('class')).toContain('pointer-events-none')
    expect(screen.getByRole('button', { name: 'Behind the panel' }).closest('[aria-hidden="true"]')).toBeNull()
  })

  it('trap-focus: no scrim either, but the page behind is hidden from a screen reader', async () => {
    const popup = await openFirst('trap-focus')
    expect(document.querySelectorAll('.bg-overlay')).toHaveLength(0)
    expect(popup.parentElement?.getAttribute('class')).toContain('pointer-events-none')
    expect(screen.getByText('Behind the panel').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('with-tooltip: the copy button inside the dialog is the trigger of a tooltip, named by the same words', async () => {
    const popup = await openFirst('with-tooltip')
    const copy = popup.querySelector('button[aria-label="Copy link"]')
    expect(copy?.hasAttribute('data-base-ui-tooltip-trigger')).toBe(true)
    expect(copy?.querySelectorAll('svg')).toHaveLength(1)
  })
})

describe('close-on-success: the dialog closes when the action succeeds and stays when it fails', () => {
  const openForm = async () => {
    const loaded = await import('../dummy/close-on-success.js') as { default: ComponentType }
    render(<loaded.default />)
    await userEvent.click(screen.getByRole('button', { name: 'Rename and close' }))
    const popup = await screen.findByRole('dialog')
    return { popup, field: popup.querySelector('input[name="name"]') as HTMLInputElement }
  }

  it('starts in the field, with the current name and no error', async () => {
    const { popup, field } = await openForm()
    await waitFor(() => { expect(document.activeElement).toBe(field) })
    expect(field.value).toBe('Website redesign')
    expect(field.getAttribute('aria-invalid')).toBeNull()
    expect(popup.querySelector('#demo-rename-error')).toBeNull()
  })

  it('a name the action refuses leaves the dialog open, with the error, and gives the typed name back', async () => {
    const { popup, field } = await openForm()
    await userEvent.clear(field)
    await userEvent.type(field, 'Untitled{Enter}')
    await waitFor(() => { expect(popup.querySelector('#demo-rename-error')?.textContent).toBe('That name is taken.') })
    expect(popup.hasAttribute('data-open')).toBe(true)
    expect(field.value).toBe('Untitled')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect(field.getAttribute('aria-describedby')).toBe('demo-rename-error')
  })

  it('a name it takes closes the dialog, and the next opening starts clean', async () => {
    const { field } = await openForm()
    await userEvent.clear(field)
    await userEvent.type(field, 'Atlas')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => { expect(screen.queryByRole('dialog')).toBeNull() })

    await userEvent.click(screen.getByRole('button', { name: 'Rename and close' }))
    const again = await screen.findByRole('dialog')
    expect((again.querySelector('input[name="name"]') as HTMLInputElement).value).toBe('Website redesign')
    expect(again.querySelector('#demo-rename-error')).toBeNull()
  })
})
