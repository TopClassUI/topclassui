import { describe, expect, it } from 'vitest'

import { ar } from './ar.js'
import { en } from './en.js'
import { createNumberFormat, getLabels } from './get-labels.js'

const latn = createNumberFormat('en', 'latn')
const arab = createNumberFormat('ar', 'arab')

// Every string below is one a screen reader says where a sighted reader sees a stepper, a thumb or a cell.
describe('the labels of Unit 4, in English', () => {
  it('names the two steppers of a number field and describes its input', () => {
    expect(en.numberField).toEqual({ increase: 'Increase', decrease: 'Decrease', field: 'Number field' })
  })

  it('names the two thumbs of a range slider', () => {
    expect(en.slider).toEqual({ minimum: 'Minimum', maximum: 'Maximum' })
  })

  it('names one cell of an OTP field by its place and the count of cells', () => {
    expect(en.otp.character(2, 6, latn)).toBe('Character 2 of 6')
    expect(en.otp.character(12, 12, latn)).toBe('Character 12 of 12')
  })

  it('counts a textarea against its cap, the length first', () => {
    expect(en.textarea.count(42, 500, latn)).toBe('42 of 500 characters')
    expect(en.textarea.count(0, 500, latn)).toBe('0 of 500 characters')
    expect(en.textarea.count(1234, 5000, latn)).toBe('1,234 of 5,000 characters')
  })

  it('writes both numbers of both ratios through the formatter', () => {
    expect(en.otp.character(2, 6, arab)).toBe('Character ٢ of ٦')
    expect(en.textarea.count(42, 500, arab)).toBe('٤٢ of ٥٠٠ characters')
  })

  it('leaves the four labels Unit 4 uses as they are', () => {
    expect(en.select.placeholder).toBe('Select')
    expect(en.collection.noResults).toBe('No results')
    expect(en.common.loading).toBe('Loading')
    expect(en.state.loadingMore).toBe('Loading more')
  })
})

describe('the labels of Unit 4, in Arabic', () => {
  it('names the two steppers of a number field with verbal nouns and describes its input', () => {
    expect(ar.numberField).toEqual({ increase: 'زيادة', decrease: 'إنقاص', field: 'حقل رقمي' })
  })

  it('names the two thumbs of a range slider', () => {
    expect(ar.slider).toEqual({ minimum: 'الحد الأدنى', maximum: 'الحد الأقصى' })
  })

  it('names one cell of an OTP field as a box, in the digits of the formatter', () => {
    expect(ar.otp.character(2, 6, arab)).toBe('الخانة ٢ من ٦')
    expect(ar.otp.character(2, 6, latn)).toBe('الخانة 2 من 6')
  })

  it('puts the noun before the two numbers of a count, so no pair needs a plural form', () => {
    expect(ar.textarea.count(42, 500, arab)).toBe('عدد الأحرف: ٤٢ من ٥٠٠')
    expect(ar.textarea.count(42, 500, latn)).toBe('عدد الأحرف: 42 من 500')
    expect(ar.textarea.count(3, 5, arab)).toBe('عدد الأحرف: ٣ من ٥')
    expect(ar.textarea.count(1, 2, arab)).toBe('عدد الأحرف: ١ من ٢')
  })
})

describe('the labels of Unit 4 through getLabels', () => {
  it('reach a caller in the language of the locale, and in English for one we do not ship', () => {
    expect(getLabels('ar-SA').labels.numberField.field).toBe('حقل رقمي')
    expect(getLabels('ar-EG').labels.textarea.count(42, 500, arab)).toBe('عدد الأحرف: ٤٢ من ٥٠٠')
    expect(getLabels('fr').labels.slider.minimum).toBe('Minimum')
  })

  it('lets a caller reword one stepper of a number field and keeps the other two labels', () => {
    const { labels } = getLabels('en', { numberField: { increase: 'Add one' } })
    expect(labels.numberField).toEqual({ increase: 'Add one', decrease: 'Decrease', field: 'Number field' })
  })

  it('lets a caller rename one thumb of a range and keeps the other', () => {
    const { labels } = getLabels('en', { slider: { maximum: 'Highest price' } })
    expect(labels.slider).toEqual({ minimum: 'Minimum', maximum: 'Highest price' })
  })

  it('lets a caller replace the name of an OTP cell', () => {
    const { labels } = getLabels('en', { otp: { character: (p, n, f) => `Digit ${f.format(p)}/${f.format(n)}` } })
    expect(labels.otp.character(2, 6, latn)).toBe('Digit 2/6')
  })

  it('lets a caller replace the count of a textarea', () => {
    const { labels } = getLabels('ar', { textarea: { count: (n, max, f) => `${f.format(max - n)} متبقٍ` } })
    expect(labels.textarea.count(42, 500, latn)).toBe('458 متبقٍ')
  })

  it('survives an override with an explicit undefined, which must not erase the default', () => {
    const { labels } = getLabels('ar', { numberField: { decrease: undefined, field: 'الكمية' } })
    expect(labels.numberField).toEqual({ increase: 'زيادة', decrease: 'إنقاص', field: 'الكمية' })
  })

  it('leaves the bundled labels as they were after every override above', () => {
    expect(en.numberField.increase).toBe('Increase')
    expect(en.slider.maximum).toBe('Maximum')
    expect(ar.numberField.field).toBe('حقل رقمي')
    expect(ar.textarea.count(42, 500, latn)).toBe('عدد الأحرف: 42 من 500')
  })
})
