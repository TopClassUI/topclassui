import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FieldLive } from '#components/field/index.js'
import { Input } from '#components/input/index.js'
import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'
import { type FormErrors, useFormErrors } from '#shared/form-errors.js'
import { FormAction } from '../index.js'

interface State { errors?: FormErrors, values?: { email?: string }, message?: string }

/** A reader of the context alone, as FieldLive reads it: the message for its name, or nothing. */
function Says({ name }: { name: string }) {
  const errors = useFormErrors()
  return <span data-for={name}>{String(errors?.[name] ?? '(none)')}</span>
}

/** An action whose answer the test hands out by hand, so a test can look at the form while it is pending. */
function deferred() {
  const calls: { state: State, entries: string[][], answer: (next: State) => void }[] = []
  const action = (state: State, formData: FormData) => new Promise<State>((answer) => {
    calls.push({ state, entries: [...formData.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name]), answer })
  })
  return { calls, action }
}

const submit = async () => { await userEvent.click(screen.getByRole('button', { name: 'Send' })) }
const settle = async (answer: () => void) => { await act(async () => { answer(); await Promise.resolve() }) }

describe('FormAction runs a React 19 action', () => {
  it('hands the action the last state and the entries, and writes aria-busy only while it is pending', async () => {
    const { calls, action } = deferred()
    render(
      <FormAction action={action} aria-label="Subscribe">
        <Input aria-label="Email" name="email" defaultValue="a@example.com" />
        <button type="submit">Send</button>
      </FormAction>,
    )
    const form = screen.getByRole('form', { name: 'Subscribe' })
    expect(form.getAttribute('aria-busy')).toBeNull()
    await submit()
    expect(form.getAttribute('aria-busy')).toBe('true')
    expect(calls.map(({ state, entries }) => [state, entries])).toEqual([[{}, [['email', 'a@example.com']]]])
    await settle(() => { calls[0]?.answer({ message: 'Done' }) })
    expect(form.getAttribute('aria-busy')).toBeNull()
  })

  it('a function child receives the current state and pending, never the starting state again', async () => {
    const { calls, action } = deferred()
    const seen: [State, boolean][] = []
    render(
      <FormAction action={action} initialState={{ message: 'Start' }}>
        {(state, pending) => { seen.push([state, pending]); return <><p>{state.message}</p><button type="submit">Send</button></> }}
      </FormAction>,
    )
    expect(screen.getByText('Start')).toBeTruthy()
    await submit()
    await settle(() => { calls[0]?.answer({ message: 'Thanks' }) })
    expect(screen.getByText('Thanks')).toBeTruthy()
    expect(seen.at(0)).toEqual([{ message: 'Start' }, false])
    expect(seen.some(([state, pending]) => state.message === 'Start' && pending)).toBe(true)
    expect(seen.at(-1)).toEqual([{ message: 'Thanks' }, false])
  })

  it('provides the errors of the answer to every reader by name, and a second answer with none clears them all', async () => {
    const { calls, action } = deferred()
    render(
      <FormAction action={action}>
        <Says name="email" />
        <Says name="topic" />
        <button type="submit">Send</button>
      </FormAction>,
    )
    const said = () => [...document.querySelectorAll('[data-for]')].map((node) => node.textContent)
    expect(said()).toEqual(['(none)', '(none)'])
    await submit()
    await settle(() => { calls[0]?.answer({ errors: { email: 'Taken', topic: ['Pick one'] } }) })
    expect(said()).toEqual(['Taken', 'Pick one'])
    await submit()
    await settle(() => { calls[1]?.answer({}) })
    expect(said()).toEqual(['(none)', '(none)'])
  })

  it('outside a FormAction the readers find no errors', () => {
    render(<Says name="email" />)
    expect(screen.getByText('(none)')).toBeTruthy()
  })

  it("provides the answer's errors as they are: before the first answer, and after one without errors, a reader reads undefined, as outside one", async () => {
    const { calls, action } = deferred()
    const seen: unknown[] = []
    function Reader() {
      seen.push(useFormErrors())
      return <button type="submit">Send</button>
    }
    render(<FormAction action={action}><Reader /></FormAction>)
    expect(seen.at(-1)).toBeUndefined()
    await submit()
    await settle(() => { calls[0]?.answer({ message: 'Done' }) })
    expect(seen.at(-1)).toBeUndefined()
  })
})

