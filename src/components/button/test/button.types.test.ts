import type { ReactElement } from 'react'

import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Size } from '#shared/contracts/size.js'
import { BUTTON_SIZES, BUTTON_TONES, BUTTON_VARIANTS } from '../constants.js'
import { BUTTON_DEFAULTS } from '../constants.js'
import { buttonSchema } from '../schema.js'
import type { ButtonDesignProps, ButtonProps, ButtonTone, ButtonVariant } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the unions come from the constants', () => {
  it('variant is exactly the list', () => {
    expectTypeOf<ButtonVariant>().toEqualTypeOf<'solid' | 'soft' | 'outline' | 'ghost' | 'link'>()
  })

  it('tone is the shared six, so every toned component offers the same set', () => {
    expectTypeOf<ButtonTone>()
      .toEqualTypeOf<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'>()
  })

  it('size is the shared scale including custom', () => {
    expectTypeOf<ButtonProps['size']>().toEqualTypeOf<Size | undefined>()
    expectTypeOf<Accepts<ButtonProps['size'], 'custom'>>().toEqualTypeOf<true>()
  })

  it('rejects a value that is not in the list', () => {
    expectTypeOf<Accepts<ButtonVariant, 'primary'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<ButtonTone, 'brand'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<ButtonProps['size'], 'xxl'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<ButtonVariant, string>>().toEqualTypeOf<false>()
  })
})

describe('the props follow the vocabulary', () => {
  it('uses positive boolean names', () => {
    expectTypeOf<ButtonProps['loading']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<ButtonProps['fullWidth']>().toEqualTypeOf<boolean | undefined>()
  })

  it('accepts className, style and ref, and ref is a normal prop', () => {
    expectTypeOf<ButtonProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<keyof ButtonProps, 'style'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof ButtonProps, 'ref'>>().toEqualTypeOf<true>()
  })

  it('keeps the native button props, so onClick and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof ButtonProps, 'onClick'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof ButtonProps, 'type'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof ButtonProps, 'aria-label'>>().toEqualTypeOf<true>()
  })

  it('takes the element form of render only, which needs no hook on the server', () => {
    expectTypeOf<Accepts<keyof ButtonProps, 'render'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<ButtonProps['render'], () => null>>().toEqualTypeOf<false>()
  })

  it('never exposes a Base UI type name', () => {
    expectTypeOf<Accepts<keyof ButtonProps, 'nativeButton'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the schema cannot drift', () => {
  it('declares the same keys', () => {
    const schemaKeys = Object.keys(buttonSchema.shape).sort()
    expect(schemaKeys).toEqual(['fullWidth', 'loading', 'size', 'tone', 'variant'])
  })

  it('is assignable from the schema input, because it is derived from it', () => {
    expectTypeOf<ButtonDesignProps['variant']>().toEqualTypeOf<ButtonVariant | undefined>()
    expectTypeOf<ButtonDesignProps['tone']>().toEqualTypeOf<ButtonTone | undefined>()
  })

  it('is a subset of the component props, so every design prop is settable', () => {
    expectTypeOf<Accepts<keyof ButtonProps, keyof ButtonDesignProps>>().toEqualTypeOf<true>()
  })
})

describe('the schema', () => {
  it('fills every default from constants.ts', () => {
    expect(buttonSchema.parse({})).toEqual({
      variant: BUTTON_DEFAULTS.variant,
      tone: BUTTON_DEFAULTS.tone,
      size: BUTTON_DEFAULTS.size,
      loading: BUTTON_DEFAULTS.loading,
      fullWidth: BUTTON_DEFAULTS.fullWidth,
    })
  })

  it('accepts every value the constants list', () => {
    for (const variant of BUTTON_VARIANTS) expect(buttonSchema.parse({ variant }).variant).toBe(variant)
    for (const tone of BUTTON_TONES) expect(buttonSchema.parse({ tone }).tone).toBe(tone)
    for (const size of BUTTON_SIZES) expect(buttonSchema.parse({ size }).size).toBe(size)
  })

  it('refuses a value outside the list, which is what the docs table reads as the limit', () => {
    expect(buttonSchema.safeParse({ variant: 'primary' }).success).toBe(false)
    expect(buttonSchema.safeParse({ tone: 'brand' }).success).toBe(false)
    expect(buttonSchema.safeParse({ size: 'xxl' }).success).toBe(false)
    expect(buttonSchema.safeParse({ loading: 'yes' }).success).toBe(false)
  })

  it('agrees with the default the component itself applies', () => {
    expect(BUTTON_DEFAULTS.size).toBe('md')
    expect(BUTTON_DEFAULTS.variant).toBe('solid')
    expect(BUTTON_DEFAULTS.tone).toBe('primary')
  })
})

describe('render changes the element, so the element decides the attributes', () => {
  /** Assignable means the compiler would accept that call. */
  type Given<Props> = Props extends ButtonProps ? true : false

  it('takes the button attributes when it really is a button', () => {
    expectTypeOf<Given<{ type: 'submit'; name: 'n'; value: 'v'; form: 'f' }>>().toEqualTypeOf<true>()
    expectTypeOf<Given<{ formAction: '/x' }>>().toEqualTypeOf<true>()
  })

  it('refuses them once render makes it something else', () => {
    expectTypeOf<Given<{ render: ReactElement; type: 'submit' }>>().toEqualTypeOf<false>()
    expectTypeOf<Given<{ render: ReactElement; name: 'n' }>>().toEqualTypeOf<false>()
    expectTypeOf<Given<{ render: ReactElement; value: 'v' }>>().toEqualTypeOf<false>()
    expectTypeOf<Given<{ render: ReactElement; form: 'f' }>>().toEqualTypeOf<false>()
    expectTypeOf<Given<{ render: ReactElement; formAction: '/x' }>>().toEqualTypeOf<false>()
  })

  it('keeps the attributes every element has, with or without render', () => {
    expectTypeOf<Given<{ render: ReactElement; id: 'x'; className: 'c' }>>().toEqualTypeOf<true>()
    expectTypeOf<Given<{ render: ReactElement; disabled: true; loading: true }>>().toEqualTypeOf<true>()
    expectTypeOf<Given<{ render: ReactElement; tone: 'danger'; size: 'lg' }>>().toEqualTypeOf<true>()
  })
})
