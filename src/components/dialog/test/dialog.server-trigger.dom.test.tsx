import { render, screen } from '@testing-library/react'
import { createElement, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { DialogBody, DialogClose, DialogFooter, DialogPopup, DialogRoot, DialogTrigger } from '../index.js'
import type { DialogCloseProps, DialogTriggerProps } from '../types.js'

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

function trigger(props: DialogTriggerProps) {
  render(
    <DialogRoot>
      <DialogTrigger {...props} />
      <DialogPopup><DialogBody>Body</DialogBody></DialogPopup>
    </DialogRoot>,
  )
  return screen.getByRole('button')
}

async function close(props: DialogCloseProps) {
  render(
    <DialogRoot defaultOpen>
      <DialogPopup><DialogFooter><DialogClose {...props} /></DialogFooter></DialogPopup>
    </DialogRoot>,
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
      expect(button.innerHTML).toBe('<span class="truncate min-w-0">Publish</span>')
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

  it('still opens the dialog, since the merged element is the one Base UI wires up', () => {
    const button = trigger({ className: 'px-4', render: lazy(serverButton('Publish')) })
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('a DialogClose className does the same to a Button rendered on the server', () => {
  for (const [form, element] of FORMS) {
    it(`${form}: the height is the caller's, and the label keeps its span`, async () => {
      const button = await close({ className: 'h-control-sm', render: element('Cancel') })
      expect(classes(button)).toContain('h-control-sm')
      expect(classes(button)).not.toContain('h-control-md')
      expect(button.innerHTML).toBe('<span class="truncate min-w-0">Cancel</span>')
    })
  }

  it('a label left on the close reaches a Button written in a client file, which wraps it itself', async () => {
    const button = await close({ render: <Button />, children: 'Cancel' })
    expect(button.innerHTML).toBe('<span class="truncate min-w-0">Cancel</span>')
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
    expect(trigger({ render: delivered(Button({ children: 'Publish' })) }).innerHTML).toBe('<span class="truncate min-w-0">Publish</span>')
  })
})

// A Button that ran on the server carries disabled: false, a key Flight keeps, and a render element's props win.
describe('disabled on the part, around a Button that ran on the server', () => {
  const state = (button: HTMLButtonElement) => ({ native: button.disabled, marked: button.hasAttribute('data-disabled') })

  it('a Button written in a client file is disabled natively, and marked', () => {
    expect(state(trigger({ disabled: true, render: <Button />, children: 'Publish' }) as HTMLButtonElement)).toEqual({ native: true, marked: true })
  })

  it('a server-built Button loses the native attribute: it is only marked, so it looks disabled and is announced as enabled', () => {
    const button = trigger({ disabled: true, render: delivered(Button({})), children: 'Publish' }) as HTMLButtonElement
    expect(state(button)).toEqual({ native: false, marked: true })
    expect(button.getAttribute('aria-disabled')).toBeNull()
    // Base UI still refuses the press, so the dialog stays shut.
    button.click()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('the same on the close', async () => {
    expect(state(await close({ disabled: true, render: delivered(Button({})), children: 'Cancel' }))).toEqual({ native: false, marked: true })
  })

  it('written on the Button itself, disabled crosses whole: that is the form to write on a server page', () => {
    const button = trigger({ render: delivered(Button({ disabled: true, children: 'Publish' })) }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
