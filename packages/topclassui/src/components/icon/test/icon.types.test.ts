// Type-only imports, so the server-only module is never loaded in this project.
import { describe, expectTypeOf, it } from 'vitest'

import type { IconName } from '#icons/names.generated.js'
import type { SvgProps } from '#components/svg/index.js'
import type { IconProps as RegistryIconProps } from '../../icon-registry/types.js'
import type { IconProps } from '../types.js'

/** Assignability as a value, so a rejected name is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

/** Mutual assignability, which is what "the identical props" means. */
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

describe('IconProps', () => {
  it('accepts a name in the set', () => {
    expectTypeOf<Accepts<IconName, 'arrow-left'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<IconName, 'star-fill'>>().toEqualTypeOf<true>()
  })

  it('rejects a misspelled or absent name, which is the whole point of the union', () => {
    expectTypeOf<Accepts<IconName, 'arrow-lefft'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<IconName, 'rocket'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<IconName, string>>().toEqualTypeOf<false>()
  })

  it('names the prop IconName, so the docs table and the inspector read one type', () => {
    expectTypeOf<IconProps['name']>().toEqualTypeOf<IconName>()
  })

  it('carries every prop of <Svg> except the icon it resolves itself', () => {
    expectTypeOf<Same<IconProps, Omit<SvgProps, 'icon'> & { name: IconName }>>().toEqualTypeOf<true>()
  })

  it('takes the five size names, any CSS length, or nothing', () => {
    expectTypeOf<Accepts<IconProps['size'], 'md'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<IconProps['size'], '2.5rem'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<IconProps['size'], 24>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<IconProps['size'], undefined>>().toEqualTypeOf<true>()
  })

  it('keeps label and flipRtl optional, so a decorative icon needs no props', () => {
    expectTypeOf<IconProps['label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<IconProps['flipRtl']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('the two twins', () => {
  it('share one IconProps, so R-5.1-5 cannot drift', () => {
    expectTypeOf<RegistryIconProps>().toEqualTypeOf<IconProps>()
  })
})
