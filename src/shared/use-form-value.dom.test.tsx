import { act, render } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { type FormValueSync, useFormValue } from './use-form-value.js'

/** The hook waits one timeout of 0 after the reset event, so the test waits one more. */
const settle = () => act(() => new Promise((done) => { setTimeout(done, 0) }))

function Box({ value, defaultValue, sync, form }: {
  value?: boolean, defaultValue: boolean, sync?: FormValueSync<boolean>, form?: string,
}) {
  const state = useFormValue({ value, defaultValue, sync })
  return (
    <>
      <input type="checkbox" ref={state.inputRef} form={form} checked={state.value} readOnly />
      <button type="button" onClick={() => { state.setValue(!state.value) }}>toggle</button>
      <span data-shown>{String(state.value)}</span>
    </>
  )
}

function Group({ defaultValue, sync, inside = true, form }: {
  defaultValue: string, sync?: FormValueSync<string>, inside?: boolean, form?: string,
}) {
  const state = useFormValue({ defaultValue, sync })
  return (
    <div role="radiogroup" ref={state.rootRef}>
      {inside ? <input type="text" form={form} value={state.value} readOnly /> : null}
      <button type="button" onClick={() => { state.setValue('picked') }}>pick</button>
      <span data-shown>{state.value}</span>
    </div>
  )
}

const inForm = (children: ReactNode) => <form id="f">{children}</form>
const form = (container: HTMLElement) => container.ownerDocument.getElementById('f') as HTMLFormElement
const shown = (container: HTMLElement) => container.querySelector('[data-shown]')?.textContent
const press = (container: HTMLElement) => { act(() => { container.querySelector('button')?.click() }) }

describe('a reset returns an uncontrolled value to its default', () => {
  it('goes back to the default after the form resets', async () => {
    const { container } = render(inForm(<Box defaultValue={false} />))
    press(container)
    expect(shown(container)).toBe('true')
    form(container).reset()
    await settle()
    expect(shown(container)).toBe('false')
  })

  it('takes the default of the latest render, not the first one', async () => {
    const { container, rerender } = render(inForm(<Box defaultValue={false} />))
    rerender(inForm(<Box defaultValue />))
    expect(shown(container)).toBe('false')
    form(container).reset()
    await settle()
    expect(shown(container)).toBe('true')
  })

  it('hands sync the default and the input, so a checked box is written back', async () => {
    const sync = vi.fn()
    const { container } = render(inForm(<Box defaultValue={false} sync={sync} />))
    press(container)
    form(container).reset()
    await settle()
    expect(sync).toHaveBeenCalledOnce()
    expect(sync).toHaveBeenCalledWith(false, container.querySelector('input'), null)
  })

  it('finds a form named by the form attribute, from outside it', async () => {
    const { container } = render(<><form id="f" /><Box defaultValue={false} form="f" /></>)
    press(container)
    form(container).reset()
    await settle()
    expect(shown(container)).toBe('false')
  })
})

describe('a controlled value', () => {
  it('stays through a reset, and sync gets the value its owner holds', async () => {
    const sync = vi.fn()
    const { container } = render(inForm(<Box value defaultValue={false} sync={sync} />))
    press(container)
    expect(shown(container)).toBe('true')
    form(container).reset()
    await settle()
    expect(shown(container)).toBe('true')
    expect(sync).toHaveBeenCalledWith(true, container.querySelector('input'), null)
  })
})

describe('a root instead of an input', () => {
  it('finds the form through the first input inside the root, and hands sync the root', async () => {
    const sync = vi.fn()
    const { container } = render(inForm(<Group defaultValue="first" sync={sync} />))
    press(container)
    expect(shown(container)).toBe('picked')
    form(container).reset()
    await settle()
    expect(shown(container)).toBe('first')
    expect(sync).toHaveBeenCalledWith('first', null, container.querySelector('[role="radiogroup"]'))
  })

  it('finds a form that the input inside the root names from outside it', async () => {
    const { container } = render(<><form id="f" /><Group defaultValue="first" form="f" /></>)
    press(container)
    form(container).reset()
    await settle()
    expect(shown(container)).toBe('first')
  })

  it('finds the closest form when the root holds no input yet', async () => {
    const { container } = render(inForm(<Group defaultValue="first" inside={false} />))
    press(container)
    form(container).reset()
    await settle()
    expect(shown(container)).toBe('first')
  })
})

describe('what it does not listen to', () => {
  it('removes its listener on unmount', async () => {
    const sync = vi.fn()
    const page = document.createElement('form')
    document.body.appendChild(page)
    const { unmount } = render(<Box defaultValue={false} sync={sync} />, { container: page })
    unmount()
    page.reset()
    await settle()
    expect(sync).not.toHaveBeenCalled()
    page.remove()
  })

  it('adds no listener when there is no form, and another form resetting does nothing', async () => {
    const sync = vi.fn()
    const { container } = render(<><Box defaultValue={false} sync={sync} /><form id="f" /></>)
    press(container)
    form(container).reset()
    await settle()
    expect(shown(container)).toBe('true')
    expect(sync).not.toHaveBeenCalled()
  })

  it('ignores a reset event whose target is not the form', async () => {
    const sync = vi.fn()
    const { container } = render(inForm(<Box defaultValue={false} sync={sync} />))
    press(container)
    container.querySelector('input')?.dispatchEvent(new Event('reset', { bubbles: true }))
    await settle()
    expect(shown(container)).toBe('true')
    expect(sync).not.toHaveBeenCalled()
  })

  it('keeps the value when the reset is cancelled, as the browser keeps the inputs', async () => {
    const sync = vi.fn()
    const { container } = render(inForm(<Box defaultValue={false} sync={sync} />))
    press(container)
    form(container).addEventListener('reset', (event) => { event.preventDefault() })
    form(container).dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }))
    await settle()
    expect(shown(container)).toBe('true')
    expect(sync).not.toHaveBeenCalled()
  })
})
