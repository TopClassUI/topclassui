import type { Dialog } from '@base-ui/react/dialog'
import type { Drawer } from '@base-ui/react/drawer'
import type { Menu } from '@base-ui/react/menu'
import type { Popover } from '@base-ui/react/popover'
import type { Tooltip } from '@base-ui/react/tooltip'
import { isValidElement, type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { renderTrigger } from './render-trigger.js'

/** How Flight delivers an element built in a Server Component: a lazy wrapper with no props of its own. */
const lazy = (element: ReactElement) =>
  ({ $$typeof: Symbol.for('react.lazy'), _payload: element, _init: (p: ReactElement) => p }) as unknown as ReactElement

const html = (render: unknown) => renderToStaticMarkup(render as ReactElement)

describe('an element with a className of its own', () => {
  it('lets the trigger className replace the class it conflicts with', () => {
    const out = renderTrigger(<button type="button" className="px-2" />, 'px-4')
    expect(html(out.render)).toBe('<button type="button" class="px-4"></button>')
  })

  it('keeps both where nothing conflicts, the trigger className last', () => {
    const out = renderTrigger(<button type="button" className="px-2" />, 'ms-2')
    expect(html(out.render)).toBe('<button type="button" class="px-2 ms-2"></button>')
  })

  it('merges with our cn(), which knows a control height from a control height', () => {
    const out = renderTrigger(<a href="/docs" className="h-control-md underline" />, 'h-control-sm')
    expect(html(out.render)).toBe('<a href="/docs" class="underline h-control-sm"></a>')
  })

  it('hands back no className, or Base UI would write the class a second time', () => {
    const out = renderTrigger(<button type="button" className="px-2" />, 'px-4')
    expect(out.className).toBeUndefined()
  })

  it('returns a copy and leaves the element it was given as it was', () => {
    const given = <button type="button" className="px-2" />
    const out = renderTrigger(given, 'px-4')
    expect(out.render).not.toBe(given)
    expect(given.props).toEqual({ type: 'button', className: 'px-2' })
  })

  it('keeps every other prop of the element: its ref, its handler and its children', () => {
    const ref = { current: null }
    const onClick = () => undefined
    const out = renderTrigger(<button ref={ref} onClick={onClick} className="px-2">Save</button>, 'px-4')
    expect((out.render as ReactElement).props).toEqual({ ref, onClick, className: 'px-4', children: 'Save' })
  })
})

describe('an element with no className', () => {
  it('takes the trigger className as its only class', () => {
    const out = renderTrigger(<button type="button" />, 'px-4')
    expect(html(out.render)).toBe('<button type="button" class="px-4"></button>')
    expect(out.className).toBeUndefined()
  })
})

describe('an element built in a Server Component, which arrives in a lazy wrapper', () => {
  it('is unwrapped, so the className replaces a conflicting class and is not only appended', () => {
    const out = renderTrigger(lazy(<button type="button" className="px-2" />), 'px-4')
    expect(isValidElement(out.render)).toBe(true)
    expect(html(out.render)).toBe('<button type="button" class="px-4"></button>')
    expect(out.className).toBeUndefined()
  })

  it('is unwrapped when it has no className either', () => {
    const out = renderTrigger(lazy(<button type="button" />), 'px-4')
    expect(html(out.render)).toBe('<button type="button" class="px-4"></button>')
    expect(out.className).toBeUndefined()
  })
})

describe('with nothing to merge, both come back as given', () => {
  it('a function form is the same function, and the className is left for Base UI to apply', () => {
    const fn = (props: object) => <button {...props} type="button" />
    const out = renderTrigger(fn, 'px-4')
    expect(out.render).toBe(fn)
    expect(out.className).toBe('px-4')
  })

  it('no render at all stays undefined, and the className is left for the part own button', () => {
    expect(renderTrigger(undefined, 'px-4')).toEqual({ render: undefined, className: 'px-4' })
  })

  it('an element with no className to add is the very element, not a copy', () => {
    const given = <button type="button" className="px-2" />
    const out = renderTrigger(given, undefined)
    expect(out.render).toBe(given)
    expect(out.className).toBeUndefined()
  })

  it('an element with no class and no className to add gains no class attribute', () => {
    expect(html(renderTrigger(<button type="button" />, undefined).render)).toBe('<button type="button"></button>')
  })

  it('a lazy wrapper with no className to add stays wrapped, since nothing needs its props', () => {
    const given = lazy(<button type="button" className="px-2" />)
    expect(renderTrigger(given, undefined).render).toBe(given)
  })

  it('neither a render nor a className is neither', () => {
    expect(renderTrigger(undefined, undefined)).toEqual({ render: undefined, className: undefined })
  })
})

describe('the result fits the trigger of each overlay that calls it', () => {
  type Rendered<Render> = ReturnType<typeof renderTrigger<Render>>['render']

  it('is the render type of the Base UI 1.8.0 part, unchanged, for all five', () => {
    expectTypeOf<Rendered<Tooltip.Trigger.Props['render']>>().toEqualTypeOf<Tooltip.Trigger.Props['render']>()
    expectTypeOf<Rendered<Dialog.Trigger.Props['render']>>().toEqualTypeOf<Dialog.Trigger.Props['render']>()
    expectTypeOf<Rendered<Drawer.Trigger.Props['render']>>().toEqualTypeOf<Drawer.Trigger.Props['render']>()
    expectTypeOf<Rendered<Popover.Trigger.Props['render']>>().toEqualTypeOf<Popover.Trigger.Props['render']>()
    expectTypeOf<Rendered<Menu.Trigger.Props['render']>>().toEqualTypeOf<Menu.Trigger.Props['render']>()
  })

  it('is a string className or none, never the state function Base UI also takes', () => {
    expectTypeOf(renderTrigger(undefined, 'px-4').className).toEqualTypeOf<string | undefined>()
  })
})
