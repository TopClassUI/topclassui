import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FileUpload } from '../index.js'

// happy-dom has DataTransfer and File and keeps an assigned input.files: what a pick, a drop and a remove leave.
const MB = 1024 * 1024
const fileOf = (name: string, size = 10, type = '') => {
  const file = new File([], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}
const inputOf = () => document.querySelector('input[type="file"]') as HTMLInputElement
const zoneOf = () => inputOf().parentElement as HTMLElement
const sent = () => [...(inputOf().files ?? [])].map((file) => file.name)
const rows = () => [...document.querySelectorAll('li')].map((row) => row.textContent)
const [message, announced] = [() => document.querySelectorAll('[role="status"]')[0]?.textContent, () => document.querySelectorAll('[role="status"]')[1]?.textContent]

/** What the picker does: the input's files are the new pick alone, then change fires. */
function pick(files: File[]): void {
  const transfer = new DataTransfer()
  for (const file of files) transfer.items.add(file)
  inputOf().files = transfer.files
  fireEvent.change(inputOf())
}

/** What a drag of files from the desktop carries, as Chromium reports it. */
const dragOf = (files: File[]) => ({ dataTransfer: { files, types: ['Files'] } })

describe('a pick', () => {
  it('three files with maxFiles 2: two rows, the message, and two files in input.files', () => {
    render(<FileUpload aria-label="Files" maxFiles={2} />)
    pick([fileOf('a.pdf'), fileOf('b.pdf'), fileOf('c.pdf')])
    expect(rows()).toEqual(['a.pdf10 bytes', 'b.pdf10 bytes'])
    expect(message()).toBe('Only 2 files allowed')
    expect(sent()).toEqual(['a.pdf', 'b.pdf'])
  })

  it('a second cut in a row writes the message again as a new node, so the live region is heard again', () => {
    render(<FileUpload aria-label="Files" maxFiles={2} />)
    pick([fileOf('a.pdf'), fileOf('b.pdf'), fileOf('c.pdf')])
    const region = document.querySelectorAll('[role="status"]')[0] as HTMLElement
    const first = region.firstChild
    pick([fileOf('d.pdf')])
    expect([rows(), message()]).toEqual([['a.pdf10 bytes', 'b.pdf10 bytes'], 'Only 2 files allowed'])
    expect(region.firstChild).not.toBe(first)
    expect(region.childNodes).toHaveLength(1)
  })

  it('files add up across picks, and the input sends all of them', () => {
    render(<FileUpload aria-label="Files" maxFiles={5} />)
    pick([fileOf('a.pdf')])
    pick([fileOf('b.pdf'), fileOf('c.pdf', 2.4 * MB)])
    expect(rows()).toEqual(['a.pdf10 bytes', 'b.pdf10 bytes', 'c.pdf2.4 MB'])
    expect(sent()).toEqual(['a.pdf', 'b.pdf', 'c.pdf'])
    expect(message()).toBe('')
  })

  it('with maxFiles 1 a new file replaces the old one', () => {
    render(<FileUpload aria-label="File" />)
    pick([fileOf('old.pdf')])
    pick([fileOf('new.pdf')])
    expect([rows(), sent()]).toEqual([['new.pdf10 bytes'], ['new.pdf']])
  })

  it('a file over maxSize is shown with its reason, never sent, and read out in the hidden status line', () => {
    render(<FileUpload aria-label="Files" maxFiles={3} maxSize={5 * MB} />)
    pick([fileOf('brief.pdf', 6 * MB), fileOf('ok.pdf')])
    expect(rows()).toEqual(['ok.pdf10 bytes', 'brief.pdfToo large'])
    expect(sent()).toEqual(['ok.pdf'])
    expect(announced()).toBe('brief.pdf Too large')
  })

  it('the next accepted pick empties the hidden status line and drops the refused row', () => {
    render(<FileUpload aria-label="Files" maxFiles={3} maxSize={5 * MB} />)
    pick([fileOf('brief.pdf', 6 * MB)])
    pick([fileOf('ok.pdf')])
    expect([rows(), announced()]).toEqual([['ok.pdf10 bytes'], ''])
  })

  it('a file accept does not take is refused as the wrong type, with a mark of its own', () => {
    render(<FileUpload aria-label="Files" accept="application/pdf" maxFiles={3} />)
    pick([fileOf('notes.txt', 10, 'text/plain')])
    expect(rows()).toEqual(['notes.txtNot an accepted type'])
    expect(sent()).toEqual([])
    expect(document.querySelector('li > span')?.className).toBe('flex shrink-0 text-danger-on-soft')
  })

  it('maxFiles and maxSize are clamped (R-5.7-7): 0 files still keeps one, and 0 bytes still takes a 1-byte file', () => {
    render(<FileUpload aria-label="Files" maxFiles={0} maxSize={0} />)
    pick([fileOf('one.txt', 1), fileOf('two.txt', 1)])
    expect([rows(), sent(), message()]).toEqual([['one.txt1 byte'], ['one.txt'], 'Only 1 file allowed'])
  })

  it('a maxSize over 10 GiB is clamped to it: a file of 11 GiB is too large', () => {
    render(<FileUpload aria-label="Files" maxSize={20 * 1024 * MB} />)
    pick([fileOf('huge.iso', 11 * 1024 * MB)])
    expect(rows()).toEqual(['huge.isoToo large'])
  })

  it('calls onValueChange with the files kept after each change', () => {
    const onValueChange = vi.fn()
    render(<FileUpload aria-label="Files" maxFiles={2} maxSize={MB} onValueChange={onValueChange} />)
    pick([fileOf('a.pdf'), fileOf('big.pdf', 2 * MB)])
    pick([fileOf('b.pdf')])
    expect(onValueChange.mock.calls.map(([files]) => (files as File[]).map((file) => file.name))).toEqual([['a.pdf'], ['a.pdf', 'b.pdf']])
  })
})

describe('a remove', () => {
  it('leaves the other file, fires one input event and no change, and calls onValueChange', () => {
    const onValueChange = vi.fn()
    render(<FileUpload aria-label="Files" maxFiles={3} onValueChange={onValueChange} />)
    pick([fileOf('a.pdf'), fileOf('b.pdf')])
    const heard: string[] = []
    for (const type of ['input', 'change']) inputOf().addEventListener(type, () => { heard.push(type) })
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.pdf' }))
    expect([rows(), sent(), heard]).toEqual([['b.pdf10 bytes'], ['b.pdf'], ['input']])
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'b.pdf' })])
  })

  it('reads "Remove" and the file name, by its own id and the name\'s', () => {
    render(<FileUpload aria-label="Files" />)
    pick([fileOf('brief.pdf')])
    const button = screen.getByRole('button')
    const [own, name] = (button.getAttribute('aria-labelledby') ?? '').split(' ')
    expect([own === button.id, document.getElementById(name ?? '')?.textContent, button.getAttribute('aria-label')]).toEqual([true, 'brief.pdf', 'Remove'])
  })

  it('moves the focus to the next row\'s remove button, then the previous one, then the input', () => {
    render(<FileUpload aria-label="Files" maxFiles={3} />)
    pick([fileOf('a'), fileOf('b'), fileOf('c')])
    fireEvent.click(screen.getByRole('button', { name: 'Remove b' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove c' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove c' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove a' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove a' }))
    expect(document.activeElement).toBe(inputOf())
  })

  it('of a refused row leaves input.files and fires nothing', () => {
    render(<FileUpload aria-label="Files" maxFiles={3} maxSize={MB} />)
    pick([fileOf('a.pdf'), fileOf('big.pdf', 2 * MB)])
    const heard: string[] = []
    inputOf().addEventListener('input', () => { heard.push('input') })
    fireEvent.click(screen.getByRole('button', { name: 'Remove big.pdf' }))
    expect([rows(), sent(), heard, announced()]).toEqual([['a.pdf10 bytes'], ['a.pdf'], [], ''])
  })

  it('disabled disables every remove button', () => {
    const { rerender } = render(<FileUpload aria-label="Files" maxFiles={3} />)
    pick([fileOf('a'), fileOf('b')])
    rerender(<FileUpload aria-label="Files" maxFiles={3} disabled />)
    expect(screen.getAllByRole('button').map((button) => (button as HTMLButtonElement).disabled)).toEqual([true, true])
  })
})

