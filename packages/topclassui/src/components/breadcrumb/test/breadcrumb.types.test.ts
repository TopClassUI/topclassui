import type { ReactElement, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

import type { Labels } from '#shared/labels/types.js'
import type { BreadcrumbItem, BreadcrumbProps } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('an item is a label and an optional href', () => {
  it('requires the label and makes the href optional', () => {
    expectTypeOf<BreadcrumbItem['label']>().toEqualTypeOf<string>()
    expectTypeOf<BreadcrumbItem['href']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<BreadcrumbItem, { label: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<BreadcrumbItem, { href: string; label: string }>>().toEqualTypeOf<true>()
  })

  it('rejects an item with no label, since a crumb with no text has no name', () => {
    expectTypeOf<Accepts<BreadcrumbItem, { href: string }>>().toEqualTypeOf<false>()
  })

  it('takes a string label only, because the same text is the name in the JSON-LD', () => {
    expectTypeOf<Accepts<BreadcrumbItem, { label: number }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BreadcrumbItem, { label: null }>>().toEqualTypeOf<false>()
  })

  it('has only those two keys', () => {
    expectTypeOf<keyof BreadcrumbItem>().toEqualTypeOf<'href' | 'label'>()
  })
})

describe('the props', () => {
  it('requires items, as a list a caller may also declare as const', () => {
    expectTypeOf<BreadcrumbProps['items']>().toEqualTypeOf<readonly BreadcrumbItem[]>()
    expectTypeOf<Accepts<BreadcrumbProps['items'], BreadcrumbItem[]>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<BreadcrumbProps, { labels?: Labels }>>().toEqualTypeOf<false>()
  })

  it('takes the whole Labels object, the labels field of what getLabels returns', () => {
    expectTypeOf<BreadcrumbProps['labels']>().toEqualTypeOf<Labels | undefined>()
    expectTypeOf<Accepts<BreadcrumbProps['labels'], { locale: string; labels: Labels }>>()
      .toEqualTypeOf<false>()
  })

  it('takes locale beside labels, so the pair getLabels returns spreads onto it', () => {
    expectTypeOf<BreadcrumbProps['locale']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<Pick<BreadcrumbProps, 'labels' | 'locale'>, { locale: string; labels: Labels }>>()
      .toEqualTypeOf<true>()
  })

  it('accepts className, style and ref, and ref is a normal prop on the nav', () => {
    expectTypeOf<BreadcrumbProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<BreadcrumbProps['ref'], Ref<HTMLElement>>>().toEqualTypeOf<true>()
  })

  it('keeps the native nav props, so id, aria-label and data-* still pass through', () => {
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'aria-label'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'aria-labelledby'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'onClick'>>().toEqualTypeOf<true>()
  })

  it('has no children and no raw HTML, because the trail is the items', () => {
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('takes one link element for every crumb, in the element form a Server Component can pass', () => {
    expectTypeOf<BreadcrumbProps['link']>().toEqualTypeOf<ReactElement | undefined>()
    expectTypeOf<Accepts<BreadcrumbProps['link'], () => ReactElement>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<BreadcrumbProps['link'], string>>().toEqualTypeOf<false>()
  })

  it('has no render prop, on the nav or on an item: the root is the nav and a crumb comes from link', () => {
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbItem, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbItem, 'link'>>().toEqualTypeOf<false>()
  })

  it('takes siteUrl as an optional string, which only the JSON-LD reads', () => {
    expectTypeOf<BreadcrumbProps['siteUrl']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<BreadcrumbProps, { items: BreadcrumbItem[] }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<BreadcrumbProps['siteUrl'], URL>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbItem, 'siteUrl'>>().toEqualTypeOf<false>()
  })

  it('has no baseUrl any more, so an old call fails to compile instead of losing its JSON-LD', () => {
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'baseUrl'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'maxItems'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'collapse'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'separator'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'showHome'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'truncate'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof BreadcrumbProps, 'tone'>>().toEqualTypeOf<false>()
  })
})