describe('after an answer with errors the focus moves to the first invalid control', () => {
  const invalid = (state: State, name: string) => (state.errors?.[name] ? true : undefined)

  it('the first one in the form, not the first error of the object; and not on the first render', async () => {
    const { calls, action } = deferred()
    render(
      <FormAction action={action} initialState={{ errors: { email: 'Required' } }}>
        {(state) => (
          <>
            <Input aria-label="Name" name="name" aria-invalid={invalid(state, 'name')} />
            <Input aria-label="Email" name="email" aria-invalid={invalid(state, 'email')} />
            <button type="submit">Send</button>
          </>
        )}
      </FormAction>,
    )
    expect(document.activeElement).toBe(document.body)
    await submit()
    await settle(() => { calls[0]?.answer({ errors: { email: 'Taken', name: 'Too short' } }) })
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Name' }))
  })

  it('an answer with no message, or an empty one, leaves the focus where it was', async () => {
    const { calls, action } = deferred()
    render(
      <FormAction action={action}>
        <Input aria-label="Name" name="name" aria-invalid />
        <button type="submit">Send</button>
      </FormAction>,
    )
    await submit()
    await settle(() => { calls[0]?.answer({ errors: { name: '', email: [] } }) })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Send' }))
  })

  it('skips a control that takes no focus, a disabled one, and lands on the next', async () => {
    const { calls, action } = deferred()
    render(
      <FormAction action={action}>
        <Input aria-label="Locked" name="locked" aria-invalid disabled />
        <Input aria-label="Email" name="email" aria-invalid />
        <button type="submit">Send</button>
      </FormAction>,
    )
    await submit()
    await settle(() => { calls[0]?.answer({ errors: { email: 'Taken' } }) })
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Email' }))
  })

  for (const [checked, expected] of [['yearly', 'Yearly'], [undefined, 'Monthly']] as const) {
    it(`a RadioGroupRoot in a FieldLive, first in error, takes no focus itself: it lands on its ${checked ? 'checked' : 'first'} radio`, async () => {
      const { calls, action } = deferred()
      render(
        <FormAction action={action}>
          <FieldLive name="billing" label="Billing">
            {(control) => (
              <RadioGroupRoot {...control} defaultValue={checked}>
                <RadioGroupItem value="monthly">Monthly</RadioGroupItem>
                <RadioGroupItem value="yearly">Yearly</RadioGroupItem>
              </RadioGroupRoot>
            )}
          </FieldLive>
          <FieldLive name="email" label="Email">{(control) => <Input {...control} />}</FieldLive>
          <button type="submit">Send</button>
        </FormAction>,
      )
      expect(screen.getByRole('radiogroup').getAttribute('tabindex')).toBeNull()
      await submit()
      await settle(() => { calls[0]?.answer({ errors: { billing: 'Pick a plan', email: 'Taken' } }) })
      expect(document.activeElement).toBe(screen.getByRole('radio', { name: expected }))
    })
  }
})

describe('the form element', () => {
  it('takes every form attribute but the action, the caller className and a ref, which sees the form', () => {
    const ref = vi.fn()
    render(<FormAction action={() => ({})} id="f" aria-label="F" className="grid gap-4" noValidate autoComplete="off" ref={ref} />)
    const form = screen.getByRole<HTMLFormElement>('form', { name: 'F' })
    expect([form.id, form.className, form.noValidate, form.getAttribute('autocomplete')]).toEqual(['f', 'grid gap-4', true, 'off'])
    expect(ref).toHaveBeenLastCalledWith(form)
  })

  it('an object ref sees the form too, and a submit button still submits through the action', async () => {
    const ref = { current: null as HTMLFormElement | null }
    const action = vi.fn(() => ({}))
    render(<FormAction action={action} aria-label="F" ref={ref}><button type="submit">Send</button></FormAction>)
    expect(ref.current).toBe(screen.getByRole('form', { name: 'F' }))
    fireEvent.submit(ref.current as HTMLFormElement)
    await act(async () => { await Promise.resolve() })
    expect(action).toHaveBeenCalledTimes(1)
  })
})
