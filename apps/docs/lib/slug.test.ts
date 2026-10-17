import { describe, expect, it } from 'vitest'

import { slugify } from './slug.js'

describe('slugify', () => {
  it('lower-cases Latin text and joins words with one hyphen', () => {
    expect(slugify('How to read a card')).toBe('how-to-read-a-card')
    expect(slugify('Install: CLI or package')).toBe('install-cli-or-package')
  })

  it('keeps digits and drops punctuation at either end', () => {
    expect(slugify('1. Install the package and its peers')).toBe('1-install-the-package-and-its-peers')
    expect(slugify('  (Server and client)  ')).toBe('server-and-client')
  })

  it('turns code and symbols into one hyphen, never two', () => {
    expect(slugify('`size="custom"` & className')).toBe('size-custom-classname')
    expect(slugify('Right to left / RTL')).toBe('right-to-left-rtl')
  })

  it('keeps Arabic letters and drops the diacritics and the tatweel', () => {
    expect(slugify('في هذه الصفحة')).toBe('في-هذه-الصفحة')
    expect(slugify('التنقّل')).toBe('التنقل')
    expect(slugify('مــرحبا')).toBe('مرحبا')
  })

  it('treats Arabic punctuation as a separator', () => {
    expect(slugify('الخادم، ثم العميل؟')).toBe('الخادم-ثم-العميل')
  })

  it('keeps mixed Arabic and Latin in reading order', () => {
    expect(slugify('مدخل CSS')).toBe('مدخل-css')
  })

  it('returns an empty string for a heading with nothing to keep', () => {
    expect(slugify('— · —')).toBe('')
  })
})
