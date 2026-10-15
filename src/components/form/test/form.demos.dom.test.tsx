import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

/** What `new FormData(form)` holds, as pairs. */
const sent = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name])
/** The text of every element a control names as its description, in order. */
const described = (control: HTMLElement) => (control.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
  .map((id) => document.getElementById(id)?.textContent ?? `(missing ${id})`)

/** The name of every control of a demo that says it is invalid, in document order. */
const invalidIn = (root: ParentNode) => [...root.querySelectorAll('[aria-invalid="true"]')].map((node) => node.getAttribute('name') ?? node.id)

describe('the demos', () => {
  it('are the three the plan names', () => {
    expect(names).toEqual(['basic', 'form-action', 'server-errors'])
  })

  it('server-errors: each error is on its own field, read after the hint, and both values come back', async () => {
    const Demo = await load('server-errors')
    render(<Demo />)
    const email = screen.getByRole('textbox', { name: 'Email' })
    const message = screen.getByRole('textbox', { name: 'Message' })
    expect(invalidIn(document)).toEqual(['email', 'message'])
    expect(described(email)).toEqual(['This email is already subscribed'])
    expect(described(message)).toEqual(['What can we help with?', 'Write at least 20 charactersLeave out the links'])
    expect([(email as HTMLInputElement).value, (message as HTMLTextAreaElement).value]).toEqual(['taken@example.com', 'Hi, see example.com'])
  })
})

describe('form-action: a FormAction with FieldLive', () => {
  const open = async () => {
    const Demo = await load('form-action')
    render(<Demo />)
    const form = document.querySelector('form') as HTMLFormElement
    return { form, name: screen.getByRole('textbox', { name: 'Name' }), email: screen.getByRole('textbox', { name: 'Email' }) }
  }
  const subscribe = () => userEvent.click(screen.getByRole('button', { name: 'Subscribe' }))

  it('pending while it runs; the error lands on the email field, the focus moves to it, and what was typed is still there and sent', async () => {
    const { form, name, email } = await open()
    await userEvent.type(name, 'Omar')
    await userEvent.type(email, 'taken@example.com')
    await subscribe()
    expect(form.getAttribute('aria-busy')).toBe('true')
    await waitFor(() => { expect(invalidIn(form)).toEqual(['email']) })
    expect(form.getAttribute('aria-busy')).toBeNull()
    expect(described(email)).toEqual(['Try taken@example.com', 'This email is already subscribed'])
    expect(document.activeElement).toBe(email)
    expect(sent(form)).toEqual([['name', 'Omar'], ['email', 'taken@example.com']])
  })

  it('typing clears the error; a second answer with none shows the message and no field is invalid', async () => {
    const { form, email } = await open()
    await userEvent.type(email, 'taken@example.com')
    await subscribe()
    await waitFor(() => { expect(invalidIn(form)).toEqual(['email']) })
    // FieldLive records the entries in a task of its own after the answer: no person types inside that task.
    await act(() => new Promise((done) => { setTimeout(done, 0) }))
    await userEvent.clear(email)
    await waitFor(() => { expect(invalidIn(form)).toEqual([]) })
    expect(described(email)).toEqual(['Try taken@example.com'])
    await userEvent.type(email, 'new@example.com')
    await subscribe()
    await waitFor(() => { expect(screen.getByRole('status').textContent).toBe('Subscribed new@example.com') })
    expect(invalidIn(form)).toEqual([])
  })
})
