import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { DialogBody, DialogClose, DialogFooter, DialogPopup, DialogRoot, DialogTrigger } from '../index.js'
import type { DialogCloseProps, DialogTriggerProps } from '../types.js'

/** What a Server Component hands over: Button has already run, so render is a host button. */
const serverButton = (label: string) => Button({ children: label })

/** How Flight delivers that element to a client file: a lazy wrapper with no props of its own. */
const lazy = (element: ReactElement) =>
  ({ $$typeof: Symbol.for('react.lazy'), _payload: element, _init: (p: ReactElement) => p }) as unknown as ReactElement

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

// A Button that already ran carries its own children key, empty, and a render element's props win over the part's.
describe('a label left on the part is dropped by a Button rendered on the server', () => {
  it('on the trigger: the button comes out empty, with no name at all', () => {
    const button = trigger({ render: Button({}), children: 'Publish' })
    expect(button.innerHTML).toBe('')
  })

  it('on the close: the same, in a lazy wrapper too', async () => {
    expect((await close({ render: lazy(Button({})), children: 'Cancel' })).innerHTML).toBe('')
  })
})
