import { describe, expect, it } from 'vitest'

import { ar } from './ar.js'
import { en } from './en.js'
import { createNumberFormat, getLabels } from './get-labels.js'
import type { Labels } from './types.js'

const latn = createNumberFormat('en', 'latn')
const arab = createNumberFormat('ar', 'arab')

function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object'
      ? keyPaths(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  )
}

describe('the two bundled languages', () => {
  it('Arabic has every key English has', () => {
    expect(keyPaths(ar).sort()).toEqual(keyPaths(en).sort())
  })

  it('a key is a string or a count function in both', () => {
    for (const [group, values] of Object.entries(en) as [keyof Labels, Record<string, unknown>][]) {
      for (const [key, value] of Object.entries(values)) {
        const other = (ar[group] as Record<string, unknown>)[key]
        expect(typeof other, `ar.${group}.${key}`).toBe(typeof value)
      }
    }
  })

  it('no built-in string is empty', () => {
    for (const labels of [en, ar]) {
      for (const group of Object.values(labels)) {
        for (const [key, value] of Object.entries(group)) {
          if (typeof value === 'string') expect(value.trim(), key).not.toBe('')
        }
      }
    }
  })
})

describe('Arabic plural forms', () => {
  it('picks a different word for 0, 1, 2, 3 and 11', () => {
    const got = [0, 1, 2, 3, 11].map((n) => ar.collection.results(n, arab))
    expect(new Set(got).size).toBe(5)
  })

  it('uses the dual form for two, which no template string can express', () => {
    expect(ar.collection.results(2, arab)).toBe('نتيجتان')
    expect(ar.collection.selected(2, arab)).toBe('عنصران محددان')
  })

  it('uses the singular for one without printing the number', () => {
    expect(ar.collection.results(1, arab)).toBe('نتيجة واحدة')
  })

  it('prints Arabic-Indic digits when the numbering system says so', () => {
    expect(ar.collection.results(3, arab)).toContain('٣')
    expect(ar.collection.results(3, latn)).toContain('3')
  })

  it('English keeps its two forms', () => {
    expect(en.collection.results(1, latn)).toBe('1 result')
    expect(en.collection.results(2, latn)).toBe('2 results')
  })

  it('formats a large count with separators', () => {
    expect(en.collection.results(12_345, latn)).toBe('12,345 results')
  })
})

describe('getLabels', () => {
  it('returns the locale alongside the labels', () => {
    expect(getLabels('ar').locale).toBe('ar')
    expect(getLabels('ar').labels.common.close).toBe('إغلاق')
  })

  it('matches on the language, so ar-SA still gets Arabic', () => {
    expect(getLabels('ar-SA').labels.common.close).toBe('إغلاق')
    expect(getLabels('en-GB').labels.common.close).toBe('Close')
  })

  it('falls back to English for a language we do not ship', () => {
    expect(getLabels('fr').labels.common.close).toBe('Close')
  })

  it('defaults to English when no locale is given', () => {
    expect(getLabels().labels.common.close).toBe('Close')
  })

  it('overrides one string and keeps the rest of its group', () => {
    const { labels } = getLabels('ar', { common: { close: 'اغلق' } })
    expect(labels.common.close).toBe('اغلق')
    expect(labels.common.cancel).toBe('إلغاء')
    expect(labels.state.empty).toBe(ar.state.empty)
  })

  it('does not mutate the bundled labels', () => {
    getLabels('en', { common: { close: 'Dismiss' } })
    expect(en.common.close).toBe('Close')
  })

  it('accepts a count function as an override', () => {
    const { labels } = getLabels('en', { collection: { results: (n, f) => `${f.format(n)} hits` } })
    expect(labels.collection.results(3, latn)).toBe('3 hits')
  })
})
