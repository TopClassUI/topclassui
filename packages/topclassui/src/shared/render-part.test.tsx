import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { renderPart } from './render-trigger.js'

/** How Flight delivers an element built in a Server Component: a lazy wrapper with no props of its own. */
const lazy = (element: ReactElement) =>
  ({ $$typeof: Symbol.for('react.lazy'), _payload: element, _init: (p: ReactElement) => p }) as unknown as ReactElement

const html = (render: unknown) => renderToStaticMarkup(render as ReactElement)

describe('renderPart', () => {
  it("puts the element's own class after the part's finished class, so it wins a conflict", () => {
    const out = renderPart(<h3 className="text-lg" />, 'text-base font-semibold')
    expect(html(out.render)).toBe('<h3 class="font-semibold text-lg"></h3>')
    expect(out.className).toBeUndefined()
  })

  it("keeps the part's class on an element written with none", () => {
    expect(html(renderPart(<h3 />, 'text-base').render)).toBe('<h3 class="text-base"></h3>')
  })

  it('unwraps an element Flight hands over lazily', () => {
    expect(html(renderPart(lazy(<p className="text-xs" />), 'text-sm text-muted').render)).toBe('<p class="text-muted text-xs"></p>')
  })

  it('drops a children key that holds nothing, so the part keeps its label', () => {
    const out = renderPart(<h3 className="text-lg">{undefined}</h3>, 'text-base')
    expect(Object.keys((out.render as ReactElement<object>).props)).toEqual(['className'])
  })

  it("hands back nothing or a function form as given, with the part's class beside it", () => {
    const fn = () => <h3 />
    expect(renderPart(undefined, 'text-base')).toEqual({ render: undefined, className: 'text-base' })
    expect(renderPart(fn, 'text-base')).toEqual({ render: fn, className: 'text-base' })
  })
})
