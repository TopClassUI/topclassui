import { render, screen } from '@testing-library/react'
import { createElement, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { linkSimple } from '#icons/data/link-simple.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipTriggerProps } from '../types.js'

/** What a Server Component hands over: Button has already run, so render is a host button. */
const serverButton = (label: string) => Button({ 'aria-label': label })

/** How Flight delivers that element to a client file: a lazy wrapper with no props of its own. */
const lazy = (element: ReactElement) =>
  ({ $$typeof: Symbol.for('react.lazy'), _payload: element, _init: (p: ReactElement) => p }) as unknown as ReactElement

function trigger(props: TooltipTriggerProps) {
  render(
    <TooltipRoot>
      <TooltipTrigger {...props} />
      <TooltipPopup>Copy link</TooltipPopup>
    </TooltipRoot>,
  )
  return screen.getByRole('button', { name: 'Copy link' })
}

/** Which icon each svg draws, read from the start of its path: M136 is the spinner, M165 link-simple. */
const drawn = (element: Element) =>
  [...element.querySelectorAll('svg path')].map((path) => (path.getAttribute('d') ?? '').slice(0, 10))

/** A loading Button that already ran on the server, with the icon written inside it. */
const loadingButton = () => Button({ loading: true, 'aria-label': 'Copy link', children: <Svg icon={linkSimple} /> })

const classes = (element: Element) => (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).sort()

describe('a trigger className replaces a conflicting class of a Button rendered on the server', () => {
  for (const [form, element] of [['as a host element', serverButton], ['in a lazy wrapper', (l: string) => lazy(serverButton(l))]] as const) {
    it(`${form}: the background and the height are the caller's, not Button's`, () => {
      const list = classes(trigger({ className: 'bg-danger-solid h-control-sm', render: element('Copy link') }))
      expect(list).toContain('bg-danger-solid')
      expect(list).toContain('h-control-sm')
      expect(list).not.toContain('bg-primary-solid')
      expect(list).not.toContain('h-control-md')
    })
  }

  it('replaces a conflicting class written on a host render element', () => {
    const element = trigger({ className: 'px-4', render: <button type="button" aria-label="Copy link" className="px-2" /> })
    expect(classes(element)).toEqual(['px-4'])
  })

  it('replaces it inside a lazy wrapper too', () => {
    const element = trigger({ className: 'px-4', render: lazy(<button type="button" aria-label="Copy link" className="px-2" />) })
    expect(classes(element)).toEqual(['px-4'])
  })

  it('keeps a class that conflicts with nothing beside the one on the render element', () => {
    const element = trigger({ className: 'ms-2', render: <button type="button" aria-label="Copy link" className="px-2" /> })
    expect(classes(element)).toEqual(['ms-2', 'px-2'])
  })

  it('leaves the class on the render element alone when no className is given', () => {
    expect(classes(trigger({ render: lazy(<button type="button" aria-label="Copy link" className="px-2" />) }))).toEqual(['px-2'])
  })

  it('still hands the className to the function form of render', () => {
    const element = trigger({ className: 'px-4', render: (props) => <button {...props} type="button" aria-label="Copy link" /> })
    expect(classes(element)).toEqual(['px-4'])
  })

  it('keeps the ref written on the render element when it merges the class', () => {
    const ref = { current: null as HTMLButtonElement | null }
    const element = trigger({ className: 'px-4', render: <button ref={ref} type="button" aria-label="Copy link" /> })
    expect(ref.current).toBe(element)
  })
})

describe('an icon inside the loading Button passed to render is drawn beside its spinner', () => {
  for (const [form, element] of [
    ['written in a client file', () => <Button loading aria-label="Copy link"><Svg icon={linkSimple} /></Button>],
    ['rendered on the server, as a host element', loadingButton],
    ['rendered on the server, in a lazy wrapper', () => lazy(loadingButton())],
  ] as const) {
    it(form, () => {
      expect(drawn(trigger({ render: element() }))).toEqual(['M136,32V64', 'M165.66,90'])
    })
  }

  it('an icon left on the trigger reaches a loading Button written in a client file', () => {
    const element = trigger({ render: <Button loading aria-label="Copy link" />, children: <Svg icon={linkSimple} /> })
    expect(drawn(element)).toEqual(['M136,32V64', 'M165.66,90'])
  })

  it('an icon left on the trigger is replaced by the spinner of a loading Button rendered on the server', () => {
    const element = trigger({ render: Button({ loading: true, 'aria-label': 'Copy link' }), children: <Svg icon={linkSimple} /> })
    expect(drawn(element)).toEqual(['M136,32V64'])
  })
})

/** As the Flight client of React 19.3.0 delivers an element: a key whose value is undefined is deleted on the way. */
const delivered = (element: ReactElement) =>
  createElement(element.type, Object.fromEntries(Object.entries(element.props as object).filter(([, value]) => value !== undefined)))

// Called by hand, a Button with no label keeps a children key that holds nothing; Flight would have deleted it.
describe('a label left on the trigger survives a Button that ran with none of its own', () => {
  for (const [form, bare] of [
    ['called by hand, as a host element', () => Button({})],
    ['called by hand, in a lazy wrapper', () => lazy(Button({}))],
    ['as Flight delivers it, with its empty keys deleted', () => delivered(Button({}))],
  ] as const) {
    it(`${form}: the button keeps the text, which is its only name`, () => {
      expect(trigger({ render: bare(), children: 'Copy link' }).innerHTML).toBe('Copy link')
    })

    it(`${form}: it keeps the text beside a className as well`, () => {
      const button = trigger({ render: bare(), className: 'h-control-sm', children: 'Copy link' })
      expect(button.innerHTML).toBe('Copy link')
      expect(classes(button)).toContain('h-control-sm')
      expect(classes(button)).not.toContain('h-control-md')
    })
  }

  it('reaches the function form as it always did', () => {
    const button = trigger({ render: (props) => <button {...props} type="button" />, children: 'Copy link' })
    expect(button.innerHTML).toBe('Copy link')
  })

  it('a Button rendered with a label of its own keeps that one, in the span it wrapped it in', () => {
    const button = trigger({ render: Button({ children: 'Copy link' }), children: 'Another label' })
    expect(button.innerHTML).toBe('<span class="truncate min-w-0">Copy link</span>')
  })

  it('a Button written in a client file with a label of its own keeps that one too: the element wins in Base UI', () => {
    const button = trigger({ render: <Button>Copy link</Button>, children: 'Another label' })
    expect(button.innerHTML).toBe('<span class="truncate min-w-0">Copy link</span>')
  })
})

// Base UI's tooltip trigger never writes the attribute: disabled there switches the tooltip off, not the control.
describe('disabled on the trigger, around a Button that ran on the server', () => {
  const state = (button: HTMLElement) => ({
    native: (button as HTMLButtonElement).disabled,
    tooltipOff: button.hasAttribute('data-trigger-disabled'),
  })

  for (const [form, built] of [
    ['written in a client file', () => <Button aria-label="Copy link" />],
    ['as Flight delivers it', () => delivered(Button({ 'aria-label': 'Copy link' }))],
    ['in a lazy wrapper', () => lazy(delivered(Button({ 'aria-label': 'Copy link' })))],
  ] as const) {
    it(`${form}: the tooltip is off and the Button stays a working button, the same in all three`, () => {
      expect(state(trigger({ disabled: true, render: built() }))).toEqual({ native: false, tooltipOff: true })
    })

    it(`${form}: with nothing disabled the Button carries no disabled attribute and no mark`, () => {
      const button = trigger({ render: built() })
      expect(state(button)).toEqual({ native: false, tooltipOff: false })
      expect([button.hasAttribute('disabled'), button.hasAttribute('data-disabled')]).toEqual([false, false])
    })
  }

  it('to disable the control itself, disabled goes on the Button: it crosses whole, with the mark that dims it', () => {
    const button = trigger({ render: delivered(Button({ 'aria-label': 'Copy link', disabled: true })) })
    expect(state(button)).toEqual({ native: true, tooltipOff: false })
    expect(button.hasAttribute('data-disabled')).toBe(true)
  })

  it('a server-built Button hands the trigger no disabled key at all, where it used to hand it false', () => {
    const props = delivered(Button({ 'aria-label': 'Copy link' })).props as Record<string, unknown>
    expect('disabled' in props).toBe(false)
  })
})
