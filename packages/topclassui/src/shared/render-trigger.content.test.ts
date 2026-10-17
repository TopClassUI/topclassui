import { describe, expect, it } from 'vitest'

import { hasContent } from './render-trigger.js'

// A part with a built-in control asks this before it draws its own: DialogClose its x, and the next overlays theirs.
describe('hasContent: whether children draw anything', () => {
  it('is false for what React draws nothing for', () => {
    expect([null, undefined, false, true, ''].map(hasContent)).toEqual([false, false, false, false, false])
  })

  it('is true for text, a number, zero and an element', () => {
    expect(['Cancel', 3, 0, { type: 'span' }].map(hasContent)).toEqual([true, true, true, true])
  })

  it('is true for a string of spaces: React draws it, so it is not ours to drop', () => {
    expect(hasContent(' ')).toBe(true)
  })

  it('reads a list by its items: empty or all blank is no content, one item that draws is', () => {
    expect([[], [false, null, ''], [false, 'Cancel'], [[null], [0]]].map(hasContent)).toEqual([false, false, true, true])
  })

  it('reads a list inside a list the same way, however deep', () => {
    expect(hasContent([[[false, [null, ['']]]]])).toBe(false)
    expect(hasContent([[[false, [null, ['x']]]]])).toBe(true)
  })

  it('answers the case it exists for: {saving && label} is content only while saving is true', () => {
    const label = (saving: boolean) => saving && 'Saving'
    expect([hasContent(label(false)), hasContent(label(true))]).toEqual([false, true])
  })
})
