import { describe, expect, it } from 'vitest'

import { describedByOf, entriesOf, messagesOf, sameEntries, toFieldIds } from '../lib.js'

describe('toFieldIds', () => {
  it('builds the label, hint and error ids from the control id, as written', () => {
    expect(toFieldIds('email')).toEqual({ control: 'email', label: 'email-label', hint: 'email-hint', error: 'email-err' })
    expect(toFieldIds('_R_1_')).toEqual({ control: '_R_1_', label: '_R_1_-label', hint: '_R_1_-hint', error: '_R_1_-err' })
  })
})

describe('messagesOf', () => {
  it('reads one message, an array, or none', () => {
    expect(messagesOf('Taken')).toEqual(['Taken'])
    expect(messagesOf(['Too short', 'No digits'])).toEqual(['Too short', 'No digits'])
    expect(messagesOf(undefined)).toEqual([])
  })

  it('drops empty messages, so an empty string or an array of blanks is no error', () => {
    expect(messagesOf('')).toEqual([])
    expect(messagesOf([])).toEqual([])
    expect(messagesOf(['', '  ', 'Real'])).toEqual(['Real'])
  })
})

describe('describedByOf', () => {
  const ids = toFieldIds('e')

  it('is the hint and then the error, only those rendered', () => {
    expect([describedByOf(ids, true, true), describedByOf(ids, true, false), describedByOf(ids, false, true), describedByOf(ids, false, false)])
      .toEqual(['e-hint e-err', 'e-hint', 'e-err', undefined])
  })
})

describe('sameEntries', () => {
  it('is true only for the same values in the same order', () => {
    expect([sameEntries([], []), sameEntries(['a'], ['a']), sameEntries(['a', 'b'], ['b', 'a']), sameEntries(['a'], ['a', 'a']), sameEntries(['a'], ['b'])])
      .toEqual([true, true, false, false, false])
  })
})

describe('entriesOf, outside a browser', () => {
  it('reads nothing from no root', () => {
    expect(entriesOf(null, 'email')).toEqual([])
  })
})
