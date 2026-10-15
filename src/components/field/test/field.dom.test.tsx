import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Checkbox } from '#components/checkbox/index.js'
import { Input } from '#components/input/index.js'
import { Select } from '#components/select/index.js'
import { type FormErrors, FormErrorsContext } from '#shared/form-errors.js'
import { FieldLive } from '../index.js'

// FieldLive's error from the nearest FormAction (unit-5.md, Field): shown, gone once the value changes, back with the next answer.
afterEach(() => { vi.restoreAllMocks() })

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }]

/** The hook records the entries in a timeout of 0 after the errors arrive, then reads them again on a frame: wait for both. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const frame = () => act(() => new Promise((done) => { requestAnimationFrame(() => { setTimeout(done, 0) }) }))

function Fields() {
  return (
    <>
      <FieldLive name="email" label="Email">{(control) => <Input {...control} defaultValue="taken@example.com" />}</FieldLive>
      <FieldLive name="terms" label="Terms" inline>{(control) => <Checkbox {...control} />}</FieldLive>
      <FieldLive name="country" label="Country">{(control) => <Select {...control} items={ITEMS} defaultValue="jo" />}</FieldLive>
    </>
  )
}

const ERRORS: FormErrors = { email: 'That email is taken', terms: ['Accept the terms'], country: 'We do not ship there' }

const inForm = (errors: FormErrors | undefined, children: ReactNode = <Fields />) => (
  <FormErrorsContext value={errors}><form>{children}</form></FormErrorsContext>
)

/** The error text each field shows now, by label, and whether its control is invalid. */
function shown(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const label of document.querySelectorAll('label[id$="-label"]')) {
    const control = document.querySelector(`[aria-labelledby="${label.id}"]`)
    const error = document.getElementById(`${label.id.slice(0, -'-label'.length)}-err`)
    out[label.textContent] = `${error?.textContent ?? ''}${control?.getAttribute('aria-invalid') === 'true' ? ' (invalid)' : ''}`
  }
  return out
}

describe('an error from the nearest FormAction', () => {
  it('shows on the field of its name, with aria-invalid and the error in the description', async () => {
    render(inForm(ERRORS))
    await settle()
    expect(shown()).toEqual({ Email: 'That email is taken (invalid)', Terms: 'Accept the terms (invalid)', Country: 'We do not ship there (invalid)' })
    const email = screen.getByRole('textbox', { name: 'Email' })
    expect(email.getAttribute('aria-describedby')).toBe(`${email.id}-err`)
  })

  it('shows nothing outside a FormAction, and nothing for a name the answer does not hold', async () => {
    render(<form><Fields /></form>)
    await settle()
    expect(shown()).toEqual({ Email: '', Terms: '', Country: '' })
    render(inForm({ other: 'Nope' }))
    expect(screen.queryAllByText('Nope')).toEqual([])
  })

  it('goes from an Input once what is typed changes, and from that field alone', async () => {
    render(inForm(ERRORS))
    await settle()
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'x')
    await frame()
    expect(shown()).toEqual({ Email: '', Terms: 'Accept the terms (invalid)', Country: 'We do not ship there (invalid)' })
  })

  it('goes from a Checkbox once it is ticked', async () => {
    render(inForm(ERRORS))
    await settle()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Terms' }))
    await frame()
    expect(shown()['Terms']).toBe('')
  })

  it('goes from a Select once another option is chosen, a press in its portaled popup', async () => {
    render(inForm(ERRORS))
    await settle()
    await userEvent.click(screen.getByRole('combobox', { name: 'Country' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Egypt' }))
    await waitFor(() => { expect(screen.queryByRole('listbox')).toBeNull() })
    await frame()
    expect(shown()['Country']).toBe('')
  })

  it('stays after a click that changes nothing: into the field, on its label, or the option already chosen', async () => {
    render(inForm(ERRORS))
    await settle()
    await userEvent.click(screen.getByRole('textbox', { name: 'Email' }))
    await userEvent.click(screen.getByText('Email'))
    await userEvent.click(screen.getByRole('combobox', { name: 'Country' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Jordan' }))
    await waitFor(() => { expect(screen.queryByRole('listbox')).toBeNull() })
    await frame()
    expect(shown()).toEqual({ Email: 'That email is taken (invalid)', Terms: 'Accept the terms (invalid)', Country: 'We do not ship there (invalid)' })
  })

  it('comes back with the next answer of the action, a new errors object, even with the same message', async () => {
    const view = render(inForm(ERRORS))
    await settle()
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'x')
    await frame()
    expect(shown()['Email']).toBe('')
    view.rerender(inForm({ ...ERRORS }))
    await settle()
    expect(shown()['Email']).toBe('That email is taken (invalid)')
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'y')
    await frame()
    expect(shown()['Email']).toBe('')
  })

  it('a second answer with no errors clears every field', async () => {
    const view = render(inForm(ERRORS))
    await settle()
    view.rerender(inForm({}))
    expect(shown()).toEqual({ Email: '', Terms: '', Country: '' })
  })
})

describe('an error the caller passes', () => {
  it('wins over the form, and stays after a change: it is the caller who drops it', async () => {
    render(inForm(ERRORS, (
      <FieldLive name="email" label="Email" error="Mine">{(control) => <Input {...control} />}</FieldLive>
    )))
    await settle()
    expect(shown()).toEqual({ Email: 'Mine (invalid)' })
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'x')
    await frame()
    expect(shown()).toEqual({ Email: 'Mine (invalid)' })
  })

  it('invalid={false} keeps the message but drops aria-invalid', async () => {
    render(inForm(ERRORS, <FieldLive name="email" label="Email" invalid={false}>{(control) => <Input {...control} />}</FieldLive>))
    await settle()
    expect(shown()).toEqual({ Email: 'That email is taken' })
  })
})

describe('the root', () => {
  it("still runs the caller's listeners and takes the caller's ref", async () => {
    const heard: string[] = []
    const ref = { current: null as HTMLDivElement | null }
    render(inForm(ERRORS, (
      <FieldLive
        name="email" label="Email" ref={ref} data-testid="root"
        onInput={() => heard.push('input')} onChange={() => heard.push('change')}
        onClick={() => heard.push('click')} onKeyUp={() => heard.push('keyup')}
      >
        {(control) => <Input {...control} />}
      </FieldLive>
    )))
    await settle()
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'x')
    expect(heard).toEqual(['click', 'input', 'change', 'keyup'])
    expect(ref.current).toBe(screen.getByTestId('root'))
    await frame()
    expect(shown()).toEqual({ Email: '' })
  })

  it('a callback ref is called with the root', () => {
    const seen: (HTMLDivElement | null)[] = []
    render(<FieldLive name="n" label="L" ref={(node) => { seen.push(node) }}>{(control) => <Input {...control} />}</FieldLive>)
    expect(seen[0]?.tagName).toBe('DIV')
  })
})
