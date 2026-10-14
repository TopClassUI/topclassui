import { render, screen } from '@testing-library/react'
import { createElement, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'
import type { DropdownTriggerProps } from '../types.js'

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

function trigger(props: DropdownTriggerProps) {
  render(
    <DropdownRoot>
      <DropdownTrigger {...props} />
      <DropdownPopup><DropdownItem>Rename</DropdownItem></DropdownPopup>
    </DropdownRoot>,
  )
  return screen.getByRole('button')
}

const classes = (element: Element) => (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).sort()

describe('a trigger className replaces a conflicting class of a Button rendered on the server', () => {
  for (const [form, element] of FORMS) {
    it(`${form}: the background and the height are the caller's, not Button's`, () => {
      const list = classes(trigger({ className: 'bg-danger-solid h-control-sm', render: element('Actions') }))
      expect(list).toContain('bg-danger-solid')
      expect(list).toContain('h-control-sm')
      expect(list).not.toContain('bg-primary-solid')
      expect(list).not.toContain('h-control-md')
    })

    it(`${form}: the label keeps the truncating span Button wrapped it in`, () => {
      expect(trigger({ render: element('Actions') }).innerHTML).toBe('<span class="truncate min-w-0">Actions</span>')
    })
  }

  it('replaces a conflicting class written on a host render element, and keeps one that conflicts with nothing', () => {
    expect(classes(trigger({ className: 'px-4 ms-2', render: <button type="button" className="px-2">Open</button> }))).toEqual(['ms-2', 'px-4'])
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

  it('still opens a menu, since the merged element is the one Base UI wires up', () => {
    const button = trigger({ className: 'px-4', render: lazy(serverButton('Actions')) })
    expect(button.getAttribute('aria-haspopup')).toBe('menu')
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })
})

// Called by hand, a Button with no label keeps a children key that holds nothing; Flight would have deleted it.
describe('a label left on the part survives a Button that ran on the server with none of its own', () => {
  for (const [form, bare] of [
    ['called by hand, as a host element', () => Button({})],
    ['called by hand, in a lazy wrapper', () => lazy(Button({}))],
    ['as Flight delivers it, with its empty keys deleted', () => delivered(Button({}))],
  ] as const) {
    it(`${form}: the button keeps the text, bare, which is its only name`, () => {
      expect(trigger({ render: bare(), children: 'Actions' }).innerHTML).toBe('Actions')
    })
  }

  it('a label left on the part reaches a Button written in a client file, which wraps it itself', () => {
    expect(trigger({ render: <Button />, children: 'Actions' }).innerHTML).toBe('<span class="truncate min-w-0">Actions</span>')
  })
})

// A Button that is not disabled writes no disabled key, so nothing crosses Flight to outrank the part's own.
describe('disabled on the part, around a Button that ran on the server', () => {
  const state = (button: HTMLButtonElement) => ({ native: button.disabled, marked: button.hasAttribute('data-disabled') })

  for (const [form, built] of [
    ['as Flight delivers it', () => delivered(Button({}))],
    ['in a lazy wrapper', () => lazy(delivered(Button({})))],
  ] as const) {
    it(`${form}: natively disabled and marked, so it leaves the tab order and opens nothing`, () => {
      const button = trigger({ disabled: true, render: built(), children: 'Actions' }) as HTMLButtonElement
      expect(state(button)).toEqual({ native: true, marked: true })
      button.click()
      expect(screen.queryByRole('menu')).toBeNull()
    })
  }

  it('a part that is not disabled leaves a server-built Button enabled, and unmarked', () => {
    const button = trigger({ render: delivered(Button({})), children: 'Actions' }) as HTMLButtonElement
    expect(state(button)).toEqual({ native: false, marked: false })
  })

  it('a Button that was built disabled stays so, whatever the part says: its own true crosses whole', () => {
    const button = trigger({ render: delivered(Button({ disabled: true, children: 'Actions' })) }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
