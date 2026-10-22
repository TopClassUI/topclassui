import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Select } from '../index.js'
import type { SelectProps } from '../types.js'

const ITEMS = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco', disabled: true }]

function Country(props: Partial<SelectProps>) {
  return <Select aria-label="Country" name="country" items={ITEMS} {...props} />
}

const trigger = () => screen.getByRole('combobox')
const hidden = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement

/** Opens the list with a click and picks an option by its text. */
async function choose(label: string) {
  await userEvent.click(trigger())
  await userEvent.click(await screen.findByRole('option', { name: label }))
}

describe('a choice, with Base UI\'s details', () => {
  it('a click on an option calls onValueChange once, with the value and details whose reason is item-press', async () => {
    const onValueChange = vi.fn()
    render(<Country onValueChange={onValueChange} />)
    await choose('Egypt')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toBe('eg')
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({ reason: 'item-press', isCanceled: false })
    await waitFor(() => { expect(trigger().textContent).toBe('Egypt') })
  })

  it('uncontrolled: it starts at defaultValue, and the hidden input follows each choice', async () => {
    const { container } = render(<Country defaultValue="jo" />)
    expect(hidden(container).value).toBe('jo')
    await choose('Egypt')
    expect(hidden(container).value).toBe('eg')
  })

  it('a disabled option is not chosen by a click', async () => {
    const onValueChange = vi.fn()
    const { container } = render(<Country defaultValue="jo" onValueChange={onValueChange} />)
    await choose('Morocco')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(hidden(container).value).toBe('jo')
  })

  it('a disabled option keeps its pointer events for its cursor, and a pointer moving over it takes no highlight', async () => {
    render(<Country defaultValue="jo" />)
    await userEvent.click(trigger())
    const [egypt, morocco] = [await screen.findByRole('option', { name: 'Egypt' }), screen.getByRole('option', { name: 'Morocco' })]
    fireEvent.mouseMove(egypt, { movementX: 1 })
    expect(egypt.hasAttribute('data-highlighted')).toBe(true)
    fireEvent.mouseMove(morocco, { movementX: 1 })
    expect(morocco.hasAttribute('data-highlighted')).toBe(false)
  })

  it('a handler that calls details.cancel() leaves the value as it was, on screen and in the input', async () => {
    const { container } = render(<Country defaultValue="jo" onValueChange={(_next, details) => { details.cancel() }} />)
    await choose('Egypt')
    expect(trigger().textContent).toBe('Jordan')
    expect(hidden(container).value).toBe('jo')
  })
})

describe('controlled', () => {
  it('stays where its owner holds it, and tells the owner what was asked', async () => {
    const onValueChange = vi.fn((next: string | null) => next)
    render(<Country value="jo" onValueChange={onValueChange} />)
    await choose('Egypt')
    expect(onValueChange.mock.calls.map((call) => call[0])).toEqual(['eg'])
    expect(trigger().textContent).toBe('Jordan')
  })

  it('follows its owner, and value={null} empties it', async () => {
    function Owner() {
      const [value, setValue] = useState<string | null>('jo')
      return <><Country value={value} onValueChange={setValue} /><button type="button" onClick={() => { setValue(null) }}>Clear</button></>
    }
    render(<Owner />)
    await choose('Egypt')
    await waitFor(() => { expect(trigger().textContent).toBe('Egypt') })
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(trigger().textContent).toBe('Select')
  })
})

