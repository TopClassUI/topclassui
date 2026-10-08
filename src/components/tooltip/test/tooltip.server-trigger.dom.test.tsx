import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
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
