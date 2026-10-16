import { act, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { toast } from '../index.js'

// The edges: a toast added before the provider listens, a high toast while it is not focused, the action's place.

const app = () => <TopClassProvider direction="ltr" locale="en" />
const roots = () => [...document.querySelectorAll('[role="region"] > [role="dialog"], [role="region"] > [role="alertdialog"]')]
const titles = () => roots().map((root) => root.querySelector('h2')?.textContent)
const shown = (title: string) => screen.findByRole('heading', { name: title })

describe('a toast added before the provider listens (TOAST-1)', () => {
  it('waits for the provider when called before it mounts, and keeps the order', async () => {
    toast.add({ title: 'Early' })
    render(app())
    act(() => { toast.add({ title: 'In time' }) })
    await shown('In time')
    expect(titles()).toEqual(['In time', 'Early'])
  })

  it('shows a toast a page adds in its mount effect, which runs before the provider listens', async () => {
    function SignedIn() {
      useEffect(() => { toast.add({ title: 'Welcome back' }) }, [])
      return <p>page</p>
    }
    render(<TopClassProvider direction="ltr" locale="en"><SignedIn /></TopClassProvider>)
    expect(await shown('Welcome back')).toBeTruthy()
    expect(titles()).toEqual(['Welcome back'])
  })
})

describe('the parts of a toast', () => {
  it('leaves a high toast readable while it is not focused, since its tab stop, action and x stay (TOAST-2)', async () => {
    render(app())
    act(() => { toast.add({ priority: 'high', title: 'Payment failed', action: { label: 'Retry', onClick: () => undefined } }); toast.add({ title: 'Low' }) })
    await shown('Payment failed')
    const [low, high] = roots()
    expect(high?.getAttribute('role')).toBe('alertdialog')
    expect(high?.contains(document.activeElement)).toBe(false)
    expect(high?.getAttribute('aria-hidden')).toBe('false')
    expect(high?.getAttribute('tabindex')).toBe('0')
    expect(low?.hasAttribute('aria-hidden')).toBe(false)
  })

  it('lays the action beside the text, not inside it, so a narrow toast can give it the full width (TOAST-4)', async () => {
    render(app())
    act(() => { toast.add({ title: 'Storage almost full', action: { label: 'Manage storage', onClick: () => undefined } }) })
    await shown('Storage almost full')
    const root = roots()[0]
    const action = screen.getByRole('button', { name: 'Manage storage' })
    expect(action.parentElement).toBe(root)
    expect([...(root?.children ?? [])].map((child) => child.tagName)).toEqual(['DIV', 'BUTTON', 'BUTTON'])
  })
})
