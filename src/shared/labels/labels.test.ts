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

  it('the breadcrumb and table strings are these, in both', () => {
    expect(en.breadcrumb).toEqual({ label: 'Breadcrumb', home: 'Home' })
    expect(en.table.sortBy).toBe('Sort by')
    expect(en.table.sortedAscending).toBe('sorted ascending')
    expect(en.table.sortedDescending).toBe('sorted descending')
    expect(ar.breadcrumb).toEqual({ label: 'مسار التنقل', home: 'الرئيسية' })
    expect(ar.table.sortBy).toBe('ترتيب حسب')
    expect(ar.table.sortedAscending).toBe('مرتب تصاعديًا')
    expect(ar.table.sortedDescending).toBe('مرتب تنازليًا')
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

  it('English counts the hidden avatars with one template, because "more" has no plural', () => {
    expect(en.avatar.more(1, latn)).toBe('1 more')
    expect(en.avatar.more(9, latn)).toBe('9 more')
  })

  it('Arabic names 0, 1 and 2 hidden avatars in words and prints the number from 3 up', () => {
    expect(ar.avatar.more(0, arab)).toBe('لا أحد آخر')
    expect(ar.avatar.more(1, arab)).toBe('واحد آخر')
    expect(ar.avatar.more(2, arab)).toBe('اثنان آخران')
    expect(ar.avatar.more(3, arab)).toBe('٣ آخرون')
    expect(ar.avatar.more(11, arab)).toBe('١١ آخرون')
    expect(ar.avatar.more(100, latn)).toBe('100 آخرون')
  })

  it('a rating reads its value before its maximum, half steps included', () => {
    expect(en.rating.value(4, 5, latn)).toBe('4 out of 5')
    expect(en.rating.value(3.5, 5, latn)).toBe('3.5 out of 5')
    expect(ar.rating.value(4, 5, arab)).toBe('٤ من ٥')
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

  it('overrides one key in each newer group and keeps its neighbours', () => {
    const { labels } = getLabels('en', {
      breadcrumb: { home: 'Start' },
      avatar: { more: (n, f) => `+${f.format(n)}` },
      rating: { value: (value, max, f) => `${f.format(value)}/${f.format(max)}` },
      table: { sortBy: 'Order by' },
    })
    expect(labels.breadcrumb).toEqual({ label: 'Breadcrumb', home: 'Start' })
    expect(labels.avatar.more(9, latn)).toBe('+9')
    expect(labels.rating.value(4, 5, latn)).toBe('4/5')
    expect(labels.table.sortBy).toBe('Order by')
  })
})

describe('an override with an explicit undefined', () => {
  it('keeps the default instead of writing undefined over it', () => {
    const { labels } = getLabels('en', { common: { close: undefined } })
    expect(labels.common.close).toBe(en.common.close)
  })

  it('still applies the real overrides beside it', () => {
    const { labels } = getLabels('en', { common: { close: undefined, clear: 'Wipe' } })
    expect(labels.common.close).toBe(en.common.close)
    expect(labels.common.clear).toBe('Wipe')
  })

  it('leaves every other group untouched', () => {
    const { labels } = getLabels('en', { common: { close: undefined } })
    expect(labels.state).toEqual(en.state)
    expect(labels.dialog).toEqual(en.dialog)
  })
})

describe('createNumberFormat', () => {
  it('formats with the tag it is given', () => {
    expect(createNumberFormat('en-US').format(1234)).toBe('1,234')
  })

  it('survives a POSIX-style tag, which Intl rejects outright', () => {
    expect(() => createNumberFormat('en_US')).not.toThrow()
    expect(createNumberFormat('en_US').format(1234)).toBe('1,234')
  })

  it('survives a tag that is not a locale at all', () => {
    expect(() => createNumberFormat('not a locale')).not.toThrow()
    expect(() => createNumberFormat('')).not.toThrow()
  })

  it('still honours the numbering system', () => {
    expect(createNumberFormat('ar', 'arab').format(1234)).not.toBe('1,234')
  })
})

describe('getLabels with an odd tag', () => {
  it('reads the language from a POSIX-style tag', () => {
    expect(getLabels('ar_EG').labels.common.close).toBe(ar.common.close)
  })
})
