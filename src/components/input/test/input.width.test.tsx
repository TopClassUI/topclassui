import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { INPUT_OWN_WIDTH_TYPES } from '../constants.js'
import { Input, inputVariants } from '../index.js'
import type { InputProps } from '../types.js'

const classes = (props: Partial<InputProps> = {}) =>
  classList(markup(<Input aria-label="Email" {...props} />))

const widths = (list: string[]) => list.filter((c) => c.startsWith('w-'))

/** Written out: a percentage with a cap, which a flex row can shrink below the cap. */
const OWN_WIDTH = 'w-[min(100%,var(--tc-input-width))]'

describe('the own width shrinks, so two inputs in a row fit a phone', () => {
  it('is a percentage capped by the token, not the fixed width of the browser', () => {
    expect(widths(classes())).toEqual([OWN_WIDTH])
  })

  it('keeps max-w-full beside it, which the merge must not drop', () => {
    expect(classes()).toContain('max-w-full')
  })

  /** Written out: the seven types the browser draws twenty characters wide. */
  const TEXT_LIKE = ['text', 'search', 'url', 'tel', 'email', 'password', 'number'] as const

  it('covers exactly the seven text-like types', () => {
    expect(INPUT_OWN_WIDTH_TYPES).toEqual(['text', 'search', 'url', 'tel', 'email', 'password', 'number'])
  })

  for (const type of TEXT_LIKE) {
    it(`a ${type} field takes it`, () => {
      expect(widths(classes({ type })), type).toEqual([OWN_WIDTH])
    })
  }

  /** Written out: each has a box of its own, which a text width stretched to 193px. */
  const OWN_BOX = [
    'checkbox', 'radio', 'color', 'range', 'date', 'time', 'datetime-local', 'month', 'week', 'file', 'hidden',
  ] as const

  for (const type of OWN_BOX) {
    it(`a ${type} field keeps the width the browser gives it`, () => {
      expect(widths(classes({ type })), type).toEqual([])
    })
  }
})

describe('the own width gives way', () => {
  it('to fullWidth', () => {
    expect(widths(classes({ fullWidth: true }))).toEqual(['w-full'])
  })

  it("to the caller's own width, which a cap would have held at 193px", () => {
    expect(widths(classes({ className: 'w-80' }))).toEqual(['w-80'])
    expect(widths(classes({ className: 'w-full' }))).toEqual(['w-full'])
  })

  it('and leaves flex-1 beside it, which grows past a width but not past a max-width', () => {
    const list = classes({ className: 'flex-1' })
    expect(list).toContain('flex-1')
    expect(list.filter((c) => c.startsWith('max-w-'))).toEqual(['max-w-full'])
  })

  it('is not in inputVariants, which a textarea or a select may wear', () => {
    expect(widths(inputVariants().split(' '))).toEqual([])
  })
})
