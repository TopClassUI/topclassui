import { describe, expect, it } from 'vitest'

import { ar } from './ar.js'
import { en } from './en.js'
import { createNumberFormat, getLabels } from './get-labels.js'

const latn = createNumberFormat('en', 'latn')
const arab = createNumberFormat('ar', 'arab')

// One label for both numbers: two labels joined by a space would fix the order for every language.
describe('the current page of a pagination', () => {
  it('reads its page before the count in English, through the formatter', () => {
    expect(en.pagination.pageOf(3, 12, latn)).toBe('Page 3 of 12')
    expect(en.pagination.pageOf(1_000, 2_000, latn)).toBe('Page 1,000 of 2,000')
  })

  it('reads the same way in Arabic, in whichever digits the formatter writes', () => {
    expect(ar.pagination.pageOf(3, 12, latn)).toBe('صفحة 3 من 12')
    expect(ar.pagination.pageOf(3, 12, arab)).toBe('صفحة ٣ من ١٢')
  })

  it('lets a language that says the count first reorder the two, and keeps its neighbours', () => {
    const { labels } = getLabels('en', {
      pagination: { pageOf: (page, count, f) => `${f.format(count)} pages, now on ${f.format(page)}` },
    })
    expect(labels.pagination.pageOf(3, 12, latn)).toBe('12 pages, now on 3')
    expect(labels.pagination.page(3, latn)).toBe('Page 3')
    expect(labels.pagination.next).toBe('Next')
  })

  it('survives an override with an explicit undefined, which must not erase the default', () => {
    const { labels } = getLabels('ar', { pagination: { pageOf: undefined } })
    expect(labels.pagination.pageOf(3, 12, latn)).toBe('صفحة 3 من 12')
  })
})
