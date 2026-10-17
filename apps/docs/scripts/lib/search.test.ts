import { describe, expect, it } from 'vitest'

import { searchIndexOf } from './search.js'
import type { ComponentsFile } from './shape.js'

const component = (slug: string, name: string, title: { en: string; ar: string }, page = true) => ({ slug, name, page, content: { title } })
const FILE = {
  sections: [],
  components: [
    component('button', 'Button', { en: 'Button', ar: 'زر' }),
    component('otp-field', 'OtpField', { en: 'OTP field', ar: 'حقل رمز التحقق' }),
    component('dropdown', 'Dropdown', { en: 'Dropdown menu', ar: 'قائمة منسدلة' }),
    component('icon', 'Icon', { en: 'Icon', ar: 'أيقونة' }, false),
  ],
} as unknown as ComponentsFile

const CATALOG = { title: 'Components', href: '/en/docs/components', headings: [{ id: 'forms', text: 'Forms' }] }

describe('searchIndexOf', () => {
  it('lists a page, then each of its headings, then every component page, in order', () => {
    expect(searchIndexOf(FILE, 'en', [CATALOG]).map((entry) => [entry.group, entry.title, entry.href])).toEqual([
      ['pages', 'Components', '/en/docs/components'],
      ['pages', 'Components: Forms', '/en/docs/components#forms'],
      ['components', 'Button', '/en/docs/components/button'],
      ['components', 'OTP field', '/en/docs/components/otp-field'],
      ['components', 'Dropdown menu', '/en/docs/components/dropdown'],
    ])
  })

  it('adds the export name to the label only where the title does not already hold it', () => {
    expect(searchIndexOf(FILE, 'en', []).map((entry) => entry.label)).toEqual(['Button', 'OTP field OtpField', 'Dropdown menu'])
  })

  it('keeps the Latin name beside every Arabic title, so either finds it', () => {
    expect(searchIndexOf(FILE, 'ar', []).map((entry) => [entry.label, entry.hint, entry.href])).toEqual([
      ['زر Button', 'Button', '/ar/docs/components/button'],
      ['حقل رمز التحقق OtpField', 'OtpField', '/ar/docs/components/otp-field'],
      ['قائمة منسدلة Dropdown', 'Dropdown', '/ar/docs/components/dropdown'],
    ])
  })

  it('puts the icons last, in their own group', () => {
    const icons = [{ title: 'plus', href: '/en/docs/icons#plus', headings: [] }]
    expect(searchIndexOf(FILE, 'en', [], icons).at(-1)).toEqual({ group: 'icons', label: 'plus', title: 'plus', hint: null, href: '/en/docs/icons#plus' })
  })
})