describe('a drop', () => {
  it('a dragover marks the zone, a drop adds the files and fires one input event', () => {
    render(<FileUpload aria-label="Files" maxFiles={3} />)
    pick([fileOf('a.pdf')])
    const heard: string[] = []
    inputOf().addEventListener('input', () => { heard.push('input') })
    fireEvent.dragEnter(zoneOf(), dragOf([]))
    fireEvent.dragOver(zoneOf(), dragOf([]))
    expect(zoneOf().hasAttribute('data-dragging')).toBe(true)
    fireEvent.drop(zoneOf(), dragOf([fileOf('b.pdf'), fileOf('c.pdf')]))
    expect([zoneOf().hasAttribute('data-dragging'), rows(), sent(), heard]).toEqual([false, ['a.pdf10 bytes', 'b.pdf10 bytes', 'c.pdf10 bytes'], ['a.pdf', 'b.pdf', 'c.pdf'], ['input']])
  })

  it('stays marked while the drag moves over a child, and clears when it leaves the zone', () => {
    render(<FileUpload aria-label="Files">Hint</FileUpload>)
    fireEvent.dragEnter(zoneOf(), dragOf([]))
    fireEvent.dragEnter(inputOf(), dragOf([]))
    fireEvent.dragLeave(zoneOf(), dragOf([]))
    expect(zoneOf().hasAttribute('data-dragging')).toBe(true)
    fireEvent.dragLeave(inputOf(), dragOf([]))
    expect(zoneOf().hasAttribute('data-dragging')).toBe(false)
  })

  it('a drag of text is not a drop of files: the zone stays as it is and the drop is left to the page', () => {
    render(<FileUpload aria-label="Files" />)
    const text = { dataTransfer: { files: [], types: ['text/plain'] } }
    fireEvent.dragEnter(zoneOf(), text)
    expect(zoneOf().hasAttribute('data-dragging')).toBe(false)
    expect(fireEvent.drop(zoneOf(), text)).toBe(true)
  })

  it('disabled: never marked, the drop is prevented so the page does not open the file, and nothing is added', () => {
    render(<FileUpload aria-label="Files" disabled />)
    fireEvent.dragEnter(zoneOf(), dragOf([]))
    expect(zoneOf().hasAttribute('data-dragging')).toBe(false)
    expect(fireEvent.drop(zoneOf(), dragOf([fileOf('a.pdf')]))).toBe(false)
    expect([rows(), sent()]).toEqual([[], []])
  })
})

describe('the list', () => {
  it('sixty files with maxFiles 100: sixty rows, each name in its own direction and truncated', () => {
    render(<FileUpload aria-label="Files" maxFiles={100} />)
    pick(Array.from({ length: 60 }, (_, index) => fileOf(`file-${String(index + 1)}.pdf`)))
    expect(rows()).toHaveLength(60)
    const name = document.querySelector('li span[dir="auto"]')
    expect([name?.textContent, name?.className]).toEqual(['file-1.pdf', 'truncate min-w-0 flex-1 font-medium'])
  })
})
