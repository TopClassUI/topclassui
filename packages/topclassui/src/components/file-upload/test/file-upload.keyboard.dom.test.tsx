import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { FileUpload } from '../index.js'

// R-5.6-3: the drop has a keyboard path, the input itself. The browser spec repeats the ring and the picker in Chromium.
const inputOf = () => document.querySelector('input[type="file"]') as HTMLInputElement

function pick(names: string[]): void {
  const transfer = new DataTransfer()
  for (const name of names) transfer.items.add(new File(['%PDF'], name, { type: 'application/pdf' }))
  inputOf().files = transfer.files
  fireEvent.change(inputOf())
}

describe('the tab stops', () => {
  it('the input is the one stop of the zone, then each remove button in the order of the list, then what follows', async () => {
    render(<><FileUpload aria-label="Files" maxFiles={3}>Hint</FileUpload><button type="button">After</button></>)
    pick(['a.pdf', 'b.pdf'])
    const stops: (Element | null)[] = []
    for (let step = 0; step < 4; step += 1) {
      await userEvent.tab()
      stops.push(document.activeElement)
    }
    expect(stops).toEqual([
      inputOf(), screen.getByRole('button', { name: 'Remove a.pdf' }), screen.getByRole('button', { name: 'Remove b.pdf' }),
      screen.getByRole('button', { name: 'After' }),
    ])
  })

  it('the zone, the list and the rows take no tab stop of their own while the list does not overflow', () => {
    render(<FileUpload aria-label="Files" maxFiles={3} />)
    pick(['a.pdf'])
    expect([...document.querySelectorAll('[tabindex]')].map((node) => node.tagName)).toEqual([])
  })

  it('a disabled upload has no tab stop at all', async () => {
    render(<><FileUpload aria-label="Files" disabled /><button type="button">After</button></>)
    await userEvent.tab()
    expect(document.activeElement?.textContent).toBe('After')
  })
})

describe('the keys', () => {
  it('Enter and Space on a remove button remove its file, and the focus moves on', async () => {
    render(<FileUpload aria-label="Files" maxFiles={3} />)
    pick(['a.pdf', 'b.pdf', 'c.pdf'])
    screen.getByRole('button', { name: 'Remove a.pdf' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove b.pdf' }))
    await userEvent.keyboard(' ')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove c.pdf' }))
    expect([...(inputOf().files ?? [])].map((file) => file.name)).toEqual(['c.pdf'])
  })
})
