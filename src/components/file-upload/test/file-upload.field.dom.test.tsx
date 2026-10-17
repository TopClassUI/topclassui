import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderToString } from 'react-dom/server'

import { Field, FieldLive } from '#components/field/index.js'
import { type FormErrors, FormErrorsContext } from '#shared/form-errors.js'
import { FileUpload } from '../index.js'

// A FieldLive in a FormAction hears the list change: a remove or a drop writes input.files and dispatches input.
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const frame = () => act(() => new Promise((done) => { requestAnimationFrame(() => { setTimeout(done, 0) }) }))
const inputOf = () => document.querySelector('input[type="file"]') as HTMLInputElement
const error = () => document.querySelector('[id$="-err"]')?.textContent ?? ''

function pick(names: string[]): void {
  const transfer = new DataTransfer()
  for (const name of names) transfer.items.add(new File(['%PDF'], name, { type: 'application/pdf' }))
  inputOf().files = transfer.files
  fireEvent.change(inputOf())
}

const ERRORS: FormErrors = { attachments: 'Remove the duplicate' }
const view = (errors: FormErrors) => (
  <FormErrorsContext value={errors}>
    <form>
      <FieldLive name="attachments" label="Attachments">{(control) => <FileUpload {...control} maxFiles={3} />}</FieldLive>
    </form>
  </FormErrorsContext>
)

describe('a FileUpload inside a server Field, as the server writes it', () => {
  const host = () => {
    const div = document.createElement('div')
    div.innerHTML = renderToString(
      <Field name="attachments" label="Attachments" hint="PDF or PNG" error="Add one file" required>
        {(control) => <FileUpload {...control} maxFiles={5}>Up to 5 files</FileUpload>}
      </Field>,
    )
    return div
  }

  it('the input takes the name, the id the label points at, required, aria-invalid and aria-labelledby', () => {
    const root = host()
    const [input, label] = [root.querySelector('input') as HTMLInputElement, root.querySelector('label')]
    expect([input.name, input.required, input.getAttribute('aria-invalid')]).toEqual(['attachments', true, 'true'])
    expect([label?.htmlFor, label?.id, input.getAttribute('aria-labelledby')]).toEqual([input.id, `${input.id}-label`, `${input.id}-label`])
  })

  it('aria-describedby lists the zone hint, then the Field hint, then the error, and each id resolves', () => {
    const root = host()
    document.body.appendChild(root)
    const ids = (root.querySelector('input')?.getAttribute('aria-describedby') ?? '').split(' ')
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual(['Up to 5 files', 'PDF or PNG', 'Add one file'])
    root.remove()
  })
})

describe('a FileUpload inside a FieldLive', () => {
  it('the error of the action goes when a file is removed', async () => {
    const { rerender } = render(view({}))
    pick(['a.pdf', 'b.pdf'])
    rerender(view(ERRORS))
    await settle()
    expect([error(), inputOf().getAttribute('aria-invalid')]).toEqual(['Remove the duplicate', 'true'])
    fireEvent.click(screen.getByRole('button', { name: 'Remove b.pdf' }))
    await frame()
    expect([error(), inputOf().getAttribute('aria-invalid')]).toEqual(['', null])
  })

  it('the error goes when a drop adds a file', async () => {
    const { rerender } = render(view({}))
    pick(['a.pdf'])
    rerender(view(ERRORS))
    await settle()
    const zone = inputOf().parentElement as HTMLElement
    fireEvent.drop(zone, { dataTransfer: { files: [new File(['%PDF'], 'c.pdf', { type: 'application/pdf' })], types: ['Files'] } })
    await frame()
    expect(error()).toBe('')
  })

  it('stays after a click on the zone that picks nothing', async () => {
    const { rerender } = render(view({}))
    pick(['a.pdf'])
    rerender(view(ERRORS))
    await settle()
    fireEvent.click(inputOf())
    await frame()
    expect(error()).toBe('Remove the duplicate')
  })
})
