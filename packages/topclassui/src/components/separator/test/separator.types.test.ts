import { describe, expect, expectTypeOf, it } from 'vitest'

import { SEPARATOR_DEFAULTS, SEPARATOR_ORIENTATIONS } from '../constants.js'
import { separatorSchema } from '../schema.js'
import type { SeparatorDesignProps, SeparatorOrientation, SeparatorProps } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the union comes from the constants', () => {
  it('orientation is exactly the two drawn', () => {
    expectTypeOf<SeparatorOrientation>().toEqualTypeOf<'horizontal' | 'vertical'>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<SeparatorOrientation, 'diagonal'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<SeparatorOrientation, string>>().toEqualTypeOf<false>()
  })

  it('decorative is a plain boolean', () => {
    expectTypeOf<SeparatorProps['decorative']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('the props follow the vocabulary', () => {
  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<SeparatorProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native div props, so id, title and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof SeparatorProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'title'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'aria-label'>>().toEqualTypeOf<true>()
  })

  it('takes no role and no aria-orientation, which decorative and orientation decide', () => {
    expectTypeOf<Accepts<keyof SeparatorProps, 'role'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'aria-orientation'>>().toEqualTypeOf<false>()
  })

  it('takes no content, because the labelled form is not built', () => {
    expectTypeOf<Accepts<keyof SeparatorProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('has no render prop, because none of the nine server components of Unit 1 takes one', () => {
    expectTypeOf<Accepts<keyof SeparatorProps, 'render'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof SeparatorProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'spacing'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'withLabel'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'label'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'variant'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof SeparatorProps, 'tone'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input', () => {
    expectTypeOf<SeparatorDesignProps['orientation']>().toEqualTypeOf<SeparatorOrientation | undefined>()
    expectTypeOf<SeparatorDesignProps['decorative']>().toEqualTypeOf<boolean | undefined>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof SeparatorProps, keyof SeparatorDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills every default from constants.ts', () => {
    expect(separatorSchema.parse({})).toEqual({
      orientation: SEPARATOR_DEFAULTS.orientation,
      decorative: SEPARATOR_DEFAULTS.decorative,
    })
  })

  it('accepts every value the constants list', () => {
    for (const orientation of SEPARATOR_ORIENTATIONS) {
      expect(separatorSchema.parse({ orientation }).orientation).toBe(orientation)
    }
    expect(separatorSchema.parse({ decorative: false }).decorative).toBe(false)
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(separatorSchema.safeParse({ orientation: 'diagonal' }).success).toBe(false)
    expect(separatorSchema.safeParse({ decorative: 'yes' }).success).toBe(false)
  })

  it('agrees with the defaults the spec names', () => {
    expect(SEPARATOR_DEFAULTS).toEqual({ orientation: 'horizontal', decorative: true })
  })

  it('lists the orientations in the order the docs show them', () => {
    expect(SEPARATOR_ORIENTATIONS).toEqual(['horizontal', 'vertical'])
  })
})
