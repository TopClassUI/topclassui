import { describe, expect, it } from 'vitest'

import { attr, classList, markup } from '#test/markup.js'
import { INPUT_SIZES } from '../constants.js'
import { Input } from '../index.js'
import type { InputProps } from '../types.js'

const html = (props: Partial<InputProps> = {}) => markup(<Input aria-label="Email" {...props} />)
const classes = (props: Partial<InputProps> = {}) => classList(html(props))

describe('invalid is told by more than hue (WCAG 1.4.1)', () => {
  /** Written out: a ring inside the line, as wide as the ring knob is wider than the line. */
  const RING = 'aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))]'

  it('thickens the line with a ring inside it, which moves no text', () => {
    // Always present: the attribute switches it on, so a Field's own aria-invalid paints too.
    for (const invalid of [false, true]) {
      expect(classes({ invalid }), String(invalid)).toContain(RING)
      expect(classes({ invalid }), String(invalid)).toContain('aria-invalid:inset-ring-danger-solid')
    }
  })

  it('thickens the border itself under forced colours, where no shadow paints', () => {
    for (const invalid of [false, true]) {
      expect(classes({ invalid }), String(invalid))
        .toContain('forced-colors:aria-invalid:border-(length:--tc-ring-width)')
    }
  })

  it('never widens the border outside forced colours, which moved the text by a pixel', () => {
    expect(classes({ invalid: true })).not.toContain('aria-invalid:border-(length:--tc-ring-width)')
  })

  it('keeps the resting line width, so the two states are the same box', () => {
    expect(classes({ invalid: true })).toContain('border-(length:--tc-line-width)')
  })
})

describe('text is at least 16px on a touch screen, or iOS zooms the page on focus', () => {
  /** Written out: a px floor, as the target size is, so a small root cannot undo it. */
  const FLOOR = 'pointer-coarse:text-[max(1rem,16px)]'

  for (const size of INPUT_SIZES) {
    it(`${size} ${size === 'custom' ? 'opts out, as it does of the whole scale' : 'carries the floor'}`, () => {
      expect(classes({ size }).includes(FLOOR), size).toBe(size !== 'custom')
    })
  }

  it('leaves the fine-pointer type step alone', () => {
    expect(classes({ size: 'xs' })).toContain('text-xs')
    expect(classes({ size: 'md' })).toContain('text-sm')
  })

  it("gives way to the caller's own coarse size", () => {
    const list = classes({ className: 'pointer-coarse:text-lg' })
    expect(list).toContain('pointer-coarse:text-lg')
    expect(list).not.toContain(FLOOR)
  })
})

describe('read-only looks like idle, as the frame draws it', () => {
  it('keeps the raised surface and takes no tint', () => {
    const list = classes({ readOnly: true })
    expect(list).toContain('bg-surface-raised')
    expect(list).not.toContain('bg-neutral-soft')
  })

  it('still reaches the input as the native attribute', () => {
    expect(attr(html({ readOnly: true }), 'readOnly')).toBe('')
  })
})
