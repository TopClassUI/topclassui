import { describe, expect, it } from 'vitest'

import { ROW, ROW_HIGHLIGHT, ROW_SELECTED, ROW_TOUCH } from './classes.js'
import { cn } from './cn.js'

// Shapes are named here, not derived: a derived expectation shrinks with the constant.
const list = (constant: string) => constant.split(' ')

describe('a row of a list of options', () => {
  it('grows to 44 px under a coarse pointer, in the px token with its fallback, never below the row height, and sets nothing for a mouse', () => {
    expect(list(ROW_TOUCH)).toEqual(['pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'])
  })

  it('marks the chosen row by weight, on the attribute Base UI sets on a selected item', () => {
    expect(list(ROW_SELECTED)).toEqual(['data-selected:font-medium'])
  })

  it('keeps the row height and the coarse floor side by side when cn() merges them, since one is behind a pointer query', () => {
    expect(list(cn(ROW, ROW_HIGHLIGHT, ROW_SELECTED, ROW_TOUCH))).toEqual(expect.arrayContaining([
      'min-h-(--tc-row-height)', 'pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]',
      'data-highlighted:bg-primary-soft', 'data-selected:font-medium', 'text-sm',
    ]))
  })
})
