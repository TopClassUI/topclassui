import { describe, expect, it } from 'vitest'

import { ar } from './ar.js'
import { en } from './en.js'
import { getLabels } from './get-labels.js'

// Every string below is one a reader sees on a picker or a file row, or hears after a step's title or a failed copy.
describe('the labels of Unit 5, in English', () => {
  it('writes the empty trigger of a date picker and names its two month buttons', () => {
    expect(en.datePicker).toEqual({ placeholder: 'Pick a date', previousMonth: 'Previous month', nextMonth: 'Next month' })
  })

  it('reads the status of a step after its title', () => {
    expect(en.stepper).toEqual({ done: 'Completed', todo: 'Not started', error: 'Needs attention' })
  })

  it('gives the two reasons a file is rejected', () => {
    expect(en.file.tooLarge).toBe('Too large')
    expect(en.file.wrongType).toBe('Not an accepted type')
  })

  it('announces a refused copy apart from a done one', () => {
    expect(en.common.copyFailed).toBe('Could not copy')
    expect(en.common.copied).toBe('Copied')
  })

  it('names a block of code that has no title', () => {
    expect(en.common.code).toBe('Code')
  })

  it('leaves the labels Unit 5 uses as they are', () => {
    expect(en.common.copy).toBe('Copy')
    expect(en.common.close).toBe('Close')
    expect(en.common.required).toBe('required')
    expect(en.common.loading).toBe('Loading')
    expect(en.state.empty).toBe('Nothing here yet')
    expect(en.state.loadingMore).toBe('Loading more')
    expect(en.file.drop).toBe('Drag files here or')
    expect(en.file.browse).toBe('browse')
    expect(en.file.remove).toBe('Remove')
  })
})

describe('the labels of Unit 5, in Arabic', () => {
  it('writes the empty trigger of a date picker with the verb of a select, and names the two month buttons', () => {
    expect(ar.datePicker).toEqual({ placeholder: 'اختر تاريخًا', previousMonth: 'الشهر السابق', nextMonth: 'الشهر التالي' })
  })

  it('reads a step with the words of a timeline item, and an error in the same masculine form', () => {
    expect(ar.stepper).toEqual({ done: 'مكتمل', todo: 'لم يبدأ', error: 'يحتاج إلى مراجعة' })
    expect(ar.timeline.done).toBe('مكتمل')
    expect(ar.timeline.todo).toBe('لم يبدأ')
  })

  it('gives the two reasons a file is rejected', () => {
    expect(ar.file.tooLarge).toBe('الحجم كبير جدًا')
    expect(ar.file.wrongType).toBe('نوع غير مقبول')
  })

  it('announces a refused copy apart from a done one', () => {
    expect(ar.common.copyFailed).toBe('تعذّر النسخ')
    expect(ar.common.copied).toBe('تم النسخ')
  })

  it('names a block of code that has no title', () => {
    expect(ar.common.code).toBe('الشيفرة البرمجية')
  })
})

describe('the labels of Unit 5 through getLabels', () => {
  it('reach a caller in the language of the locale, and in English for one we do not ship', () => {
    expect(getLabels('ar-SA').labels.datePicker.placeholder).toBe('اختر تاريخًا')
    expect(getLabels('ar-EG').labels.stepper.error).toBe('يحتاج إلى مراجعة')
    expect(getLabels('fr').labels.file.wrongType).toBe('Not an accepted type')
  })

  it('lets a caller reword one month button of a date picker and keeps the other two labels', () => {
    const { labels } = getLabels('en', { datePicker: { nextMonth: 'Later' } })
    expect(labels.datePicker).toEqual({ placeholder: 'Pick a date', previousMonth: 'Previous month', nextMonth: 'Later' })
  })

  it('lets a caller reword one status of a step and keeps the other two', () => {
    const { labels } = getLabels('ar', { stepper: { error: 'خطأ' } })
    expect(labels.stepper).toEqual({ done: 'مكتمل', todo: 'لم يبدأ', error: 'خطأ' })
  })

  it('lets a caller reword the new keys of the file and common groups beside their neighbours', () => {
    const { labels } = getLabels('en', { file: { tooLarge: 'Over 5 MB' }, common: { copyFailed: 'Copy blocked' } })
    expect(labels.file.tooLarge).toBe('Over 5 MB')
    expect(labels.file.wrongType).toBe('Not an accepted type')
    expect(labels.common.copyFailed).toBe('Copy blocked')
    expect(labels.common.copied).toBe('Copied')
  })

  it('survives an override with an explicit undefined, which must not erase the default', () => {
    const { labels } = getLabels('ar', { datePicker: { placeholder: undefined, previousMonth: 'السابق' } })
    expect(labels.datePicker).toEqual({ placeholder: 'اختر تاريخًا', previousMonth: 'السابق', nextMonth: 'الشهر التالي' })
  })

  it('leaves the bundled labels as they were after every override above', () => {
    expect(en.datePicker.nextMonth).toBe('Next month')
    expect(en.file.tooLarge).toBe('Too large')
    expect(ar.stepper.error).toBe('يحتاج إلى مراجعة')
    expect(ar.datePicker.previousMonth).toBe('الشهر السابق')
  })
})
