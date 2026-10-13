import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AccordionItem, AccordionRoot } from '../index.js'
import type { AccordionRootProps } from '../types.js'

/** Three items; the middle one can be disabled. */
function Faq({ disabledItem = false, ...props }: AccordionRootProps & { disabledItem?: boolean }) {
  return (
    <AccordionRoot {...props}>
      <AccordionItem value="one" title="One">First answer.</AccordionItem>
      <AccordionItem value="two" title="Two" disabled={disabledItem}>Second answer.</AccordionItem>
      <AccordionItem value="three" title="Three">Third answer.</AccordionItem>
    </AccordionRoot>
  )
}

const trigger = (name: string) => screen.getByRole('button', { name })
const expanded = () => ['One', 'Two', 'Three'].map((name) => trigger(name).getAttribute('aria-expanded'))
/** The panel of a trigger: the element after its heading. */
const panelOf = (name: string) => trigger(name).parentElement?.nextElementSibling as HTMLElement | null
const shut = (name: string) => panelOf(name)?.hasAttribute('hidden') ?? null

describe('toggling', () => {
  it('starts with every item closed, and every panel in the page but hidden', () => {
    render(<Faq />)
    expect(expanded()).toEqual(['false', 'false', 'false'])
    expect(['One', 'Two', 'Three'].map(shut)).toEqual([true, true, true])
    expect(panelOf('Two')?.textContent).toBe('Second answer.')
  })

  it('a click opens an item: aria-expanded turns true and the panel is shown', async () => {
    render(<Faq />)
    await userEvent.click(trigger('Two'))
    expect(expanded()).toEqual(['false', 'true', 'false'])
    expect(shut('Two')).toBe(false)
    expect(trigger('Two').hasAttribute('data-panel-open')).toBe(true)
    expect(trigger('Two').getAttribute('aria-controls')).toBe(panelOf('Two')?.id)
  })

  it('Enter and Space on the trigger toggle it, as on any button', async () => {
    render(<Faq />)
    trigger('One').focus()
    await userEvent.keyboard('{Enter}')
    expect(expanded()).toEqual(['true', 'false', 'false'])
    await userEvent.keyboard(' ')
    await waitFor(() => { expect(expanded()).toEqual(['false', 'false', 'false']) })
    await userEvent.keyboard(' ')
    expect(expanded()).toEqual(['true', 'false', 'false'])
  })

  it('Tab goes from trigger to trigger, and no arrow key moves the focus: Base UI 1.8.0 dropped its roving focus', async () => {
    render(<Faq />)
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger('One'))
    await userEvent.keyboard('{ArrowDown}{End}')
    expect(document.activeElement).toBe(trigger('One'))
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger('Two'))
  })
})

describe('one at a time, the default', () => {
  it('opening a second item closes the first', async () => {
    render(<Faq defaultValue={['one']} />)
    expect(expanded()).toEqual(['true', 'false', 'false'])
    await userEvent.click(trigger('Three'))
    expect(expanded()).toEqual(['false', 'false', 'true'])
    await waitFor(() => { expect(shut('One')).toBe(true) })
  })

  it('pressing the trigger of the open item closes it, leaving none open', async () => {
    render(<Faq defaultValue={['one']} />)
    await userEvent.click(trigger('One'))
    expect(expanded()).toEqual(['false', 'false', 'false'])
    await waitFor(() => { expect(shut('One')).toBe(true) })
  })
})

describe('multiple', () => {
  it('opening one item leaves the others as they were', async () => {
    render(<Faq multiple defaultValue={['one']} />)
    await userEvent.click(trigger('Three'))
    expect(expanded()).toEqual(['true', 'false', 'true'])
    await userEvent.click(trigger('One'))
    expect(expanded()).toEqual(['false', 'false', 'true'])
  })
})

describe('disabled', () => {
  it('a disabled item ignores a click and a key, and still takes the focus', async () => {
    render(<Faq disabledItem />)
    await userEvent.click(trigger('Two'))
    trigger('Two').focus()
    expect(document.activeElement).toBe(trigger('Two'))
    await userEvent.keyboard('{Enter}')
    expect(expanded()).toEqual(['false', 'false', 'false'])
    expect(trigger('Two').getAttribute('aria-disabled')).toBe('true')
    expect(trigger('One').getAttribute('aria-disabled')).toBe('false')
  })

  it('disabled on the root disables every item', async () => {
    render(<Faq disabled />)
    await userEvent.click(trigger('One'))
    await userEvent.click(trigger('Three'))
    expect(expanded()).toEqual(['false', 'false', 'false'])
    expect(['One', 'Two', 'Three'].map((name) => trigger(name).getAttribute('aria-disabled'))).toEqual(['true', 'true', 'true'])
  })
})

describe('controlled', () => {
  it('reports the next value and the reason, and opens nothing by itself', async () => {
    const onValueChange = vi.fn()
    render(<Faq value={['one']} onValueChange={onValueChange} />)
    await userEvent.click(trigger('Two'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0]?.[0]).toEqual(['two'])
    expect((onValueChange.mock.calls[0]?.[1] as { reason: string }).reason).toBe('trigger-press')
    expect(expanded()).toEqual(['true', 'false', 'false'])
  })

  it('follows the value it is given', () => {
    const { rerender } = render(<Faq value={['one']} />)
    rerender(<Faq value={['three']} />)
    expect(expanded()).toEqual(['false', 'false', 'true'])
  })
})

// What the browser does when find-in-page, a text fragment or a #hash lands inside a closed panel.
describe('a panel the browser opens by itself', () => {
  it('beforematch on a closed panel opens its item, so the trigger and the caret follow', async () => {
    const onValueChange = vi.fn()
    render(<Faq onValueChange={onValueChange} />)
    panelOf('Three')?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    await waitFor(() => { expect(expanded()).toEqual(['false', 'false', 'true']) })
    expect(trigger('Three').hasAttribute('data-panel-open')).toBe(true)
    expect(onValueChange.mock.calls[0]?.[0]).toEqual(['three'])
    expect((onValueChange.mock.calls[0]?.[1] as { reason: string }).reason).toBe('none')
  })

  it('it closes the item that was open, as a press would', async () => {
    render(<Faq defaultValue={['one']} />)
    panelOf('Three')?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    await waitFor(() => { expect(expanded()).toEqual(['false', 'false', 'true']) })
  })

  it('one press of its trigger then closes it again: the state was never a step behind', async () => {
    render(<Faq />)
    panelOf('Two')?.dispatchEvent(new Event('beforematch', { bubbles: true }))
    await waitFor(() => { expect(expanded()).toEqual(['false', 'true', 'false']) })
    await userEvent.click(trigger('Two'))
    expect(expanded()).toEqual(['false', 'false', 'false'])
  })
})

describe('hiddenUntilFound={false}', () => {
  it('leaves a closed panel out of the page, and mounts it when its item opens', async () => {
    render(<Faq hiddenUntilFound={false} />)
    expect(panelOf('Two')).toBeNull()
    expect(screen.queryByText('Second answer.')).toBeNull()
    await userEvent.click(trigger('Two'))
    expect(panelOf('Two')?.textContent).toBe('Second answer.')
  })
})
