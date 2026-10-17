import type { ReactNode } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { IconData } from '#icons/types.js'
import type { Tone } from '#shared/contracts/tone.js'
import { ALERT_DEFAULTS, ALERT_ICONS, ALERT_TONES, ALERT_VARIANTS } from '../constants.js'
import { alertSchema } from '../schema.js'
import type { AlertDesignProps, AlertProps, AlertTone, AlertVariant } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the unions come from the constants', () => {
  it('variant is exactly the three drawn', () => {
    expectTypeOf<AlertVariant>().toEqualTypeOf<'soft' | 'solid' | 'outline'>()
  })

  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<AlertTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<AlertVariant, 'ghost'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<AlertTone, 'brand'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<AlertVariant, string>>().toEqualTypeOf<false>()
  })

  it('types the icon table by tone, so a seventh tone cannot ship without an icon', () => {
    expectTypeOf(ALERT_ICONS).toEqualTypeOf<Record<Tone, IconData>>()
  })
})

describe('the props follow the vocabulary', () => {
  it('takes the four slots as nodes', () => {
    expectTypeOf<AlertProps['icon']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<AlertProps['title']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<AlertProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<AlertProps['actions']>().toEqualTypeOf<ReactNode>()
  })

  it('takes null for the icon, which is how a caller hides it', () => {
    expectTypeOf<Accepts<AlertProps['icon'], null>>().toEqualTypeOf<true>()
  })

  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<AlertProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof AlertProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AlertProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native div props, so id, role and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof AlertProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AlertProps, 'role'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AlertProps, 'aria-label'>>().toEqualTypeOf<true>()
  })

  it('has no dangerouslySetInnerHTML, because the root always holds the icon and the body', () => {
    expectTypeOf<Accepts<keyof AlertProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('has no render prop, because an alert rendered as a link would have no drawn states', () => {
    expectTypeOf<Accepts<keyof AlertProps, 'render'>>().toEqualTypeOf<false>()
  })

  it('has none of the props the spec leaves unbuilt', () => {
    expectTypeOf<Accepts<keyof AlertProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AlertProps, 'dismissible'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AlertProps, 'withIcon'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AlertProps, 'onDismiss'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('is derived from the schema input', () => {
    expectTypeOf<AlertDesignProps['variant']>().toEqualTypeOf<AlertVariant | undefined>()
    expectTypeOf<AlertDesignProps['tone']>().toEqualTypeOf<AlertTone | undefined>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof AlertProps, keyof AlertDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills every default from constants.ts', () => {
    expect(alertSchema.parse({})).toEqual({
      variant: ALERT_DEFAULTS.variant,
      tone: ALERT_DEFAULTS.tone,
    })
  })

  it('accepts every value the constants list', () => {
    for (const variant of ALERT_VARIANTS) expect(alertSchema.parse({ variant }).variant).toBe(variant)
    for (const tone of ALERT_TONES) expect(alertSchema.parse({ tone }).tone).toBe(tone)
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(alertSchema.safeParse({ variant: 'ghost' }).success).toBe(false)
    expect(alertSchema.safeParse({ tone: 'brand' }).success).toBe(false)
  })

  it('agrees with the defaults the spec names', () => {
    expect(ALERT_DEFAULTS).toEqual({ variant: 'soft', tone: 'info' })
  })
})
