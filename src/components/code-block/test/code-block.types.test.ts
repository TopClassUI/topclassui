import type { ReactNode } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

import type { Labels } from '#shared/labels/types.js'
import type { CodeBlockCopyProps, CodeBlockDesignProps, CodeBlockProps } from '../types.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the design props', () => {
  it('are the two switches the schema holds', () => {
    expectTypeOf<keyof CodeBlockDesignProps>().toEqualTypeOf<'showCopy' | 'wrap'>()
    expectTypeOf<CodeBlockProps['showCopy']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<CodeBlockProps['wrap']>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('the own props', () => {
  it('children is the code as a string, and required', () => {
    expectTypeOf<CodeBlockProps['children']>().toEqualTypeOf<string>()
    expectTypeOf<Accepts<CodeBlockProps, { lang: 'tsx' }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<CodeBlockProps, { children: ReactNode }>>().toEqualTypeOf<false>()
  })

  it('title and highlighted are nodes; lang is a string, the language and not the HTML lang', () => {
    expectTypeOf<CodeBlockProps['title']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<CodeBlockProps['highlighted']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<CodeBlockProps['lang']>().toEqualTypeOf<string | undefined>()
  })

  it('labels and locale spread from getLabels', () => {
    expectTypeOf<CodeBlockProps['labels']>().toEqualTypeOf<Labels | undefined>()
    expectTypeOf<CodeBlockProps['locale']>().toEqualTypeOf<string | undefined>()
  })

  it('takes no size: CodeBlock has no visual scale', () => {
    expectTypeOf<Accepts<keyof CodeBlockProps, 'size'>>().toEqualTypeOf<false>()
  })
})

describe('the button', () => {
  it('takes only values a Server Component can send', () => {
    expectTypeOf<keyof CodeBlockCopyProps>().toEqualTypeOf<'code' | 'label' | 'copied' | 'failed' | 'titleId'>()
    expectTypeOf<CodeBlockCopyProps['code']>().toEqualTypeOf<string>()
    expectTypeOf<CodeBlockCopyProps['titleId']>().toEqualTypeOf<string | undefined>()
  })
})
