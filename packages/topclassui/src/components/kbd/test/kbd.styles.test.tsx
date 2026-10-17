import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Kbd } from '../index.js'
import type { KbdProps } from '../types.js'

const classes = (props: KbdProps = {}) => classList(markup(<Kbd {...props}>K</Kbd>))

/** The Build this list, written out; the last two are BORDER_STRONG. */
const KEYCAP = [
  'inline-flex', 'items-center', 'justify-center', 'rounded-chip', 'bg-surface',
  'px-1.5', 'py-0.5', 'font-mono', 'text-xs', 'text-body',
  'border-(length:--tc-line-width)', 'border-line-strong',
]

describe('the keycap', () => {
  it('emits exactly the classes the spec lists, so a missing or an extra one fails', () => {
    expect(classes().sort()).toEqual([...KEYCAP].sort())
  })

  it('strokes with the control boundary, which reaches 3:1, not the decorative line', () => {
    const list = classes()
    expect(list).toContain('border-(length:--tc-line-width)')
    expect(list).toContain('border-line-strong')
    expect(list).not.toContain('border-line')
  })

  it('takes the smallest type step and the padding under the drawn 3 / 7', () => {
    const list = classes()
    expect(list.filter((c) => /^(text-(xs|sm|base|lg)|p[xy]?-)/.test(c)).sort())
      .toEqual(['px-1.5', 'py-0.5', 'text-xs'])
  })

  it('is not interactive, so it carries no ring, hover, transition or touch target', () => {
    const interactive = /^(hover:|active:|focus-visible:|outline-|transition|duration-|min-[hw]-|disabled:|data-disabled:|cursor-)/
    expect(classes().filter((c) => interactive.test(c))).toEqual([])
  })
})

describe('className', () => {
  it('keeps a consumer utility', () => {
    expect(classes({ className: 'ms-2' })).toContain('ms-2')
  })

  it('lets the consumer replace the radius, because it is passed last', () => {
    const list = classes({ className: 'rounded-box' })
    expect(list).toContain('rounded-box')
    expect(list).not.toContain('rounded-chip')
  })

  it('lets the consumer replace the fill, for a key that sits on a surface already', () => {
    const list = classes({ className: 'bg-surface-raised' })
    expect(list).toContain('bg-surface-raised')
    expect(list).not.toContain('bg-surface')
  })

  it('lets the consumer replace the type step and keeps the text colour beside it', () => {
    const list = classes({ className: 'text-sm' })
    expect(list).toContain('text-sm')
    expect(list).not.toContain('text-xs')
    expect(list).toContain('text-body')
  })

  it('lets the consumer replace the inline padding', () => {
    const list = classes({ className: 'px-2' })
    expect(list).toContain('px-2')
    expect(list).not.toContain('px-1.5')
  })

  it('lets the consumer replace the stroke, because className follows BORDER_STRONG', () => {
    const colour = classes({ className: 'border-transparent' })
    expect(colour).toContain('border-transparent')
    expect(colour).not.toContain('border-line-strong')
    const width = classes({ className: 'border-0' })
    expect(width).toContain('border-0')
    expect(width).not.toContain('border-(length:--tc-line-width)')
  })
})
