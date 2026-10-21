import { describe, expect, it } from 'vitest'

import { ar } from './ar.js'
import { en } from './en.js'
import { createNumberFormat, getLabels } from './get-labels.js'

const latn = createNumberFormat('en', 'latn')
const arab = createNumberFormat('ar', 'arab')

// Every string below is one a screen reader says where a sighted reader sees an icon or a region.
describe('the labels of Unit 3, in English', () => {
  it('names the close button of a drawer and of a toast, each after its own surface', () => {
    expect(en.drawer).toEqual({ close: 'Close this panel' })
    expect(en.toast).toEqual({ region: 'Notifications', stage: 'Example notifications', close: 'Dismiss this notification' })
  })

  it('names the command palette and writes its placeholder', () => {
    expect(en.command).toEqual({ label: 'Command palette', placeholder: 'Type a command or search', escape: 'Esc', enter: 'Enter' })
  })

  it('names the two navigation landmarks and both states of the sidebar button', () => {
    expect(en.navbar).toEqual({ label: 'Main' })
    expect(en.sidebar).toEqual({
      label: 'Sidebar',
      collapse: 'Collapse the sidebar',
      expand: 'Expand the sidebar',
    })
  })

  it('names the button that removes a tag and the one that dismisses a banner', () => {
    expect(en.tag).toEqual({ remove: 'Remove' })
    expect(en.banner).toEqual({ dismiss: 'Dismiss' })
  })

  it('leaves the two close labels that existed as they were', () => {
    expect(en.dialog).toEqual({ close: 'Close this dialog' })
    expect(en.common.close).toBe('Close')
  })
})

describe('the labels of Unit 3, in Arabic', () => {
  it('names the close button of a drawer and of a toast, each after its own surface', () => {
    expect(ar.drawer).toEqual({ close: 'إغلاق هذه اللوحة' })
    expect(ar.toast).toEqual({ region: 'الإشعارات', stage: 'إشعارات المثال', close: 'إغلاق هذا الإشعار' })
  })

  it('names the command palette and writes its placeholder', () => {
    expect(ar.command).toEqual({ label: 'لوحة الأوامر', placeholder: 'اكتب أمرًا أو ابحث', escape: 'Esc', enter: 'Enter' })
  })

  it('names the two navigation landmarks and both states of the sidebar button', () => {
    expect(ar.navbar).toEqual({ label: 'التنقل الرئيسي' })
    expect(ar.sidebar).toEqual({
      label: 'الشريط الجانبي',
      collapse: 'طي الشريط الجانبي',
      expand: 'توسيع الشريط الجانبي',
    })
  })

  it('names the button that removes a tag and the one that dismisses a banner', () => {
    expect(ar.tag).toEqual({ remove: 'إزالة' })
    expect(ar.banner).toEqual({ dismiss: 'إغلاق' })
  })

  it('leaves the two close labels that existed as they were', () => {
    expect(ar.dialog).toEqual({ close: 'إغلاق هذا الحوار' })
    expect(ar.common.close).toBe('إغلاق')
  })
})

describe('the name of one step of an editable rating', () => {
  it('has the two English forms, and zero takes the plural', () => {
    expect(en.rating.stars(1, latn)).toBe('1 star')
    expect(en.rating.stars(3, latn)).toBe('3 stars')
    expect(en.rating.stars(0, latn)).toBe('0 stars')
  })

  it('writes the English number through the formatter', () => {
    expect(en.rating.stars(3, arab)).toBe('٣ stars')
  })

  it('has the six Arabic forms: zero, one and two in words, the number from three up', () => {
    expect(ar.rating.stars(0, arab)).toBe('بلا نجوم')
    expect(ar.rating.stars(1, arab)).toBe('نجمة واحدة')
    expect(ar.rating.stars(2, arab)).toBe('نجمتان')
    expect(ar.rating.stars(3, arab)).toBe('٣ نجوم')
    expect(ar.rating.stars(11, arab)).toBe('١١ نجمة')
    expect(ar.rating.stars(100, arab)).toBe('١٠٠ نجمة')
  })

  it('writes the Arabic number through the formatter too, in Latin digits when it says so', () => {
    expect(ar.rating.stars(3, latn)).toBe('3 نجوم')
    expect(ar.rating.stars(11, latn)).toBe('11 نجمة')
    expect(ar.rating.stars(100, latn)).toBe('100 نجمة')
  })

  it('sits beside the read-only name of the rating without replacing it', () => {
    expect(en.rating.value(4, 5, latn)).toBe('4 out of 5')
    expect(ar.rating.value(4, 5, arab)).toBe('٤ من ٥')
  })
})

