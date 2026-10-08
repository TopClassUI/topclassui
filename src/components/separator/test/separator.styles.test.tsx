import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Separator } from '../index.js'
import type { SeparatorProps } from '../types.js'

const classes = (props: SeparatorProps = {}) => classList(markup(<Separator {...props} />))

/** The Build this classes, written out: a derived expectation would shrink with the table. */
const LINE = {
  horizontal: ['border-line', 'border-t-(length:--tc-line-width)', 'w-full'],
  vertical: ['border-line', 'border-s-(length:--tc-line-width)', 'self-stretch'],
} as const

describe('every orientation draws exactly its own line', () => {
  for (const orientation of ['horizontal', 'vertical'] as const) {
    for (const decorative of [true, false]) {
      it(`${orientation}, decorative ${String(decorative)}, carries exactly its three classes`, () => {
        expect(classes({ orientation, decorative }).sort()).toEqual([...LINE[orientation]])
      })
    }
  }

  it('starts horizontal, the default', () => {
    expect(classes().sort()).toEqual(['border-line', 'border-t-(length:--tc-line-width)', 'w-full'])
  })
})

describe('the line', () => {
  it('is one border side, not a filled box, so it survives forced colors', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      expect(classes({ orientation }).filter((c) => c.startsWith('bg-') || /^h-/.test(c)), orientation).toEqual([])
    }
  })

  it('draws the vertical line on the inline-start side, never a physical one', () => {
    const list = classes({ orientation: 'vertical' })
    expect(list).toContain('border-s-(length:--tc-line-width)')
    expect(list.filter((c) => /^border-(l|r|x)(-|$)/.test(c))).toEqual([])
  })

  it('reads the --tc-line-width knob that BORDER_WIDTH reads, on one side only', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      const widths = classes({ orientation }).filter((c) => c.includes('--tc-line-width'))
      expect(widths, orientation).toHaveLength(1)
      expect(widths, orientation).not.toContain('border-(length:--tc-line-width)')
    }
  })

  it('uses base/line, the decorative hairline, not the 3:1 control boundary', () => {
    expect(classes()).not.toContain('border-line-strong')
    expect(classes({ orientation: 'vertical' })).not.toContain('border-line-strong')
  })

  it('has no margin, so the gap of the parent spaces it as a zero-margin flex child', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      expect(classes({ orientation }).filter((c) => /^-?m[trblxyse]?-/.test(c)), orientation).toEqual([])
    }
  })

  it('has no shrink-0, because two horizontal lines beside a text share the row', () => {
    expect(classes()).not.toContain('shrink-0')
    expect(classes({ orientation: 'vertical' })).not.toContain('shrink-0')
  })

  it('is not interactive, so it carries no ring, hover, transition or touch target', () => {
    const interactive = /^(hover:|active:|focus-visible:|outline-|transition|duration-|min-[hw]-|cursor-)/
    for (const orientation of ['horizontal', 'vertical'] as const) {
      expect(classes({ orientation }).filter((c) => interactive.test(c)), orientation).toEqual([])
    }
  })

  it('aims no class at a child, since it renders none', () => {
    expect(classes().filter((c) => /^(\*|\[&)/.test(c))).toEqual([])
  })
})

describe('className is passed last, so a conflicting consumer class wins', () => {
  it('keeps a consumer utility that conflicts with nothing, beside every class of its own', () => {
    expect(classes({ className: 'my-2' }).sort()).toEqual(['border-line', 'border-t-(length:--tc-line-width)', 'my-2', 'w-full'])
    expect(classes({ orientation: 'vertical', className: 'my-2' }).sort()).toEqual(['border-line', 'border-s-(length:--tc-line-width)', 'my-2', 'self-stretch'])
  })

  it('replaces w-full on the horizontal line', () => {
    const list = classes({ className: 'w-16' })
    expect(list).toContain('w-16')
    expect(list).not.toContain('w-full')
  })

  it('replaces self-stretch on the vertical line', () => {
    const list = classes({ orientation: 'vertical', className: 'self-center' })
    expect(list).toContain('self-center')
    expect(list).not.toContain('self-stretch')
  })

  it('replaces the line colour on both orientations', () => {
    for (const orientation of ['horizontal', 'vertical'] as const) {
      const list = classes({ orientation, className: 'border-line-strong' })
      expect(list, orientation).toContain('border-line-strong')
      expect(list, orientation).not.toContain('border-line')
    }
  })

  it('replaces the knob width with the consumer one on the same side', () => {
    const across = classes({ className: 'border-t-2' })
    expect(across).toContain('border-t-2')
    expect(across).not.toContain('border-t-(length:--tc-line-width)')

    const down = classes({ orientation: 'vertical', className: 'border-s-4' })
    expect(down).toContain('border-s-4')
    expect(down).not.toContain('border-s-(length:--tc-line-width)')
  })
})
