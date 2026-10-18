import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FileUpload } from '../index.js'

// R-8.5-1: the file list is a collection (PLAN 18): refused rows are not capped by maxFiles, so it windows them.
const fileOf = (name: string, type = 'text/plain') => new File([], name, { type })
const inputOf = () => document.querySelector('input[type="file"]') as HTMLInputElement
const list = () => screen.getByRole('list')
const mounted = () => list().querySelectorAll('li[data-index]')
const spacers = () => list().querySelectorAll('li[aria-hidden="true"]')
const announced = () => document.querySelectorAll('[role="status"]')[1]?.textContent

function pick(files: File[]): void {
  const transfer = new DataTransfer()
  for (const file of files) transfer.items.add(file)
  inputOf().files = transfer.files
  fireEvent.change(inputOf())
}

const thousand = Array.from({ length: 1000 }, (_, at) => fileOf(`note-${String(at + 1)}.txt`))

describe('a thousand refused files', () => {
  it('mount a handful of rows and a spacer for the rest, each row with its index', () => {
    render(<FileUpload aria-label="Images" accept="image/*" maxFiles={3} />)
    pick(thousand)
    expect(mounted().length).toBeGreaterThan(0)
    expect(mounted().length).toBeLessThan(30)
    expect(mounted()[0]?.getAttribute('data-index')).toBe('0')
    expect(spacers()).toHaveLength(1)
    expect(list().style.getPropertyValue('--tc-list-pad-end')).toMatch(/^\d+(\.\d+)?px$/)
  })

  it('the hidden status line reads five names and the count of the rest, not a thousand rows', () => {
    render(<FileUpload aria-label="Images" accept="image/*" maxFiles={3} />)
    pick(thousand)
    const text = announced() ?? ''
    expect(text).toContain('note-5.txt')
    expect(text).not.toContain('note-6.txt')
    expect(text).toContain('and 995 more files refused')
  })

  it('a few refused files are all named, with no count', () => {
    render(<FileUpload aria-label="Images" accept="image/*" maxFiles={3} />)
    pick(thousand.slice(0, 5))
    expect(announced()).not.toContain('more')
    expect(spacers()).toHaveLength(0)
  })

  it('removing the first row moves the focus to the row now first, found by its index', () => {
    render(<FileUpload aria-label="Images" accept="image/*" maxFiles={3} />)
    pick(thousand)
    const first = mounted()[0]?.querySelector('button') as HTMLButtonElement
    first.focus()
    fireEvent.click(first)
    expect(document.activeElement?.closest('li')?.getAttribute('data-index')).toBe('0')
    expect(document.activeElement?.closest('li')?.textContent).toContain('note-2.txt')
  })
})