describe('the labels of Unit 3 through getLabels', () => {
  it('reach a caller in the language of the locale, and in English for one we do not ship', () => {
    expect(getLabels('ar-SA').labels.toast.region).toBe('الإشعارات')
    expect(getLabels('ar-SA').labels.rating.stars(2, arab)).toBe('نجمتان')
    expect(getLabels('fr').labels.toast.region).toBe('Notifications')
  })

  it('lets a caller reword the close button of a drawer', () => {
    const { labels } = getLabels('en', { drawer: { close: 'Close the filters' } })
    expect(labels.drawer).toEqual({ close: 'Close the filters' })
  })

  it('lets a caller reword the close button of a toast and keeps the name of the region', () => {
    const { labels } = getLabels('en', { toast: { close: 'Hide' } })
    expect(labels.toast).toEqual({ region: 'Notifications', stage: 'Example notifications', close: 'Hide' })
  })

  it('lets a caller reword the placeholder of the command palette and keeps its name', () => {
    const { labels } = getLabels('en', { command: { placeholder: 'Search the docs' } })
    expect(labels.command).toEqual({ label: 'Command palette', placeholder: 'Search the docs', escape: 'Esc', enter: 'Enter' })
  })

  it('lets a caller rename the navbar, which a page with two of them has to', () => {
    const { labels } = getLabels('en', { navbar: { label: 'Account' } })
    expect(labels.navbar).toEqual({ label: 'Account' })
  })

  it('lets a caller reword one state of the sidebar button and keeps the other', () => {
    const { labels } = getLabels('en', { sidebar: { collapse: 'Hide the sidebar' } })
    expect(labels.sidebar).toEqual({
      label: 'Sidebar',
      collapse: 'Hide the sidebar',
      expand: 'Expand the sidebar',
    })
  })

  it('lets a caller reword the remove button of a tag', () => {
    const { labels } = getLabels('en', { tag: { remove: 'Delete' } })
    expect(labels.tag).toEqual({ remove: 'Delete' })
  })

  it('lets a caller reword the dismiss button of a banner', () => {
    const { labels } = getLabels('en', { banner: { dismiss: 'Hide' } })
    expect(labels.banner).toEqual({ dismiss: 'Hide' })
  })

  it('lets a caller replace the count function of a star and keeps the read-only name', () => {
    const { labels } = getLabels('en', { rating: { stars: (n, f) => `${f.format(n)} of them` } })
    expect(labels.rating.stars(3, latn)).toBe('3 of them')
    expect(labels.rating.value(4, 5, latn)).toBe('4 out of 5')
  })

  it('survives an override with an explicit undefined, which must not erase the default', () => {
    const { labels } = getLabels('ar', { sidebar: { expand: undefined, label: 'القائمة' } })
    expect(labels.sidebar).toEqual({
      label: 'القائمة',
      collapse: 'طي الشريط الجانبي',
      expand: 'توسيع الشريط الجانبي',
    })
  })

  it('leaves the bundled labels as they were after every override above', () => {
    expect(en.drawer.close).toBe('Close this panel')
    expect(ar.sidebar.label).toBe('الشريط الجانبي')
  })
})