describe('readOnly and disabled do nothing', () => {
  it('readOnly: no option is chosen and no handler runs, and the value stays in the input', async () => {
    const onValueChange = vi.fn()
    const { container } = render(<Country readOnly defaultValue="jo" onValueChange={onValueChange} />)
    await userEvent.click(trigger())
    const egypt = screen.queryByRole('option', { name: 'Egypt' })
    if (egypt) await userEvent.click(egypt)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(trigger().textContent).toBe('Jordan')
    expect(hidden(container).value).toBe('jo')
  })

  it('disabled: a disabled button that opens nothing', async () => {
    render(<Country disabled defaultValue="jo" />)
    expect((trigger() as HTMLButtonElement).disabled).toBe(true)
    await userEvent.click(trigger())
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('what reaches each element', () => {
  it('className merged last on the trigger, so it wins a conflict with its own; the box keeps its own', () => {
    render(<Country className="justify-start" />)
    const classes = trigger().className.split(' ')
    expect(classes.at(-1)).toBe('justify-start')
    expect(classes).not.toContain('justify-between')
    expect(trigger().parentElement?.className).not.toContain('justify-start')
  })

  it('ref is the trigger button, as an object and as a function', () => {
    const held = { current: null as HTMLButtonElement | null }
    let called: HTMLButtonElement | null = null
    render(<><Country ref={held} /><Select aria-label="Other" items={ITEMS} ref={(node) => { called = node }} /></>)
    const [first, second] = screen.getAllByRole('combobox')
    expect(held.current).toBe(first)
    expect(called).toBe(second)
  })

  it('a caller inputRef holds the hidden input, and the hook still holds it: a reset finds the form through it', async () => {
    const input = { current: null as HTMLInputElement | null }
    const { container } = render(<form id="f"><Country inputRef={input} defaultValue="jo" /></form>)
    expect(input.current).toBe(hidden(container))
    await choose('Egypt')
    ;(document.getElementById('f') as HTMLFormElement).reset()
    await waitFor(() => { expect(hidden(container).value).toBe('jo') })
  })

  it('the props of the root never land on the trigger as attributes', () => {
    render(<Country modal={false} highlightItemOnHover={false} autoComplete="country" defaultOpen={false} open={false} onOpenChangeComplete={() => undefined} actionsRef={{ current: null }} />)
    const names = [...trigger().attributes].map((a) => a.name)
    for (const name of ['modal', 'highlightitemonhover', 'autocomplete', 'defaultopen', 'open', 'actionsref', 'name', 'items', 'placement']) {
      expect(names, name).not.toContain(name)
    }
  })
})

describe('the list', () => {
  it('opens under the trigger with every option, the chosen one marked selected and ending in a tick', async () => {
    render(<Country defaultValue="eg" />)
    await userEvent.click(trigger())
    const options = await screen.findAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual(['Jordan', 'Egypt', 'Morocco'])
    expect(options.map((option) => option.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false'])
    expect(options[1]?.querySelector('svg')).not.toBeNull()
    expect(options[2]?.getAttribute('aria-disabled')).toBe('true')
  })

  it('visibleRows sets --tc-list-rows on the list, clamped to 1..20; left out it writes no style', async () => {
    const rows = async (visibleRows: number | undefined) => {
      const { unmount } = render(<Country {...(visibleRows === undefined ? {} : { visibleRows })} />)
      await userEvent.click(trigger())
      const value = (await screen.findByRole('listbox')).style.getPropertyValue('--tc-list-rows')
      unmount()
      return value
    }
    expect([await rows(4), await rows(0), await rows(99), await rows(Number.NaN), await rows(undefined)]).toEqual(['4', '1', '20', '1', ''])
  })

  it('the popup carries its placement and the scope the Escape guard looks for', async () => {
    render(<Country placement="top-end" />)
    await userEvent.click(trigger())
    const popup = (await screen.findByRole('listbox')).parentElement
    expect(popup?.getAttribute('data-placement')).toBe('top-end')
    expect(popup?.getAttribute('data-select')).toMatch(/\S/)
  })
})

describe('the open list is named as its field, never by the value', () => {
  const listName = async () => {
    await userEvent.click(trigger())
    const list = await screen.findByRole('listbox')
    return [list.getAttribute('aria-label'), list.getAttribute('aria-labelledby')]
  }

  it('a <label htmlFor> lends its text to the list', async () => {
    render(<><label htmlFor="c">Country</label><Select id="c" items={ITEMS} defaultValue="jo" /></>)
    expect(await listName()).toEqual(['Country', null])
  })

  it('a label around the Select lends its own text, without the value the trigger shows', async () => {
    render(<label>{'  Where you live  '}<Select id="w" items={ITEMS} defaultValue="jo" /><span>, today</span></label>)
    expect(await listName()).toEqual(['Where you live , today', null])
  })

  it('the label is read again at each open, so a changed label is the name', async () => {
    render(<><label id="l" htmlFor="c">Country</label><Select id="c" items={ITEMS} /></>)
    ;(document.getElementById('l') as HTMLLabelElement).textContent = 'Home country'
    expect(await listName()).toEqual(['Home country', null])
  })

  it('aria-labelledby points the list at the same element, and aria-label is copied', async () => {
    const { unmount } = render(<><h2 id="h">Heading</h2><Select aria-labelledby="h" items={ITEMS} /></>)
    expect(await listName()).toEqual([null, 'h'])
    unmount()
    render(<Country />)
    expect(await listName()).toEqual(['Country', null])
  })
})

