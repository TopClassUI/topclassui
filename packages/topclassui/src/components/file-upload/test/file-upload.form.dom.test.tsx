import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FileUpload } from '../index.js'

// What the form receives (unit-5.md, "Form participation"); the browser spec repeats it in Chromium.
afterEach(() => { vi.restoreAllMocks() })

const entries = (form: HTMLFormElement) => [...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
const formOf = () => document.getElementById('f') as HTMLFormElement
const inputOf = () => document.querySelector('input[type="file"]') as HTMLInputElement
const rows = () => [...document.querySelectorAll('li [dir="auto"]')].map((name) => name.textContent)
/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))
const inForm = (children: ReactNode) => <form id="f">{children}<button type="reset">Reset</button></form>

function pick(names: string[]): void {
  const transfer = new DataTransfer()
  for (const name of names) transfer.items.add(new File(['%PDF'], name, { type: 'application/pdf' }))
  inputOf().files = transfer.files
  fireEvent.change(inputOf())
}

describe('from the server HTML, before any script runs', () => {
  it('the input is a named file input in the form, with nothing picked yet', () => {
    const host = document.createElement('div')
    host.innerHTML = renderToString(inForm(<FileUpload aria-label="Files" name="docs" maxFiles={3} />))
    document.body.appendChild(host)
    const input = host.querySelector('input') as HTMLInputElement
    expect([input.form === formOf(), input.name, input.type, input.multiple, input.files?.length]).toEqual([true, 'docs', 'file', true, 0])
    host.remove()
  })
})

describe('after a pick', () => {
  it('the form sends each kept file under the name, in the order of the list', () => {
    render(inForm(<FileUpload aria-label="Files" name="docs" maxFiles={3} />))
    pick(['a.pdf', 'b.pdf'])
    pick(['c.pdf'])
    expect(entries(formOf())).toEqual([['docs', 'a.pdf'], ['docs', 'b.pdf'], ['docs', 'c.pdf']])
  })
})

describe('a reset empties the list, as the browser empties the input', () => {
  for (const how of ['form.reset()', 'a reset button'] as const) {
    // An empty file input still sends one empty part, as a browser does: the entry of a form nobody touched.
    it(`after ${how}: no row, no message, and the one empty part of an untouched input`, async () => {
      render(inForm(<FileUpload aria-label="Files" name="docs" maxFiles={2} />))
      pick(['a.pdf', 'b.pdf', 'c.pdf'])
      expect(rows()).toEqual(['a.pdf', 'b.pdf'])
      if (how === 'form.reset()') act(() => { formOf().reset() })
      else await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await settle()
      expect([rows(), document.querySelector('[role="status"]')?.textContent, entries(formOf())]).toEqual([[], '', [['docs', '']]])
    })
  }

  it('an upload outside the form, tied to it by form, follows its reset', async () => {
    render(<><form id="f" /><FileUpload aria-label="Files" name="far" form="f" /></>)
    pick(['a.pdf'])
    expect(entries(formOf())).toEqual([['far', 'a.pdf']])
    act(() => { formOf().reset() })
    await settle()
    expect([rows(), entries(formOf())]).toEqual([[], [['far', '']]])
  })

  it('a React 19 form action receives the kept files, then React resets the form and the list empties', async () => {
    const sent: string[][] = []
    render(
      <form id="f" action={async (data) => { await Promise.resolve(); sent.push(data.getAll('docs').map((file) => (file as File).name)) }}>
        <FileUpload aria-label="Files" name="docs" maxFiles={3} maxSize={10} />
        <button type="submit">Send</button>
      </form>,
    )
    pick(['a.pdf', 'b.pdf'])
    const big = new File(['x'.repeat(20)], 'big.pdf', { type: 'application/pdf' })
    const transfer = new DataTransfer()
    transfer.items.add(big)
    inputOf().files = transfer.files
    fireEvent.change(inputOf())
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    await settle()
    await settle()
    expect(sent).toEqual([['a.pdf', 'b.pdf']])
    expect(rows()).toEqual([])
  })

  it('a pick after the reset starts a new list', async () => {
    render(inForm(<FileUpload aria-label="Files" name="docs" maxFiles={3} />))
    pick(['a.pdf'])
    act(() => { formOf().reset() })
    await settle()
    pick(['b.pdf'])
    expect([rows(), entries(formOf())]).toEqual([['b.pdf'], [['docs', 'b.pdf']]])
  })
})
