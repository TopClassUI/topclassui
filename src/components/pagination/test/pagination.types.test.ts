import type { ReactElement } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import type { Labels } from '#shared/labels/types.js'
import { paginationSchema } from '../schema.js'
import type {
  PaginationDesignProps, PaginationGap, PaginationItem, PaginationLinkParts, PaginationProps, PaginationRange,
} from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

/** Assignable means the compiler would accept that call. */
type Given<Props> = Props extends PaginationProps ? true : false

type Href = (page: number) => string

describe('the three props a pagination cannot do without', () => {
  it('requires value, pageCount and getHref', () => {
    expectTypeOf<Given<{ value: 1; pageCount: 12; getHref: Href }>>().toEqualTypeOf<true>()
    expectTypeOf<Given<{ pageCount: 12; getHref: Href }>>().toEqualTypeOf<false>()
    expectTypeOf<Given<{ value: 1; getHref: Href }>>().toEqualTypeOf<false>()
    expectTypeOf<Given<{ value: 1; pageCount: 12 }>>().toEqualTypeOf<false>()
  })

  it('types them as two numbers and a function from a page to an address', () => {
    expectTypeOf<PaginationProps['value']>().toEqualTypeOf<number>()
    expectTypeOf<PaginationProps['pageCount']>().toEqualTypeOf<number>()
    expectTypeOf<PaginationProps['getHref']>().toEqualTypeOf<Href>()
  })

  it('refuses an href that is not a function, because a template cannot be clamped', () => {
    expectTypeOf<Given<{ value: 1; pageCount: 12; getHref: '/blog?page=' }>>().toEqualTypeOf<false>()
  })
})

describe('the optional props follow the vocabulary', () => {
  it('takes the two counts as optional numbers', () => {
    expectTypeOf<PaginationProps['siblingCount']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<PaginationProps['boundaryCount']>().toEqualTypeOf<number | undefined>()
  })

  it('size is the shared scale including custom', () => {
    expectTypeOf<PaginationProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<PaginationProps['size'], 'custom'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PaginationProps['size'], 'xxl'>>().toEqualTypeOf<false>()
  })

  it('takes labels and locale, the pair getLabels returns', () => {
    expectTypeOf<PaginationProps['labels']>().toEqualTypeOf<Labels | undefined>()
    expectTypeOf<PaginationProps['locale']>().toEqualTypeOf<string | undefined>()
  })

  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<PaginationProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof PaginationProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof PaginationProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the attributes of a nav, so id and aria-* pass through', () => {
    expectTypeOf<Accepts<keyof PaginationProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof PaginationProps, 'aria-label'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof PaginationProps, 'aria-labelledby'>>().toEqualTypeOf<true>()
  })

  it('takes no children, because it writes its own list', () => {
    expectTypeOf<Accepts<keyof PaginationProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof PaginationProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('takes the element every link is cloned from, in the element form only', () => {
    expectTypeOf<PaginationProps['link']>().toEqualTypeOf<ReactElement | undefined>()
    expectTypeOf<Given<{ value: 1; pageCount: 12; getHref: Href; link: ReactElement }>>().toEqualTypeOf<true>()
    expectTypeOf<Given<{ value: 1; pageCount: 12; getHref: Href; link: () => null }>>().toEqualTypeOf<false>()
  })

  it('calls it link, not render: render replaces a root element, and this replaces each link', () => {
    expectTypeOf<Accepts<keyof PaginationProps, 'link'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof PaginationProps, 'render'>>().toEqualTypeOf<false>()
  })

  it('does not build the props the playground names and nothing draws', () => {
    expectTypeOf<Accepts<keyof PaginationProps, 'shape' | 'compact' | 'showFirstLast' | 'showPrevNext'>>()
      .toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof PaginationProps, 'onValueChange' | 'tone' | 'variant'>>()
      .toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('declares the same keys', () => {
    expect(Object.keys(paginationSchema.shape).sort())
      .toEqual(['boundaryCount', 'pageCount', 'siblingCount', 'size', 'value'])
    expectTypeOf<keyof PaginationDesignProps>()
      .toEqualTypeOf<'boundaryCount' | 'pageCount' | 'siblingCount' | 'size' | 'value'>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof PaginationProps, keyof PaginationDesignProps>>().toEqualTypeOf<true>()
  })

  it('keeps the requiredness the schema has: no default means no question mark', () => {
    expectTypeOf<Accepts<PaginationDesignProps, { value: 1; pageCount: 2 }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<PaginationDesignProps, { siblingCount: 1; boundaryCount: 1; size: 'sm' }>>()
      .toEqualTypeOf<false>()
  })
})

describe('the page list', () => {
  it('is page numbers and the two gaps', () => {
    expectTypeOf<PaginationGap>().toEqualTypeOf<'gap-start' | 'gap-end'>()
    expectTypeOf<PaginationItem>().toEqualTypeOf<number | 'gap-start' | 'gap-end'>()
  })

  it('is worked out from four numbers, all of them present', () => {
    expectTypeOf<PaginationRange>()
      .toEqualTypeOf<{ value: number; pageCount: number; siblingCount: number; boundaryCount: number }>()
  })

  it('is what Pagination writes on a link, whichever element renders it', () => {
    expectTypeOf<keyof PaginationLinkParts>()
      .toEqualTypeOf<'aria-label' | 'aria-current' | 'rel' | 'className' | 'children'>()
    expectTypeOf<PaginationLinkParts['rel']>().toEqualTypeOf<'prev' | 'next' | undefined>()
  })
})
