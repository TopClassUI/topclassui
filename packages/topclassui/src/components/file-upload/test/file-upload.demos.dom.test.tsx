import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { fireEvent, render } from '@testing-library/react'
import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

// Read from the folder, so a demo added later is held to the same rule.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Rows each upload of each demo shows after a pick of two small PDFs, in document order: a disabled one takes none. */
const AFTER: Record<string, number[]> = {
  basic: [1],
  form: [2],
  'in-field': [2],
  multiple: [2],
  playground: [1],
  rtl: [2],
  states: [1, 1, 0],
  // Images only: both PDFs are refused, and a refused file is a row too.
  'ten-thousand': [2],
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: ComponentType }).default

/** What the picker does: the input's files are the new pick alone, then change fires. A disabled input opens no picker. */
function pick(input: HTMLInputElement): void {
  if (input.disabled) return
  const transfer = new DataTransfer()
  for (const name of ['a.pdf', 'b.pdf']) transfer.items.add(new File(['%PDF'], name, { type: 'application/pdf' }))
  input.files = transfer.files
  fireEvent.change(input)
}

describe('every demo, in the browser, keeps what is picked', () => {
  it('has an expectation for every demo, so a new one cannot skip the rule', () => {
    expect(Object.keys(AFTER).sort()).toEqual(names)
  })

  for (const name of names) {
    it(`${name}: a pick of two PDFs fills each live list up to its maxFiles`, async () => {
      const Demo = await load(name)
      const { container } = render(<Demo />)
      const inputs = [...container.querySelectorAll('input[type="file"]')] as HTMLInputElement[]
      for (const input of inputs) pick(input)
      expect([...container.querySelectorAll('ul')].map((list) => list.children.length), name).toEqual(AFTER[name])
    })
  }
})

describe('the form demo sends what it shows', () => {
  it('both files, by name, under one key', async () => {
    const Demo = await load('form')
    const { container } = render(<Demo />)
    pick(container.querySelector('input[type="file"]') as HTMLInputElement)
    const form = container.querySelector('form') as HTMLFormElement
    expect([...new FormData(form).entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name]))
      .toEqual([['attachments', 'a.pdf'], ['attachments', 'b.pdf']])
  })
})
