import { describe, expect, it } from 'vitest'

import { ar } from './ar.js'
import { en } from './en.js'
import { getLabels } from './get-labels.js'

// A marker shows the status to the eye; these three are what a screen reader hears in its place.
describe('the status of a timeline item', () => {
  it('is named in English, one word for each status the component draws', () => {
    expect(en.timeline).toEqual({ done: 'Done', current: 'Current', todo: 'Not started' })
  })

  it('is named in Arabic with the same three keys', () => {
    expect(ar.timeline).toEqual({ done: 'مكتمل', current: 'الحالي', todo: 'لم يبدأ' })
  })

  it('reaches a caller through getLabels, in the language of the locale', () => {
    expect(getLabels('ar-SA').labels.timeline.todo).toBe('لم يبدأ')
    expect(getLabels('fr').labels.timeline.todo).toBe('Not started')
  })

  it('lets a caller reword one status and keeps its neighbours', () => {
    const { labels } = getLabels('en', { timeline: { todo: 'Upcoming' } })
    expect(labels.timeline).toEqual({ done: 'Done', current: 'Current', todo: 'Upcoming' })
  })

  it('survives an override with an explicit undefined, which must not erase the default', () => {
    const { labels } = getLabels('ar', { timeline: { current: undefined, done: 'تم' } })
    expect(labels.timeline).toEqual({ done: 'تم', current: 'الحالي', todo: 'لم يبدأ' })
  })
})
