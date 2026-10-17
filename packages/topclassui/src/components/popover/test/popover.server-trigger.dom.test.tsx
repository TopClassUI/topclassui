import { render, screen } from '@testing-library/react'
import { createElement, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { PopoverClose, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverCloseProps, PopoverTriggerProps } from '../types.js'

/** What a Server Component hands over: Button has already run, so render is a host button. */
const serverButton = (label: string) => Button({ children: label })

/** How Flight delivers that element to a client file: a lazy wrapper with no props of its own. */
const lazy = (element: ReactElement) =>
  ({ $$typeof: Symbol.for('react.lazy'), _payload: element, _init: (p: ReactElement) => p }) as unknown as ReactElement

/** As the Flight client of React 19.3.0 delivers an element: a key whose value is undefined is deleted on the way. */
const delivered = (element: ReactElement) =>
  createElement(element.type, Object.fromEntries(Object.entries(element.props as object).filter(([, value]) => value !== undefined)))

const FORMS = [
  ['as a host element', serverButton],
  ['in a lazy wrapper', (label: string) => lazy(serverButton(label))],
] as const

function trigger(props: PopoverTriggerProps) {
  render(
    <PopoverRoot>
      <PopoverTrigger {...props} />
      <PopoverPopup><PopoverTitle>Title</PopoverTitle></PopoverPopup>
    </PopoverRoot>,
  )
  return screen.getByRole('button')
}

async function close(props: PopoverCloseProps) {
  render(
    <PopoverRoot defaultOpen>
      <PopoverPopup><PopoverTitle>Title</PopoverTitle><PopoverClose {...props} /></PopoverPopup>
    </PopoverRoot>,
  )
  return (await screen.findByRole('dialog')).querySelector('button') as HTMLButtonElement
}

const classes = (element: Element) => (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).sort()

describe('a trigger className replaces a conflicting class of a Button rendered on the server', () => {
  for (const [form, element] of FORMS) {
    it(`${form}: the background and the height are the caller's, not Button's`, () => {
      const list = classes(trigger({ className: 'bg-danger-solid h-control-sm', render: element('Publish') }))
      expect(list).toContain('bg-danger-solid')
      expect(list).toContain('h-control-sm')
      expect(list).not.toContain('bg-primary-solid')
      expect(list).not.toContain('h-control-md')
    })

    it(`${form}: the label keeps the truncating span Button wrapped it in`, () => {
      const button = trigger({ render: element('Publish') })
      expect(button.innerHTML).toBe('<span dir="auto" class="truncate min-w-0">Publish</span>')
    })
  }

  it('replaces a conflicting class written on a host render element', () => {
    expect(classes(trigger({ className: 'px-4', render: <button type="button" className="px-2">Open</button> }))).toEqual(['px-4'])
  })

  it('keeps a class that conflicts with nothing beside the one on the render element', () => {
    expect(classes(trigger({ className: 'ms-2', render: <button type="button" className="px-2">Open</button> }))).toEqual(['ms-2', 'px-2'])
  })

  it('leaves the class on the render element alone when no className is given', () => {
    expect(classes(trigger({ render: lazy(<button type="button" className="px-2">Open</button>) }))).toEqual(['px-2'])
  })

  it('still hands the className to the function form of render', () => {
    const button = trigger({ className: 'px-4', render: (props) => <button {...props} type="button">Open</button> })
    expect(classes(button)).toEqual(['px-4'])
  })

  it('keeps the ref written on the render element when it merges the class', () => {
    const ref = { current: null as HTMLButtonElement | null }
    const button = trigger({ className: 'px-4', render: <button ref={ref} type="button">Open</button> })
    expect(ref.current).toBe(button)
  })

  it('still opens the popover, since the merged element is the one Base UI wires up', () => {
    const button = trigger({ className: 'px-4', render: lazy(serverButton('Publish')) })
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('a PopoverClose className does the same to a Button rendered on the server', () => {
  for (const [form, element] of FORMS) {
    it(`${form}: the height is the caller's, and the label keeps its span`, async () => {
      const button = await close({ className: 'h-control-sm', render: element('Cancel') })
      expect(classes(button)).toContain('h-control-sm')
      expect(classes(button)).not.toContain('h-control-md')
      expect(button.innerHTML).toBe('<span dir="auto" class="truncate min-w-0">Cancel</span>')
    })
  }

  it('a label left on the close reaches a Button written in a client file, which wraps it itself', async () => {
    const button = await close({ render: <Button />, children: 'Cancel' })
    expect(button.innerHTML).toBe('<span dir="auto" class="truncate min-w-0">Cancel</span>')
  })
})

// Called by hand, a Button with no label keeps a children key that holds nothing; Flight would have deleted it.
describe('a label left on the part survives a Button that ran on the server with none of its own', () => {
  for (const [form, bare] of [
    ['called by hand, as a host element', () => Button({})],
    ['called by hand, in a lazy wrapper', () => lazy(Button({}))],
    ['as Flight delivers it, with its empty keys deleted', () => delivered(Button({}))],
  ] as const) {
    it(`on the trigger, ${form}: the button keeps the text, bare, which is its only name`, () => {
      expect(trigger({ render: bare(), children: 'Publish' }).innerHTML).toBe('Publish')
    })

    it(`on the close, ${form}: the same, and it is not the x`, async () => {
      const button = await close({ render: bare(), children: 'Cancel' })
      expect(button.innerHTML).toBe('Cancel')
      expect(button.getAttribute('aria-label')).toBeNull()
    })
  }

  it('only the Button that was given the label wraps it in the span that truncates it', () => {
    expect(trigger({ render: delivered(Button({ children: 'Publish' })) }).innerHTML).toBe('<span dir="auto" class="truncate min-w-0">Publish</span>')
  })
})

// A Button that is not disabled writes no disabled key, so nothing crosses Flight to outrank the part's own.
describe('disabled on the part, around a Button that ran on the server', () => {
  const state = (button: HTMLButtonElement) => ({ native: button.disabled, marked: button.hasAttribute('data-disabled') })

  it('a Button written in a client file is disabled natively, and marked', () => {
    expect(state(trigger({ disabled: true, render: <Button />, children: 'Publish' }) as HTMLButtonElement)).toEqual({ native: true, marked: true })
  })

  for (const [form, built] of [
    ['as Flight delivers it', () => delivered(Button({}))],
    ['in a lazy wrapper', () => lazy(delivered(Button({})))],
  ] as const) {
    it(`on the trigger, ${form}: natively disabled and marked, so it leaves the tab order and is announced as unavailable`, () => {
      const button = trigger({ disabled: true, render: built(), children: 'Publish' }) as HTMLButtonElement
      expect(state(button)).toEqual({ native: true, marked: true })
      expect(button.getAttribute('aria-disabled')).toBeNull()
      button.click()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    // Base UI's Popover.Close has no state in 1.8.0, where Dialog.Close has one: it writes no data-disabled.
    it(`on the close, ${form}: natively disabled, which is what styles and silences it, and not marked`, async () => {
      const button = await close({ disabled: true, render: built(), children: 'Cancel' })
      expect(state(button)).toEqual({ native: true, marked: false })
      expect(button.className).toContain('disabled:opacity-50')
    })
  }

  // Not a shape a real app sees: a stand-in for a server-built Button must delete the empty keys, as delivered() does.
  it('called by hand, a Button keeps keys that hold undefined, and those still erase what the part says', () => {
    const button = trigger({ disabled: true, render: Button({}), children: 'Publish' }) as HTMLButtonElement
    expect(state(button)).toEqual({ native: false, marked: false })
  })

  it('a part that is not disabled leaves a server-built Button enabled, and unmarked', () => {
    const button = trigger({ render: delivered(Button({})), children: 'Publish' }) as HTMLButtonElement
    expect(state(button)).toEqual({ native: false, marked: false })
  })

  it('a Button that was built disabled stays so, whatever the part says: its own true crosses whole', () => {
    const button = trigger({ render: delivered(Button({ disabled: true, children: 'Publish' })) }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('and one that was built loading: the part cannot switch a busy button back on', () => {
    const button = trigger({ disabled: false, render: delivered(Button({ loading: true, children: 'Publish' })) }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
