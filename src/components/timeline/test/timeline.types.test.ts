import type { ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Labels } from '#shared/labels/types.js'
import { TIMELINE_DOT, TIMELINE_DOT_CURRENT, TIMELINE_ICON } from '../classes.js'
import { TIMELINE_DEFAULTS, TIMELINE_STATUSES, TIMELINE_STATUS_TONES, TIMELINE_TONES } from '../constants.js'
import type { TimelineItem, TimelineProps, TimelineStatus, TimelineTone } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Event = TimelineItem & { id: string }
type Unbuilt = 'variant' | 'align' | 'compact' | 'reverse' | 'showConnector' | 'tone' | 'size'
  | 'loading' | 'loadMore' | 'virtualize' | 'render'

describe('the unions come from the constants', () => {
  it('status is exactly the three drawn', () => {
    expectTypeOf<TimelineStatus>().toEqualTypeOf<'done' | 'current' | 'todo'>()
    expect([...TIMELINE_STATUSES]).toEqual(['done', 'current', 'todo'])
  })

  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<TimelineTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
    expect([...TIMELINE_TONES]).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<TimelineStatus, 'error'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TimelineStatus, 'loading'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TimelineTone, 'brand'>>().toEqualTypeOf<false>()
  })

  it('has a class for every tone in all three marker tables, so a seventh cannot ship unpainted', () => {
    expect(Object.keys(TIMELINE_DOT)).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
    expect(Object.keys(TIMELINE_DOT_CURRENT)).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
    expect(Object.keys(TIMELINE_ICON)).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  it('agrees with the defaults the spec and the drawing name', () => {
    expect(TIMELINE_DEFAULTS).toEqual({ tone: 'primary' })
    expect(TIMELINE_STATUS_TONES).toEqual({ done: 'success', current: 'primary' })
  })
})

describe('an item', () => {
  it('requires a title and nothing else', () => {
    expectTypeOf<Accepts<TimelineItem, { title: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<TimelineItem, { time: string }>>().toEqualTypeOf<false>()
  })

  it('takes the title, the time and the icon as nodes', () => {
    expectTypeOf<TimelineItem['title']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<TimelineItem['time']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<TimelineItem['icon']>().toEqualTypeOf<ReactNode>()
  })

  it('takes a tone and a status from the lists', () => {
    expectTypeOf<TimelineItem['tone']>().toEqualTypeOf<TimelineTone | undefined>()
    expectTypeOf<TimelineItem['status']>().toEqualTypeOf<TimelineStatus | undefined>()
  })

  it('may carry more fields, which getKey then reads with their type', () => {
    expectTypeOf<TimelineProps<Event>['getKey']>().toEqualTypeOf<(item: Event) => string>()
    expectTypeOf<TimelineProps<Event>['items']>().toEqualTypeOf<readonly Event[]>()
  })
})

describe('the props follow the vocabulary', () => {
  it('requires items and getKey, as the collection contract does', () => {
    expectTypeOf<Accepts<TimelineProps, { items: TimelineItem[]; getKey: (item: TimelineItem) => string }>>()
      .toEqualTypeOf<true>()
    expectTypeOf<Accepts<TimelineProps, { items: TimelineItem[] }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<TimelineProps, { getKey: (item: TimelineItem) => string }>>().toEqualTypeOf<false>()
  })

  it('takes the empty fallback as a node', () => {
    expectTypeOf<TimelineProps['emptyFallback']>().toEqualTypeOf<ReactNode>()
  })

  it('takes the labels as a prop, because a Server Component has no context to read them from', () => {
    expectTypeOf<TimelineProps['labels']>().toEqualTypeOf<Labels | undefined>()
  })

  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<TimelineProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof TimelineProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TimelineProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native ol props, so id, start and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof TimelineProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TimelineProps, 'start'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof TimelineProps, 'aria-label'>>().toEqualTypeOf<true>()
  })

  it('takes no role, because the list role is what Safari with VoiceOver reads', () => {
    expectTypeOf<Accepts<keyof TimelineProps, 'role'>>().toEqualTypeOf<false>()
  })

  it('takes no children and no dangerouslySetInnerHTML, because the list is built from items', () => {
    expectTypeOf<Accepts<keyof TimelineProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof TimelineProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Extract<keyof TimelineProps, Unbuilt>>().toEqualTypeOf<never>()
  })
})
