import { useRender } from '@base-ui/react/use-render'
import type { ReactElement, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { renderTrigger } from './render-trigger.js'

/** How Flight delivers an element built in a Server Component: a lazy wrapper with no props of its own. */
const lazy = (element: ReactElement) =>
  ({ $$typeof: Symbol.for('react.lazy'), _payload: element, _init: (p: ReactElement) => p }) as unknown as ReactElement

interface PartProps { render?: useRender.RenderProp | undefined, className?: string | undefined, children?: ReactNode }

/** A part as Base UI builds every one of them: its own props, the label among them, under the render element's. */
function Part({ render, className, children }: PartProps) {
  const trigger = renderTrigger(render, className)
  return useRender({ render: trigger.render, props: { className: trigger.className, children }, defaultTagName: 'button' })
}

const html = (element: ReactElement) => renderToStaticMarkup(element)
const props = (render: unknown) => (render as ReactElement<Record<string, unknown>>).props

// Written as {undefined}: the key is there and holds nothing, as on a Button called with no label.
describe('a render element whose children key holds nothing does not erase the label left on the part', () => {
  it('as an element', () => {
    expect(html(<Part render={<button type="button">{undefined}</button>}>Publish</Part>))
      .toBe('<button type="button">Publish</button>')
  })

  it('in a lazy wrapper', () => {
    expect(html(<Part render={lazy(<button type="button">{undefined}</button>)}>Publish</Part>))
      .toBe('<button type="button">Publish</button>')
  })

  it('with a className to merge in the same pass, as an element and in a lazy wrapper', () => {
    const written = <button type="button" className="px-2">{undefined}</button>
    expect(html(<Part render={written} className="px-4">Publish</Part>)).toBe('<button type="button" class="px-4">Publish</button>')
    expect(html(<Part render={lazy(written)} className="px-4">Publish</Part>)).toBe('<button type="button" class="px-4">Publish</button>')
  })

  it('comes back with no children key at all, which cloneElement alone could never remove', () => {
    const out = renderTrigger(<button type="button">{undefined}</button>, undefined)
    expect(props(out.render)).toEqual({ type: 'button' })
    expect('children' in props(out.render)).toBe(false)
    expect(out.className).toBeUndefined()
  })

  it('keeps the key, the ref, the handler and the type of the element it rebuilds', () => {
    const ref = { current: null }
    const onClick = () => undefined
    const out = renderTrigger(<a key="docs" ref={ref} onClick={onClick} href="/docs">{undefined}</a>, 'px-4')
    expect((out.render as ReactElement).type).toBe('a')
    expect((out.render as ReactElement).key).toBe('docs')
    expect(props(out.render)).toEqual({ ref, onClick, href: '/docs', className: 'px-4' })
  })

  it('leaves the element it was given as it was', () => {
    const given = <button type="button">{undefined}</button>
    renderTrigger(given, 'px-4')
    expect(given.props).toEqual({ type: 'button', children: undefined })
  })
})

describe('a render element with children of its own keeps them, because in Base UI the element own props win', () => {
  it('over a label left on the part', () => {
    expect(html(<Part render={<button type="button">Inside</button>}>Outside</Part>)).toBe('<button type="button">Inside</button>')
  })

  it('in a lazy wrapper and beside a className too', () => {
    expect(html(<Part render={lazy(<button type="button">Inside</button>)} className="px-4">Outside</Part>))
      .toBe('<button type="button" class="px-4">Inside</button>')
  })

  it('and is the very element when there is no className, not a rebuilt one', () => {
    const given = <button type="button">Inside</button>
    expect(renderTrigger(given, undefined).render).toBe(given)
  })

  it('null is a value the element chose, so only undefined counts as holding nothing', () => {
    expect(html(<Part render={<button type="button">{null}</button>}>Publish</Part>)).toBe('<button type="button"></button>')
  })
})

describe('the other forms carry the label as they always did', () => {
  it('an element with no children key, which is how Flight delivers one: the very element, and the label', () => {
    const given = <button type="button" />
    expect(renderTrigger(given, undefined).render).toBe(given)
    expect(html(<Part render={given}>Publish</Part>)).toBe('<button type="button">Publish</button>')
  })

  it('the function form, which receives the label among its props', () => {
    expect(html(<Part render={(given) => <button {...given} type="button" />}>Publish</Part>))
      .toBe('<button type="button">Publish</button>')
  })

  it('no render at all, where the part own button takes it', () => {
    expect(html(<Part>Publish</Part>)).toBe('<button type="button">Publish</button>')
  })
})
